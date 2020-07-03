import { $ } from "carbonium";
import { Cuprum, fromEvent, Observable, combine } from "cuprum";
import { CustomElement, define } from "../components/web-component-decorator";
import { Draw } from "../models/draw";

@define("gof-canvas")
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
  private initialPattern$ = new Cuprum<string>();
  private dragStart = <Offset>{ x: 0, y: 0 };
  private sizeStart: number;
  private distStart: number;
  private lastSize = -1;
  private lastTouch: Offset;
  private isDragging = false;
  private isMouseDown = false;
  private lastTouchCount = 0;

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

    setTimeout(() => {
      this.initialPattern$.dispatch(this.textContent);
    }, 0);
  }

  getObservers() {
    return {
      click$: this.click$.observable(),
      dimension$: this.dimension$.observable(),
      offset$: this.offset$.observable(),
      initialPattern$: this.initialPattern$.observable(),
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
          const x = event.x - this.dragStart.x;
          const y = event.y - this.dragStart.y;
          this.isDragging = Math.abs(x) > 5 || Math.abs(y) > 5;
          if (this.isDragging) {
            this.drag$.dispatch({ x, y });
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

        if (event.touches.length == 2) {
          if (this.lastTouchCount == 0) {
            this.dragStart = { ...this.lastTouch };
          }
          this.dragStart.x +=
            (event.touches[0].clientX + event.touches[1].clientX) / 2 -
            event.touches[0].clientX;
          this.dragStart.y +=
            (event.touches[0].clientY + event.touches[1].clientY) / 2 -
            event.touches[0].clientY;

          this.distStart = Math.sqrt(
            (event.touches[1].clientX - event.touches[0].clientX) *
              (event.touches[1].clientX - event.touches[0].clientX) +
              (event.touches[1].clientY - event.touches[0].clientY) *
                (event.touches[1].clientY - event.touches[0].clientY)
          );
          if (this.lastSize == -1) {
            this.lastSize = this.distStart;
          }
          this.sizeStart = this.cellSize / this.distStart;
          this.lastTouch = {
            x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
            y: (event.touches[0].clientY + event.touches[1].clientY) / 2,
          };
        } else {
          // One touch
          this.dragStart = { ...this.lastTouch };
        }
        this.lastTouchCount = event.touches.length;
      }
    );

    fromEvent(this.canvasDomElement, "touchmove").subscribe(
      (event: TouchEvent) => {
        if (event.touches.length == 1) {
          this.lastTouch = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };

          this.drag$.dispatch({
            x: this.lastTouch.x - this.dragStart.x,
            y: this.lastTouch.y - this.dragStart.y,
          });
        } else if (event.touches.length == 2) {
          this.lastTouch = {
            x: (event.touches[0].clientX + event.touches[1].clientX) / 2,
            y: (event.touches[0].clientY + event.touches[1].clientY) / 2,
          };

          this.lastSize = Math.sqrt(
            (event.touches[1].clientX - event.touches[0].clientX) *
              (event.touches[1].clientX - event.touches[0].clientX) +
              (event.touches[1].clientY - event.touches[0].clientY) *
                (event.touches[1].clientY - event.touches[0].clientY)
          );

          let newCellSize = this.lastSize * this.sizeStart;
          if (newCellSize < 2) {
            newCellSize = 2;
            this.lastSize = newCellSize / this.sizeStart;
          }
          if (newCellSize > 40) {
            newCellSize = 40;
            this.lastSize = newCellSize / this.sizeStart;
          }
          this.setCellSize(newCellSize, false);

          this.drag$.dispatch({
            x:
              this.lastTouch.x -
              (this.dragStart.x * this.lastSize) / this.distStart,
            y:
              this.lastTouch.y -
              (this.dragStart.y * this.lastSize) / this.distStart,
          });
        }

        event.preventDefault();
      }
    );

    fromEvent(this.canvasDomElement, "touchend").subscribe(
      (event: TouchEvent) => {
        if (event.touches.length == 1) {
          this.dragStart.x =
            (this.dragStart.x * this.lastSize) / this.distStart -
            this.lastTouch.x +
            event.touches[0].clientX;
          this.dragStart.y =
            (this.dragStart.y * this.lastSize) / this.distStart -
            this.lastTouch.y +
            event.touches[0].clientY;

          this.lastTouch = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
        } else if (event.touches.length == 0) {
          this.drag$.dispatch({ x: 0, y: 0 });

          if (this.lastTouchCount == 1) {
            this.offset$.dispatch({
              x: Math.round(
                (this.lastTouch.x - this.dragStart.x) / this.cellSize
              ),
              y: Math.round(
                (this.lastTouch.y - this.dragStart.y) / this.cellSize
              ),
            });
            this.lastSize = -1;
          } else if (this.lastTouchCount == 2) {
            this.offset$.dispatch({
              x: Math.round(
                (this.lastTouch.x -
                  (this.dragStart.x * this.lastSize) / this.distStart) /
                  this.cellSize
              ),
              y: Math.round(
                (this.lastTouch.y -
                  (this.dragStart.y * this.lastSize) / this.distStart) /
                  this.cellSize
              ),
            });
          }
        }
        this.lastTouchCount = event.touches.length;
      }
    );

    fromEvent(this.canvasDomElement, "touchcancel").subscribe(() => {
      this.drag$.dispatch({ x: 0, y: 0 });
      this.offset$.dispatch({ x: 0, y: 0 });
      this.lastTouchCount = 0;
    });

    this.drag$.subscribe(({ x, y }) => {
      this.canvasDomElement.style.setProperty(
        "--cursor",
        x == 0 && y == 0 ? "auto" : "grab"
      );
    });
  }

  setObservers(
    redraw$: Observable<Draw>,
    resize$: Observable<Event>,
    size$: Observable<number>
  ) {
    let timer = null;
    let opacity = 0;

    combine(redraw$, this.drag$).subscribe(
      ([{ pattern, isNew }, drag = { x: 0, y: 0 }], oldDraw) => {
        clearInterval(timer);
        if (drag.x || drag.y) {
          this.draw(pattern, drag, 0.6);
        } else if (isNew) {
          opacity = 0;
          timer = setInterval(() => {
            opacity += 40 / 250;
            if (opacity > 1) {
              this.draw(pattern, drag, 1);
              clearInterval(timer);
            } else {
              this.draw(pattern, drag, opacity);
            }
          }, 40);
        } else if (pattern.length == 0 && oldDraw) {
          opacity = 1;
          const oldPattern = oldDraw[0].pattern;
          timer = setInterval(() => {
            opacity -= 40 / 250;
            if (opacity < 0) {
              this.draw(oldPattern, drag, 0);
              clearInterval(timer);
            } else {
              this.draw(oldPattern, drag, opacity);
            }
          }, 40);
        } else {
          this.draw(pattern, drag);
        }
      }
    );

    resize$.subscribe(() => {
      setTimeout(() => {
        this.calculateDimensions();
      }, 10);
    });

    size$.subscribe((newGridSize) => {
      this.setCellSize(newGridSize);
    });
  }

  private draw(cells: Cell[], drag: Offset, opacity = 1) {
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

    // ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    ctx.fillStyle = `rgba(255, 255, 0, ${opacity})`;
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
      window.requestAnimationFrame(() => {
        this.ctxOffscreen.transferFromImageBitmap(bitmap);
      });
    }
  }

  private calculateDimensions(setDimension = true) {
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

    if (setDimension) {
      this.dimension$.dispatch({
        width: Math.floor(this.canvasDomElement.width / this.cellSize),
        height: Math.floor(this.canvasDomElement.height / this.cellSize),
      });
    }
  }

  private setCellSize(size: number, setDimension = true) {
    this.cellSize = size;
    this.calculateDimensions(setDimension);
  }
}
