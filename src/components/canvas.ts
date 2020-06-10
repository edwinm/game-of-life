import { $ } from 'carbonium';
import { Cuprum } from "cuprum";

export class GofCanvas extends HTMLElement implements CustomElement {
  private canvasDomElement: HTMLCanvasElement;
  private offscreen: OffscreenCanvas;
  private ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  private ctxOffscreen: ImageBitmapRenderingContext;
  private cellSize: number;
  private pixelWidth: number;
  private pixelHeight: number;
  private width: number;
  private height: number;
  dimension$: Cuprum<Dimension>;
  click$: Cuprum<ClickEvent>;

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          background: #7e7e7e;
        }
        #canvas{
          flex: 1 1;
          margin-left: var(--width-mod, 0);
        }
      </style>
      
      <canvas id="canvas"></canvas>
    `;

  }

  connectedCallback() {
    this.dimension$ = new Cuprum<Dimension>();
    this.click$ = new Cuprum<ClickEvent>();

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

    this.setCellSize(11);
    this.calculateDimensions();
  }

  init(redraw$: Cuprum<Cell[]>, resize$: Cuprum<Event>, size$: Cuprum<number>) {
    redraw$.subscribe((cells) => {
      this.draw(cells);
    });

    resize$.subscribe(() => {
      this.calculateDimensions();
    });

    size$.subscribe((newGridSize) => {
      this.setCellSize(newGridSize);
    });

    this.canvasDomElement.addEventListener('click', (event) => {
      this.action(event);
    });
  }

  draw(cells: Cell[]) {
    const ctx = this.ctx;
    const size = this.cellSize;

    ctx.fillStyle = "#7e7e7e";
    ctx.lineWidth = 1;
    ctx.fillRect(0, 0, this.pixelWidth + this.cellSize, this.pixelHeight);
    ctx.strokeStyle = "#999";

    for (let n = 0; n <= this.pixelWidth; n += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(n + .5, 0);
      ctx.lineTo(n + .5, this.pixelHeight);
      ctx.stroke();
    }
    for (let n = this.cellSize; n < this.pixelHeight; n += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, n + .5);
      ctx.lineTo(this.pixelWidth, n + .5);
      ctx.stroke();
    }

    ctx.fillStyle = "yellow";
    ctx.lineWidth = 1;
    cells.forEach(function (cell) {
      ctx.fillRect(cell[0] * size + 1, cell[1] * size + 1, size - 1, size - 1);
    });

    if (this.ctxOffscreen) {
      const bitmap = this.offscreen.transferToImageBitmap();
      this.ctxOffscreen.transferFromImageBitmap(bitmap);
    }
  }

  calculateDimensions() {
    const rect = this.canvasDomElement.getBoundingClientRect();
    const pixelWidth = document.documentElement.clientWidth;
    const pixelHeight = rect.height;
    const widthMod = (pixelWidth % this.cellSize) / 2;
    this.canvasDomElement.style.setProperty('--width-mod', `${widthMod}px`);
    this.pixelWidth = this.canvasDomElement.width = pixelWidth;
    this.pixelHeight = this.canvasDomElement.height = pixelHeight - pixelHeight % this.cellSize;

    if (this.ctxOffscreen) {
      this.offscreen = new OffscreenCanvas(this.pixelWidth, this.pixelHeight);
      this.ctx = this.offscreen.getContext('2d', {alpha: false});
    }

    this.setDimension(Math.floor(this.pixelWidth / this.cellSize), Math.floor(this.pixelHeight / this.cellSize));
  }

  action(event: MouseEvent) {
    const canvasRect = this.canvasDomElement.getBoundingClientRect();
    const clickEvent = <ClickEvent>{
      cellX: Math.floor((event.clientX - canvasRect.left - 2) / this.cellSize),
      cellY: Math.floor((event.clientY - canvasRect.top - 5) / this.cellSize)
    };
    this.click$.dispatch(clickEvent);
  }

  setCellSize(size: number) {
    this.cellSize = size;
    this.setDimension(Math.floor(this.pixelWidth / size), Math.floor(this.pixelHeight / size));
  }

  setDimension(width: number, height: number) {
    if (width && height) {
      this.width = width;
      this.height = height;
      this.dimension$.dispatch({width: width, height: height});
    }
  }
}

customElements.define('gof-canvas', GofCanvas);

