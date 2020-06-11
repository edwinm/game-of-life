import { $ } from 'carbonium';
import { fromEvent, Cuprum, merge, Observable } from "cuprum";
import { gofNext } from "../components/gameoflife";

export class GofControls extends HTMLElement implements CustomElement {
  private started: boolean;
  private timer: NodeJS.Timeout;
  private generation: number;
  private speed: number;
  private collection: Collection;
  private redraw$: Observable<Cell[]>;

  private size$: Cuprum<number>;
  private newShape$: Cuprum<Cell[]>;
  private nextShape$: Cuprum<Cell[]>;
  private nextGeneration$: Cuprum<Event>;
  private resize$: Cuprum<Event>;
  private info$: Cuprum<Event>;

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
          margin: 0 5vw;
        }
        
        form > * {
          margin: 10px 0;
        }
        
        input[type="range"] {
          width: 80px;
        }
        
        .generation {
          font-family: helvetica, arial, sans-serif;
          font-size: smaller;
          margin-left: 2em;
        }
        
        nowrap {
          white-space: nowrap;
        }
        
        nowrap > * {
          vertical-align: middle;
        }
      </style>
      
      <form>
        <select id="shapes" aria-label="Select predefined shape">
        </select>
        <input id="next" type="button" value="Next">
        <input id="start" type="button" value="Start">
        <label class="generation" title="Generations" aria-label="Generations">0</label>
        <nowrap>
          <img src="pix/speeddial.svg" alt="" width="20" height="20">
          <input id="speed" type="range" min="0" max="100" value="50" title="Speed dial" aria-label="Speed dial">
        </nowrap>
        <nowrap>
          <img src="pix/grid.svg" alt="" width="20" height="20">
          <input id="size" type="range" min="0" max="100" value="58" title="Grid size" aria-label="Grid size">
        </nowrap>
        <input id="info" type="button" value="Explanation">
      </form>
    `;
  }

  connectedCallback() {
    this.started = false;
    this.timer = null;
    this.generation = 0;
    this.collection = this.getCollection();
    this.newShape$ = new Cuprum<Cell[]>();
    this.nextShape$ = new Cuprum<Cell[]>();
    this.nextGeneration$ = new Cuprum<Event>();
    this.resize$ = fromEvent(window, 'resize');
    this.info$ = fromEvent($('#info', this.shadowRoot), 'click');

    const shapesSelect = $('#shapes', this.shadowRoot);
    this.collection.forEach((shape) => {
      const option = document.createElement('option');
      option.text = shape.name;
      shapesSelect.appendChild(option);
    });

    fromEvent(shapesSelect, 'change').subscribe((event) => {
      this.setGeneration(0);
      this.newShape$.dispatch(this.collection[(<HTMLSelectElement>event.target).selectedIndex].data);
    });

    $('#shapes', this.shadowRoot).selectedIndex = 1;
    this.newShape$.dispatch(this.collection[1].data);

    this.nextGeneration$ = fromEvent($('#next', this.shadowRoot), 'click');

    const speed = $('#speed', this.shadowRoot);
    merge(
      fromEvent(speed, 'input').map((event) => Number((<HTMLInputElement>event.target).value)),
      new Cuprum<number>().dispatch(speed.value)
    ).subscribe((value) => {
      this.speed = 1000 - Math.sqrt(value) * 99;
      if (this.started) {
        this.play();
      }
    });

    const size = $('#size', this.shadowRoot);
    this.size$ = merge(
      fromEvent(size, 'input').map(event => Number((<HTMLInputElement>event.target).value)),
      new Cuprum<number>().dispatch(size.value)
    ).map((value) => Math.round(2 + 38 / 100 * value));

    fromEvent($('#start', this.shadowRoot), 'click').subscribe((event) => {
      this.started = !this.started;
      if (this.started) {
        (<HTMLInputElement>event.target).value = 'Stop';
        this.play();
      } else {
        (<HTMLInputElement>event.target).value = 'Start';
        clearInterval(this.timer);
      }
    })

    this.nextGeneration$.subscribe(() => {
      let shape = this.redraw$.value();
      shape = gofNext(shape);
      this.nextShape$.dispatch(shape);

      this.setGeneration(this.generation + 1);
    });
  }

  getObservers() {
    return {
      newShape$: this.newShape$.observable(),
      nextShape$: this.nextShape$.observable(),
      resize$: this.resize$.observable(),
      size$: this.size$.observable(),
      info$: this.info$.observable()
    };
  }

  setObservers(redraw$: Observable<Cell[]>, toggle$: Observable<Cell>) {
    this.redraw$ = redraw$;

    toggle$.subscribe(() => {
      this.setGeneration(0);
    });
  }

  setGeneration(gen: number) {
    this.generation = gen;
    $('.generation', this.shadowRoot).textContent = gen.toString(10);
  }

  play() {
    clearInterval(this.timer);
    this.timer = setInterval((event) => {
      this.nextGeneration$.dispatch(event);
    }, this.speed);
  }

  getCollection() {
    return <Collection>[
      {name: "Clear", data: []},
      {name: "Glider", data: [{x: 1, y: 0}, {x: 2, y: 1}, {x: 2, y: 2}, {x: 1, y: 2}, {x: 0, y: 2}]},
      {
        name: "Small Exploder",
        data: [{x: 0, y: 1}, {x: 0, y: 2}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 3}, {x: 2, y: 1}, {x: 2, y: 2}]
      },
      {
        name: "Exploder",
        data: [{x: 0, y: 0}, {x: 0, y: 1}, {x: 0, y: 2}, {x: 0, y: 3}, {x: 0, y: 4}, {x: 2, y: 0}, {x: 2, y: 4}, {
          x: 4,
          y: 0
        }, {x: 4, y: 1}, {x: 4, y: 2}, {x: 4, y: 3}, {x: 4, y: 4}],
      },
      {
        name: "10 Cell Row",
        data: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 4, y: 0}, {x: 5, y: 0}, {x: 6, y: 0}, {
          x: 7,
          y: 0
        }, {x: 8, y: 0}, {x: 9, y: 0}]
      },
      {
        name: "Lightweight spaceship",
        data: [{x: 0, y: 1}, {x: 0, y: 3}, {x: 1, y: 0}, {x: 2, y: 0}, {x: 3, y: 0}, {x: 3, y: 3}, {x: 4, y: 0}, {
          x: 4,
          y: 1
        }, {x: 4, y: 2}],
      },
      {
        name: "Tumbler",
        data: [{x: 0, y: 3}, {x: 0, y: 4}, {x: 0, y: 5}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 5}, {x: 2, y: 0}, {
          x: 2,
          y: 1
        }, {x: 2, y: 2}, {x: 2, y: 3}, {x: 2, y: 4}, {x: 4, y: 0}, {x: 4, y: 1}, {x: 4, y: 2}, {x: 4, y: 3}, {
          x: 4,
          y: 4
        }, {x: 5, y: 0}, {x: 5, y: 1}, {x: 5, y: 5}, {x: 6, y: 3}, {x: 6, y: 4}, {x: 6, y: 5}],
      },
      {
        name: "Gosper Glider Gun",
        data: [{x: 0, y: 2}, {x: 0, y: 3}, {x: 1, y: 2}, {x: 1, y: 3}, {x: 8, y: 3}, {x: 8, y: 4}, {x: 9, y: 2}, {
          x: 9,
          y: 4
        }, {x: 10, y: 2}, {x: 10, y: 3}, {x: 16, y: 4}, {x: 16, y: 5}, {x: 16, y: 6}, {x: 17, y: 4}, {
          x: 18,
          y: 5
        }, {x: 22, y: 1}, {x: 22, y: 2}, {x: 23, y: 0}, {x: 23, y: 2}, {x: 24, y: 0}, {x: 24, y: 1}, {
          x: 24,
          y: 12
        }, {x: 24, y: 13}, {x: 25, y: 12}, {x: 25, y: 14}, {x: 26, y: 12}, {x: 34, y: 0}, {x: 34, y: 1}, {
          x: 35,
          y: 0
        }, {x: 35, y: 1}, {x: 35, y: 7}, {x: 35, y: 8}, {x: 35, y: 9}, {x: 36, y: 7}, {x: 37, y: 8}],
      }
    ];
  }
}

customElements.define('gof-controls', GofControls);

