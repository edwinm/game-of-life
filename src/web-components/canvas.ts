import { $ } from 'carbonium';
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
  private isDragging = false;
  private isMouseDown = false;

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

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
    this.canvasDomElement = $('#canvas', this.shadowRoot);

    if (!this.canvasDomElement.getContext) {
      return;
    }

    try {
      let rect = this.canvasDomElement.getBoundingClientRect();
      this.offscreen = new OffscreenCanvas(rect.width, rect.height);
      this.ctx = this.offscreen.getContext('2d', {alpha: false});
      this.ctxOffscreen = this.canvasDomElement.getContext('bitmaprenderer');
    } catch (e) {
      this.ctx = this.canvasDomElement.getContext('2d', {alpha: false});
    }

    this.setDragging();
  }

  getObservers() {
    return {
      click$: this.click$.observable(),
      dimension$: this.dimension$.observable(),
      offset$: this.offset$.observable()
    };
  }

  setDragging() {
    fromEvent(this.canvasDomElement, 'mousedown').subscribe((event: MouseEvent) => {
      this.dragStart = {x: event.x, y: event.y};
      this.isMouseDown = true;
    });

    fromEvent(this.canvasDomElement, 'mouseup').subscribe((event: MouseEvent) => {
      this.isMouseDown = false;
      this.drag$.dispatch({x: 0, y: 0});
      this.offset$.dispatch({
        x: Math.round((event.x - this.dragStart.x) / this.cellSize),
        y: Math.round((event.y - this.dragStart.y) / this.cellSize)
      });
      if (!this.isDragging) {
        const canvasRect = this.canvasDomElement.getBoundingClientRect();
        this.click$.dispatch(<Cell>{
          x: Math.floor((event.x - canvasRect.left - 2) / this.cellSize),
          y: Math.floor((event.y - canvasRect.top - 3) / this.cellSize)
        })
      }
      this.isDragging = false;
    });

    fromEvent(this.canvasDomElement, 'mousemove').subscribe((event: MouseEvent) => {
      if (this.isMouseDown) {
        const dragX = event.x - this.dragStart.x;
        const dragY = event.y - this.dragStart.y;
        this.isDragging = Math.abs(dragX) > 5 || Math.abs(dragY) > 5;
        if (this.isDragging) {
          this.drag$.dispatch({x: dragX, y: dragY});
        }
      }
    });

    this.drag$.subscribe(({x, y}) => {
      this.canvasDomElement.style.setProperty('--cursor', (x == 0 && y == 0) ? 'auto' : 'grab')
    });
  }

  setObservers(redraw$: Observable<Cell[]>, resize$: Observable<Event>, size$: Observable<number>) {
    combine(redraw$, this.drag$).subscribe(([cells, drag = {x: 0, y: 0}]) => {
      this.draw(cells, drag);
    });

    resize$.subscribe(() => {
      this.calculateDimensions();
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
    ctx.fillRect(0, 0, this.canvasDomElement.width + this.cellSize, this.canvasDomElement.height);
    ctx.strokeStyle = "#999";

    for (let n = drag.x % this.cellSize; n <= this.canvasDomElement.width; n += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(n + .5, 0);
      ctx.lineTo(n + .5, this.canvasDomElement.height);
      ctx.stroke();
    }
    for (let n = drag.y % this.cellSize; n <= this.canvasDomElement.height; n += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, n + .5);
      ctx.lineTo(this.canvasDomElement.width, n + .5);
      ctx.stroke();
    }

    ctx.fillStyle = "yellow";
    ctx.lineWidth = 1;
    cells.forEach((cell) => {
      ctx.fillRect(cell.x * size + 1 + drag.x, cell.y * size + 1 + drag.y, size - 1, size - 1);
    });

    if (this.ctxOffscreen) {
      const bitmap = this.offscreen.transferToImageBitmap();
      this.ctxOffscreen.transferFromImageBitmap(bitmap);
    }
  }

  private calculateDimensions() {
    const pixelWidth = document.documentElement.clientWidth - 20;
    const pixelHeight = document.documentElement.clientHeight - 120 - $('gof-controls').clientHeight;
    const widthMod = (pixelWidth % this.cellSize) / 2;
    this.canvasDomElement.style.setProperty('--width-mod', `${widthMod}px`);
    this.canvasDomElement.width = pixelWidth - pixelWidth % this.cellSize + 1;
    this.canvasDomElement.height = pixelHeight - pixelHeight % this.cellSize + 1;
    if (this.ctxOffscreen) {
      this.offscreen = new OffscreenCanvas(this.canvasDomElement.width, this.canvasDomElement.height);
      this.ctx = this.offscreen.getContext('2d', {alpha: false});
    }

    this.dimension$.dispatch({
      width: Math.floor(this.canvasDomElement.width / this.cellSize),
      height: Math.floor(this.canvasDomElement.height / this.cellSize)
    });
  }

  private setCellSize(size: number) {
    this.cellSize = size;
    this.calculateDimensions();
  }
}

customElements.define('gof-canvas', GofCanvas);


