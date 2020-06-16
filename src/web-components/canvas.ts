import { $ } from 'carbonium';
import { Cuprum, fromEvent, Observable } from "cuprum";

export class GofCanvas extends HTMLElement implements CustomElement {
  private canvasDomElement: HTMLCanvasElement;
  private offscreen: OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private ctxOffscreen: ImageBitmapRenderingContext;
  private cellSize: number;
  private dimension$: Cuprum<Dimension>;
  private click$: Cuprum<Cell>;

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.shadowRoot.innerHTML = `
      <style>
        #canvas{
          border: 1px #999;
          border-style: none solid solid none;
          margin-left: var(--width-mod, 0);
        }
      </style>
      
      <canvas id="canvas"></canvas>
    `;

  }

  connectedCallback() {
    this.dimension$ = new Cuprum<Dimension>();
    this.click$ = new Cuprum<Cell>();

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
  }

  getObservers() {
    const click$ = fromEvent(this.canvasDomElement, 'click')
      .map((event: MouseEvent) => {
        const canvasRect = this.canvasDomElement.getBoundingClientRect();
        return <Cell>{
          x: Math.floor((event.clientX - canvasRect.left - 2) / this.cellSize),
          y: Math.floor((event.clientY - canvasRect.top - 3) / this.cellSize)
        };
      });

    return {click$: click$.observable(), dimension$: this.dimension$.observable()};
  }

  setObservers(redraw$: Observable<Cell[]>, resize$: Observable<Event>, size$: Observable<number>) {
    redraw$.subscribe((cells) => {
      this.draw(cells);
    });

    resize$.subscribe(() => {
      this.calculateDimensions();
    });

    size$.subscribe((newGridSize) => {
      this.setCellSize(newGridSize);
    });
  }

  private draw(cells: Cell[]) {
    const ctx = this.ctx;
    const size = this.cellSize;

    ctx.fillStyle = "#7e7e7e";
    ctx.lineWidth = 1;
    ctx.fillRect(0, 0, this.canvasDomElement.width + this.cellSize, this.canvasDomElement.height);
    ctx.strokeStyle = "#999";

    for (let n = 0; n < this.canvasDomElement.width; n += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(n + .5, 0);
      ctx.lineTo(n + .5, this.canvasDomElement.height);
      ctx.stroke();
    }
    for (let n = 0; n < this.canvasDomElement.height; n += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, n + .5);
      ctx.lineTo(this.canvasDomElement.width, n + .5);
      ctx.stroke();
    }

    ctx.fillStyle = "yellow";
    ctx.lineWidth = 1;
    cells.forEach(function (cell) {
      ctx.fillRect(cell.x * size + 1, cell.y * size + 1, size - 1, size - 1);
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
    this.canvasDomElement.width = pixelWidth - pixelWidth % this.cellSize;
    this.canvasDomElement.height = pixelHeight - pixelHeight % this.cellSize;
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

