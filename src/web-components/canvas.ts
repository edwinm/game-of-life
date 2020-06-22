import { $ } from "carbonium";
import { Cuprum, fromEvent, Observable, combine } from "cuprum";

export class GofCanvas extends HTMLElement implements CustomElement {
  private canvasDomElement: HTMLCanvasElement;
  private offscreen: OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private ctxOffscreen: ImageBitmapRenderingContext;
  private cellSize: number;
  private dimension$ = new Cuprum<Dimension>();
  private offset$ = new Cuprum<Cell>();
  private click$ = new Cuprum<Cell>();
  private drag$ = new Cuprum<Offset>();
  private dragStart: Offset;
  private lastTouch: Offset;
  private isDragging = false;
  private isMouseDown = false;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        #canvas{
          margin-left: var(--width-mod, 0);
          cursor: var(--cursor, auto);
        }
      </style>
      
      <canvas id="canvas"></canvas>
    `;
  }

  connectedCallback() {
    this.canvasDomElement = $("#canvas", this.shadowRoot);

    try {
      let rect = this.canvasDomElement.getBoundingClientRect();
      this.offscreen = new OffscreenCanvas(rect.width, rect.height);
      this.ctx = this.offscreen.getContext("2d", { alpha: false });
      this.ctxOffscreen = this.canvasDomElement.getContext("bitmaprenderer");
    } catch (e) {
      this.ctx = this.canvasDomElement.getContext("2d", { alpha: false });
    }

    this.setDragging();
  }

  getObservers() {
    return {
      click$: this.click$.observable(),
      dimension$: this.dimension$.observable(),
      offset$: this.offset$.observable(),
    };
  }

  setDragging() {
    fromEvent(this.canvasDomElement, "mousedown").subscribe(
      (event: MouseEvent) => {
        this.dragStart = { x: event.x, y: event.y };
        this.isMouseDown = true;
      }
    );

    fromEvent(this.canvasDomElement, "mouseup").subscribe(
      (event: MouseEvent) => {
        this.isMouseDown = false;
        this.drag$.dispatch({ x: 0, y: 0 });
        this.offset$.dispatch({
          x: Math.round((event.x - this.dragStart.x) / this.cellSize),
          y: Math.round((event.y - this.dragStart.y) / this.cellSize),
        });
        if (!this.isDragging) {
          const canvasRect = this.canvasDomElement.getBoundingClientRect();
          this.click$.dispatch(<Cell>{
            x: Math.floor((event.x - canvasRect.left - 2) / this.cellSize),
            y: Math.floor((event.y - canvasRect.top - 3) / this.cellSize),
          });
        }
        this.isDragging = false;
      }
    );

    fromEvent(this.canvasDomElement, "mousemove").subscribe(
      (event: MouseEvent) => {
        if (this.isMouseDown) {
          const dragX = event.x - this.dragStart.x;
          const dragY = event.y - this.dragStart.y;
          this.isDragging = Math.abs(dragX) > 5 || Math.abs(dragY) > 5;
          if (this.isDragging) {
            this.drag$.dispatch({ x: dragX, y: dragY });
          }
        }
      }
    );

    fromEvent(this.canvasDomElement, "touchstart").subscribe(
      (event: TouchEvent) => {
        this.lastTouch = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
        this.dragStart = { x: this.lastTouch.x, y: this.lastTouch.y };
      }
    );

    fromEvent(this.canvasDomElement, "touchmove").subscribe(
      (event: TouchEvent) => {
        this.lastTouch = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
        this.drag$.dispatch({
          x: this.lastTouch.x - this.dragStart.x,
          y: this.lastTouch.y - this.dragStart.y,
        });
        event.preventDefault();
      }
    );

    fromEvent(this.canvasDomElement, "touchend").subscribe(() => {
      this.drag$.dispatch({ x: 0, y: 0 });
      this.offset$.dispatch({
        x: Math.round((this.lastTouch.x - this.dragStart.x) / this.cellSize),
        y: Math.round((this.lastTouch.y - this.dragStart.y) / this.cellSize),
      });
    });

    fromEvent(this.canvasDomElement, "touchcancel").subscribe(() => {
      this.drag$.dispatch({ x: 0, y: 0 });
      this.offset$.dispatch({ x: 0, y: 0 });
    });

    this.drag$.subscribe(({ x, y }) => {
      this.canvasDomElement.style.setProperty(
        "--cursor",
        x == 0 && y == 0 ? "auto" : "grab"
      );
    });
  }

  setObservers(
    redraw$: Observable<Cell[]>,
    resize$: Observable<[Event, Event]>,
    size$: Observable<number>
  ) {
    combine(redraw$, this.drag$).subscribe(([cells, drag = { x: 0, y: 0 }]) => {
      this.draw(cells, drag);
    });

    resize$.subscribe(() => {
      setTimeout(() => {
        this.calculateDimensions();
      }, 10);
    });

    size$.subscribe((newGridSize) => {
      this.setCellSize(newGridSize);
    });
  }

  private draw(cells: Cell[], drag: Offset) {
    const ctx = this.ctx;
    const size = this.cellSize;

    ctx.fillStyle = "#7e7e7e";
    ctx.lineWidth = 1;
    ctx.fillRect(
      0,
      0,
      this.canvasDomElement.width + this.cellSize,
      this.canvasDomElement.height
    );
    ctx.strokeStyle = "#999";

    for (
      let n = drag.x % this.cellSize;
      n <= this.canvasDomElement.width;
      n += this.cellSize
    ) {
      ctx.beginPath();
      ctx.moveTo(n + 0.5, 0);
      ctx.lineTo(n + 0.5, this.canvasDomElement.height);
      ctx.stroke();
    }
    for (
      let n = drag.y % this.cellSize;
      n <= this.canvasDomElement.height;
      n += this.cellSize
    ) {
      ctx.beginPath();
      ctx.moveTo(0, n + 0.5);
      ctx.lineTo(this.canvasDomElement.width, n + 0.5);
      ctx.stroke();
    }

    ctx.fillStyle = "yellow";
    ctx.lineWidth = 1;
    cells.forEach((cell) => {
      ctx.fillRect(
        cell.x * size + 1 + drag.x,
        cell.y * size + 1 + drag.y,
        size - 1,
        size - 1
      );
    });

    if (this.ctxOffscreen) {
      const bitmap = this.offscreen.transferToImageBitmap();
      this.ctxOffscreen.transferFromImageBitmap(bitmap);
    }
  }

  private calculateDimensions() {
    let controlHeightFix = 20;
    if (window.matchMedia("(display-mode: standalone)").matches) {
      if (window.matchMedia("(max-width: 650px)").matches) {
        controlHeightFix -= 40;
      } else {
        controlHeightFix += 40;
      }
    } else {
      if (window.matchMedia("(max-width: 650px)").matches) {
        controlHeightFix += 25;
      } else if (window.matchMedia("(max-height: 650px)").matches) {
        controlHeightFix += 50;
      }
    }
    const pixelWidth = window.innerWidth - 20;
    const pixelHeight =
      window.innerHeight -
      $("header").offsetHeight -
      $("gof-controls").offsetHeight -
      controlHeightFix;
    const widthMod = (pixelWidth % this.cellSize) / 2;
    this.canvasDomElement.style.setProperty("--width-mod", `${widthMod}px`);
    this.canvasDomElement.width = pixelWidth - (pixelWidth % this.cellSize) + 1;
    this.canvasDomElement.height =
      pixelHeight - (pixelHeight % this.cellSize) + 1;
    if (this.ctxOffscreen) {
      this.offscreen = new OffscreenCanvas(
        this.canvasDomElement.width,
        this.canvasDomElement.height
      );
      this.ctx = this.offscreen.getContext("2d", { alpha: false });
    }

    this.dimension$.dispatch({
      width: Math.floor(this.canvasDomElement.width / this.cellSize),
      height: Math.floor(this.canvasDomElement.height / this.cellSize),
    });
  }

  private setCellSize(size: number) {
    this.cellSize = size;
    this.calculateDimensions();
  }
}

customElements.define("gof-canvas", GofCanvas);
