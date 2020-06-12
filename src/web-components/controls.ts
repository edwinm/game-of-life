import { $ } from 'carbonium';
import { fromEvent, Cuprum, merge, Observable, Subscription, interval } from "cuprum";
import { gofNext } from "../components/gameoflife";

export class GofControls extends HTMLElement implements CustomElement {
  private started: boolean;
  private timer: NodeJS.Timeout;
  private timerSubscription: Subscription;
  private generation: number;
  private speed: number;
  private collection: Collection;
  private redraw$: Observable<Cell[]>;

  private size$: Cuprum<number>;
  private newShape$: Cuprum<Cell[]>;
  private nextShape$: Cuprum<Cell[]>;
  private nextGeneration$: Cuprum<void>;
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
          display: inline-block;
          min-width: 40px;
          margin-left: 2em;
          font-family: helvetica, arial, sans-serif;
          font-size: 20px;
        }
        
        nowrap {
          white-space: nowrap;
        }
        
        nowrap > * {
          vertical-align: middle;
        }
        
        #shapes {
          height: 40px;
          padding-left: 20px;
          border: none;
          border-radius: 5px;
          background-color: #2A4E97;
          color: white;
          font-size: 20px;
          box-shadow: 2px 2px 3px hsla(0, 0%, 0%, 0.3);
        }
        
        input[type="range"]::-moz-range-thumb {
          width: 2em !important;
          height: 2em !important;
        }
        
        @media (min-width: 650px) {
          form > * {
            margin-left: 10px;
            margin-right: 10px;
          }
        }
      </style>
      
      <form>
        <gof-button id="info">Explanation</gof-button>
        <select id="shapes" aria-label="Select predefined shape"></select>
        <gof-button id="start" type="round">Start</gof-button>
        <gof-button id="next">Next</gof-button>
        <label class="generation" title="Generations" aria-label="Generations">0</label>

        <nowrap>
          <img src="pix/speeddial.svg" alt="" width="20" height="20">
          <input id="speed" type="range" min="0" max="100" value="50" title="Speed dial" aria-label="Speed dial">

          <img src="pix/grid.svg" alt="" width="20" height="20">
          <input id="size" type="range" min="0" max="100" value="58" title="Grid size" aria-label="Grid size">
        </nowrap>
      </form>
    `;
  }

  connectedCallback() {
    this.started = false;
    this.timer = null;
    this.generation = 0;
    this.collection = this.getCollection();
    this.resize$ = fromEvent(window, 'resize');
    this.info$ = fromEvent($('#info', this.shadowRoot), 'click');

    this.setupShapeSelect();
    this.setupSpeed();
    this.setupSize();
    this.setupStart();
    this.setupGeneration();
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

  private setGeneration(gen: number) {
    this.generation = gen;
    $('.generation', this.shadowRoot).textContent = gen.toString(10);
  }


  private setupSize() {
    const size = $('#size', this.shadowRoot);
    this.size$ = merge(
      fromEvent(size, 'input').map(event => Number((<HTMLInputElement>event.target).value)),
      new Cuprum<number>().dispatch(size.value)
    ).map((value) => Math.round(2 + 38 / 100 * value));
  }

  private play() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(this.speed).subscribe(() => {
      this.nextGeneration$.dispatch();
    })
  }

  private setupStart() {
    fromEvent($('#start', this.shadowRoot), 'click').subscribe((event) => {
      this.started = !this.started;
      if (this.started) {
        (<HTMLInputElement>event.target).textContent = 'Stop';
        this.play();

      } else {
        (<HTMLInputElement>event.target).textContent = 'Start';
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
      }
    });
  }

  private setupSpeed() {
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
  }

  private setupShapeSelect() {
    const shapesSelect = $('#shapes', this.shadowRoot);

    this.collection.forEach((shape) => {
      const option = document.createElement('option');
      option.text = shape.name;
      shapesSelect.appendChild(option);
    });
    shapesSelect.selectedIndex = 1;

    const shape$ = merge(
      fromEvent(shapesSelect, 'change'),
      new Cuprum<Event>().dispatch(null)
    );

    shape$.subscribe(() => {
      this.setGeneration(0);
    });

    this.newShape$ = shape$.map(() => this.collection[shapesSelect.selectedIndex].data);
  }

  private setupGeneration() {
    this.nextGeneration$ = fromEvent($('#next', this.shadowRoot), 'click').map(() => {
    });

    this.nextGeneration$.subscribe(() => {
      this.setGeneration(this.generation + 1);
    });

    this.nextShape$ = this.nextGeneration$.map(() =>
      gofNext(this.redraw$.value())
    );
  }

  private getCollection() {
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

