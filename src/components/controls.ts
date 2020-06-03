import { $ } from 'carbonium';
import { GofCanvas } from "./canvas";
import { Shape } from "./shape";
import { GofGameOfLife } from "./gameoflife";
import { GofInfo } from "./info";

export class GofControls extends HTMLElement {
  canvas: GofCanvas;
  shape: Shape;
  gameoflife: GofGameOfLife;
  started: boolean;
  timer: NodeJS.Timeout;
  generation: number;
  generationElement: HTMLElement;
  speed: number;

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content:  center;
          flex-wrap: wrap;
          align-items:  center;
        }
        
        img {
          vertical-align: bottom;
          margin-left: 30px;
        }
        
        :host > * {
          margin: 0 0.5vw;
        }
        
        input[type="range"] {
          width: 80px;
          vertical-align: bottom;
        }
        
        .generation {
          font-family: helvetica, arial, sans-serif;
          font-size: smaller;
          margin-left: 2em;
        }
      </style>
      
      <form>
        <select id="shapes">
        </select>
        <input id="next" type="button" value="Next">
        <input id="start" type="button" value="Start">
        <label class="generation" title="Generations" aria-label="Generations">0</label>
        <nowrap>
          <img src="pix/speeddial.svg" alt="" width="20" height="20">
          <input id="speed" type="range" min="10" max="500" step="49" value="10" title="Speed dial" aria-label="Speed dial">
        </nowrap>
        <nowrap>
          <img src="pix/grid.svg" alt="" width="20" height="20">
          <input id="size" type="range" min="2" max="11" value="2" title="Grid size" aria-label="Grid size">
        </nowrap>
        <input id="info" type="button" value="Info">
      </form>
    `;
  }

  connectedCallback() {

  }

  construct(canvas: GofCanvas, shape: Shape, gameoflife: GofGameOfLife, info: GofInfo) {
    this.canvas = canvas;
    this.shape = shape;
    this.gameoflife = gameoflife;
    this.started = false;
    this.timer = null;
    this.generation = 0;
    this.generationElement = $('.generation', this.shadowRoot);

    $('#info', this.shadowRoot).addEventListener('click', () => info.open());
  }

  init(shapes: Collection) {
    var shapesSelect = $('#shapes', this.shadowRoot);
    shapes.forEach((shape, i) => {
      var option = document.createElement('option');
      option.text = shape.name;
      shapesSelect.appendChild(option);
    });
    shapesSelect.addEventListener('change', (e) => {
      this.setGeneration(0);
      this.shape.copy(shapes[shapesSelect.selectedIndex].data);
      this.shape.center();
      this.shape.redraw();
    });

    $('#next', this.shadowRoot).addEventListener('click', () => {
      this.next();
    });

    $('#size', this.shadowRoot)
      .addEventListener('change', sizeListener.bind(this))
      .addEventListener('input', sizeListener.bind(this));

    function sizeListener() {
      var oldGridSize = this.canvas.getGridSize();
      var newGridSize = 13 - parseInt($('#size', this.shadowRoot).value);
      var dimension = this.canvas.getDimension();

      var dx = Math.round((dimension.width / newGridSize - dimension.width / oldGridSize) / 2);
      var dy = Math.round((dimension.height / newGridSize - dimension.height / oldGridSize) / 2);

      this.shape.offset(dx, dy);
      this.canvas.setGridSize(newGridSize);
      this.shape.redraw();
    }

    var speed = $('#speed', this.shadowRoot);
    this.speed = 520 - parseInt(speed.value);
    speed.addEventListener('change', speedListener.bind(this));
    speed.addEventListener('input', speedListener.bind(this));

    function speedListener() {
      this.speed = 520 - parseInt(speed.value);
      if (this.started) {
        this.animate1();
      }
    }

    var startStop = $('#start', this.shadowRoot);
    startStop.addEventListener('click', () => {
      this.started = !this.started;
      if (this.started) {
        startStop.value = 'Stop';
        this.animate1();
      } else {
        startStop.value = 'Start';
        clearInterval(this.timer);
      }
    });

    this.canvas.action((evt) => {
      this.setGeneration(0);
      this.shape.toggle([evt.cellX, evt.cellY]);
    });
  }

  setGeneration(gen: number) {
    this.generation = gen;
    this.generationElement.innerHTML = gen.toString(10);
  }

  animate1() {
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.next();
    }, this.speed);
  }

  next() {
    var shape = this.shape.get();
    shape = this.gameoflife.next(shape);
    this.shape.set(shape);
    this.shape.redraw();
    this.setGeneration(this.generation + 1);
  }
}

customElements.define('gof-controls', GofControls);

