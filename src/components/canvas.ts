import { $ } from 'carbonium';

export class GofCanvas extends HTMLElement {
  canvasDomElement: HTMLCanvasElement;
  offscreen: OffscreenCanvas;
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  ctxOffscreen: ImageBitmapRenderingContext;
  cellSize: number;
  pixelWidth: number;
  pixelHeight: number;
  width: number;
  height: number;
  cellX: number;
  cellY: number;

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          background: green;
        }
        #canvas{
          flex: 1 1;
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
    } catch(e) {
      this.ctx = this.canvasDomElement.getContext('2d', {alpha: false});
    }

    this.setGridSize(11);
    this.calculateDimensions(this.canvasDomElement);
  }

  draw(cells) {
    var ctx = this.ctx;
    var size = this.cellSize;

    ctx.fillStyle = "#7e7e7e";
    ctx.lineWidth = 1;
    ctx.fillRect(0, 0, this.pixelWidth, this.pixelHeight);
    ctx.strokeStyle = "#999";

    for (var n = this.cellSize; n < this.pixelWidth; n += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(n + .5, 0);
      ctx.lineTo(n + .5, this.pixelHeight);
      ctx.stroke();
    }
    for (n = this.cellSize; n < this.pixelHeight; n += this.cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, n + .5);
      ctx.lineTo(this.pixelWidth, n + .5);
      ctx.stroke();
    }

    ctx.fillStyle = "yellow";
    ctx.lineWidth = 1;
    cells.forEach(function (cell, i) {
      ctx.fillRect(cell[0] * size + 1, cell[1] * size + 1, size - 1, size - 1);
    });

    if (this.ctxOffscreen) {
      var bitmap = this.offscreen.transferToImageBitmap();
      this.ctxOffscreen.transferFromImageBitmap(bitmap);
    }
  }

  calculateDimensions(canvasDomElement: HTMLCanvasElement) {
    let rect = canvasDomElement.getBoundingClientRect();
    let width = document.documentElement.clientWidth;
    let height = rect.height;
    let widthMod = width % this.cellSize;
    width = width - widthMod;
    height = height - height % this.cellSize;
    // canvasDomElement.css('left', `${widthMod / 2}px`);
    canvasDomElement.style.left = `${widthMod / 2}px`;
    this.pixelWidth = canvasDomElement.width = width;
    this.pixelHeight = canvasDomElement.height = height;
    this.width = width / this.cellSize;
    this.height = height / this.cellSize;
  }

  action (fn: (evt: ClickEvent)=>void) {
    this.canvasDomElement.addEventListener('click', (evt) => {
      var rect = this.canvasDomElement.getBoundingClientRect();
      var left = Math.floor(rect.left + window.pageXOffset);
      var top = Math.floor(rect.top + window.pageYOffset);
      var cellSize = this.cellSize;
      var clickEvent = <ClickEvent>{};
      clickEvent.cellX = Math.floor((evt.clientX - left + window.pageXOffset) / cellSize);
      clickEvent.cellY = Math.floor((evt.clientY - top + window.pageYOffset - 5) / cellSize); // TODO: Where's offset coming from?
      fn(clickEvent);
    });
  }

  getDimension () {
    return { width: this.pixelWidth, height: this.pixelHeight };
  }
  getGridSize () {
    return this.cellSize;
  }
  setGridSize(size) {
    this.cellSize = size;
    this.width = Math.floor(this.pixelWidth / this.cellSize);
    this.height = Math.floor(this.pixelHeight / this.cellSize);
  }

  getCanvas() {
    return this.canvasDomElement;
  }
}

customElements.define('gof-canvas', GofCanvas);

interface ClickEvent {
  cellX: number;
  cellY: number;
}
