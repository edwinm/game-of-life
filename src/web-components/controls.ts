import { $ } from "carbonium";
import {
  fromEvent,
  Cuprum,
  merge,
  Observable,
  Subscription,
  interval,
  combine,
} from "cuprum";
import { gofNext } from "../components/gameoflife";

export class GofControls extends HTMLElement implements CustomElement {
  private started: boolean;
  private timer: NodeJS.Timeout;
  private timerSubscription: Subscription;
  private generation: number;
  private speed: number;
  private redraw$: Observable<Cell[]>;

  private size$: Cuprum<number>;
  private nextShape$: Cuprum<Cell[]>;
  private nextGeneration$: Cuprum<void>;
  private resize$: Observable<[Event, Event]>;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          width: 100vw;
        }
        
        form {
          display: flex;
          justify-content:  center;
          flex-wrap: wrap;
          align-items:  center;
          margin: 20px 5px;
        }
        
        img {
          vertical-align: bottom;
            margin-left: 30px;
        }
        
        form > * {
            margin: 5px 20px;
        }
        
        input[type="range"] {
          width: 80px;
        }
        
        .generation {
          display: inline-block;
          min-width: 42px;
          font-size: 20px;
          text-align: right;
        }
        
        nowrap {
          white-space: nowrap;
        }
        
        nowrap > * {
          vertical-align: middle;
        }
        
        #shapes {
          height: 40px;
          padding: 0 5px 0 15px;
          border: none;
          border-radius: 8px;
          background-color: #2A4E97;
          color: white;
          font-size: 20px;
          box-shadow: 2px 2px 3px hsla(0, 0%, 0%, 0.3);
        }
        
        #start {
          --size: 60px;
          --min-width: 220px;
        }
        
        gof-button {
          --background: #2A4E97;
          --color: white;
        }
        
        @media (max-width: 650px), (max-height: 650px) {
          form {
            margin: 0 5vw;
          }
          form > * {
            margin: 5px;
          }
          gof-button {
            --size: 30px;
          }
        
          #start {
            --size: 40px;
            --min-width: 170px;
          }

          img {
            margin-left: 10px;
          }
        }

        @media (max-width: 650px) and (display-mode: standalone) {
          form {
            padding-bottom: 80px;
          }
        }
      </style>
      
      <form>
        <gof-button icon="info" href="/info">Explanation</gof-button>
        <gof-button icon="book" href="/lexicon">Lexicon</gof-button>
        <gof-button id="start" icon="play">Start</gof-button>
        <gof-button id="next" icon="redo">Next</gof-button>
        <div class="generation" title="Generations" aria-label="Generations">0</div>

        <nowrap>
          <svg width="20" height="20" viewBox="0 0 313 281" version="1.1" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;"><path d="M56.961,280.3c-34.939,-29.393 -56.961,-72.221 -56.961,-119.874c0,-88.541 76.03,-160.426 169.678,-160.426c60.073,0 112.897,29.581 143.052,74.164l-55.039,39.795c-23.62,-34.217 -63.104,-56.658 -107.788,-56.658c-72.236,0 -130.883,58.647 -130.883,130.883c0,35.908 14.492,68.459 37.941,92.116Z" style="fill:#000;"/><path d="M162.389,193.653c-1.065,1.886 -2.377,3.707 -3.935,5.407c-8.877,9.688 -22.364,11.798 -30.1,4.709c-7.737,-7.088 -6.81,-20.708 2.066,-30.396c1.64,-1.789 3.437,-3.32 5.326,-4.582l126.373,-110.976l-99.73,135.838Z" style="fill:#e61a1a;"/></svg>
          <input id="speed" type="range" min="0" max="100" value="50" title="Speed dial" aria-label="Speed dial">

          <svg width="20" height="20" viewBox="0 0 225 225" version="1.1" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;"><path d="M181.444,0l-6.437,0l0,224.662l6.437,0l0,-224.662ZM49.655,0l-6.437,0l0,224.662l6.437,0l0,-224.662Z" style="fill:#000;"/><path d="M224.662,181.444l0,-6.437l-224.662,0l0,6.437l224.662,0ZM224.662,49.655l0,-6.437l-224.662,0l0,6.437l224.662,0Z" style="fill:#000;"/></svg>
          <input id="size" type="range" min="0" max="100" value="43" title="Grid size" aria-label="Grid size">
        </nowrap>
      </form>
    `;
  }

  connectedCallback() {
    this.started = false;
    this.timer = null;
    this.generation = 0;
    // this.collection = this.getCollection();
    this.resize$ = combine(
      fromEvent(window, "resize"),
      fromEvent(window, "orientationchange")
    );

    this.setupSpeed();
    this.setupSize();
    this.setupStart();
    this.setupGeneration();
  }

  getObservers() {
    return {
      nextShape$: this.nextShape$.observable(),
      resize$: this.resize$.observable(),
      size$: this.size$.observable(),
    };
  }

  setObservers(
    redraw$: Observable<Cell[]>,
    toggle$: Observable<Cell>,
    infoIsOpen$: Observable<boolean>
  ) {
    this.redraw$ = redraw$;

    toggle$.subscribe(() => {
      this.setGeneration(0);
    });

    infoIsOpen$.subscribe((infoIsOpen) => {
      $<HTMLInputElement>(
        "input, select, gof-button",
        this.shadowRoot
      ).disabled = infoIsOpen;
    });
  }

  private setGeneration(gen: number) {
    this.generation = gen;
    $(".generation", this.shadowRoot).textContent = gen.toString(10);
  }

  private setupSize() {
    const size = $<HTMLInputElement>("#size", this.shadowRoot);
    this.size$ = merge(
      fromEvent(size, "input").map((event) =>
        Number((<HTMLInputElement>event.target).value)
      ),
      new Cuprum<number>().dispatch(Number(size.value))
    ).map((value) => Math.round(2 + (38 / 100) * value));
  }

  private play() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }

    this.timerSubscription = interval(this.speed).subscribe(() => {
      this.nextGeneration$.dispatch();
    });
  }

  private setupStart() {
    fromEvent($("#start", this.shadowRoot), "click").subscribe((event) => {
      this.started = !this.started;
      if (this.started) {
        (<HTMLInputElement>event.target).textContent = "Stop";
        (<HTMLInputElement>event.target).setAttribute("icon", "stop");
        this.play();
      } else {
        (<HTMLInputElement>event.target).textContent = "Start";
        (<HTMLInputElement>event.target).setAttribute("icon", "play");
        if (this.timerSubscription) {
          this.timerSubscription.unsubscribe();
        }
      }
    });
  }

  private setupSpeed() {
    const speed = $<HTMLInputElement>("#speed", this.shadowRoot);
    merge(
      fromEvent(speed, "input").map((event) =>
        Number((<HTMLInputElement>event.target).value)
      ),
      new Cuprum<number>().dispatch(Number(speed.value))
    ).subscribe((value) => {
      this.speed = 1000 - Math.sqrt(value) * 99;
      if (this.started) {
        this.play();
      }
    });
  }

  private setupGeneration() {
    this.nextGeneration$ = fromEvent(
      $("#next", this.shadowRoot),
      "click"
    ).map(() => {});

    this.nextGeneration$.subscribe(() => {
      this.setGeneration(this.generation + 1);
    });

    this.nextShape$ = this.nextGeneration$.map(() =>
      gofNext(this.redraw$.value())
    );
  }
}

customElements.define("gof-controls", GofControls);
