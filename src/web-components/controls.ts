import { $ } from "carbonium";
import { fromEvent, Cuprum, merge, Observable } from "cuprum";
import router from "../components/router";
import { CustomElement, define } from "web-component-decorator";
import { Draw } from "../models/draw";
import * as wasm from "../components/wasm";

@define("gol-controls")
export class GolControls extends HTMLElement implements CustomElement {
  private isPlaying: boolean;
  private generation: number;
  private speed: number;
  private redraw$: Observable<Draw>;

  private size$: Cuprum<number>;
  private nextGeneration$: Cuprum<void>;
  private nextShape$: Cuprum<Cell[]>;
  private resetShape$ = new Cuprum<void>();
  private clearShape$ = new Cuprum<void>();
  private documentReady$ = new Cuprum<Event>();
  private timer = null;

  constructor() {
    super();

    wasm.init();

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
        
        form > gol-button {
          --background: #2A4E97;
          --color: white;
          margin-top: 15px;
        }

        @media (prefers-color-scheme: dark) {
          gol-button {
            --background: #29457D;
          }
        }
                
        #controls {
          white-space: nowrap;
          border: 1px solid #999;
          padding: 20px;
          border-radius: 10px;
        }
        
        @media (prefers-color-scheme: dark) {
          #controls {
            background-color: #828080;
            border-color: #626262;
          }
        }
               
        @media (max-width: 650px), (max-height: 650px) {
          form {
            margin: 0;
            padding-bottom: 20px;
          }
          form > * {
            margin: 5px;
          }

          #start {
            --min-width: 200px;
          }

          img {
            margin-left: 10px;
          }

          #controls, #next, .generation {
            display: none;
          }
        }

        @media (pointer: coarse) {
          #controls {
            display: none;
          }
        }
      </style>
      
      <form>
        <gol-button icon="info" href="/info">Explanation</gol-button>
        <gol-button icon="book" href="/lexicon" responsive="true">Lexicon</gol-button>
        <gol-button id="start" icon="play">Start</gol-button>
        <gol-button id="next" icon="redo">Next</gol-button>
        <gol-button id="reset" icon="close">Clear</gol-button>
        <div class="generation" title="Generations" aria-label="Generations">0</div>

        <div id="controls">
          <svg width="20" height="20" viewBox="0 0 313 281" version="1.1" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;"><path d="M56.961,280.3c-34.939,-29.393 -56.961,-72.221 -56.961,-119.874c0,-88.541 76.03,-160.426 169.678,-160.426c60.073,0 112.897,29.581 143.052,74.164l-55.039,39.795c-23.62,-34.217 -63.104,-56.658 -107.788,-56.658c-72.236,0 -130.883,58.647 -130.883,130.883c0,35.908 14.492,68.459 37.941,92.116Z" style="fill:#000;"/><path d="M162.389,193.653c-1.065,1.886 -2.377,3.707 -3.935,5.407c-8.877,9.688 -22.364,11.798 -30.1,4.709c-7.737,-7.088 -6.81,-20.708 2.066,-30.396c1.64,-1.789 3.437,-3.32 5.326,-4.582l126.373,-110.976l-99.73,135.838Z" style="fill:#e61a1a;"/></svg>
          <input id="speed" type="range" min="0" max="100" value="50" title="Speed dial" aria-label="Speed dial">

          <svg width="20" height="20" viewBox="0 0 225 225" version="1.1" xmlns="http://www.w3.org/2000/svg" xml:space="preserve" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:1.41421;"><path d="M181.444,0l-6.437,0l0,224.662l6.437,0l0,-224.662ZM49.655,0l-6.437,0l0,224.662l6.437,0l0,-224.662Z" style="fill:#000;"/><path d="M224.662,181.444l0,-6.437l-224.662,0l0,6.437l224.662,0ZM224.662,49.655l0,-6.437l-224.662,0l0,6.437l224.662,0Z" style="fill:#000;"/></svg>
          <input id="size" type="range" min="0" max="100" value="43" title="Grid size" aria-label="Grid size">
        </div>
      </form>
    `;
  }

  connectedCallback() {
    this.isPlaying = false;
    this.generation = 0;

    this.setupSpeed();
    this.setupSize();
    this.setupStart();
    this.setupGeneration();
    this.setupReset();
  }

  getObservers() {
    const resize$ = merge(
      fromEvent(window, "resize"),
      fromEvent(window, "orientationchange"),
      this.documentReady$
    );

    return {
      nextShape$: this.nextShape$.observable(),
      resize$: resize$.observable(),
      size$: this.size$.observable(),
      reset$: this.resetShape$.observable(),
      clear$: this.clearShape$.observable(),
    };
  }

  setObservers(
    redraw$: Observable<Draw>,
    toggle$: Observable<Cell>,
    infoIsOpen$: Observable<boolean>,
    newPattern$: Observable<string>
  ) {
    this.redraw$ = redraw$;

    this.documentReady$.dispatch(null);

    toggle$.subscribe(() => {
      this.setGeneration(0);
    });

    infoIsOpen$.subscribe((isInfoOpen) => {
      $<HTMLInputElement>(
        "input, select, gol-button",
        this.shadowRoot
      ).disabled = isInfoOpen;
    });

    redraw$.subscribe(({ pattern }) => {
      if (!this.isPlaying) {
        $<HTMLInputElement>("#start, #next, #reset", this.shadowRoot).disabled =
          pattern.length == 0;
      }
    });

    newPattern$.subscribe(() => {
      this.setGeneration(0);
    });
  }

  private setGeneration(gen: number) {
    this.generation = gen;
    $(".generation", this.shadowRoot).textContent = gen.toString(10);

    const resetButton = $("#reset", this.shadowRoot);
    if (gen == 0) {
      resetButton.textContent = "Clear";
      resetButton.setAttribute("icon", "close");
    } else {
      resetButton.textContent = "Reset";
      resetButton.setAttribute("icon", "replay");
    }
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
    this.isPlaying = true;
    clearTimeout(this.timer);
    this.nextGeneration$.dispatch();
  }

  private stop() {
    this.isPlaying = false;
    clearTimeout(this.timer);
  }

  private setupStart() {
    fromEvent($("#start", this.shadowRoot), "click").subscribe((event) => {
      if (this.isPlaying) {
        (<HTMLInputElement>event.target).textContent = "Start";
        (<HTMLInputElement>event.target).setAttribute("icon", "play");
        this.stop();
      } else {
        (<HTMLInputElement>event.target).textContent = "Stop";
        (<HTMLInputElement>event.target).setAttribute("icon", "stop");
        this.play();
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
      this.speed = 1000 - Math.sqrt(value) * 100;
    });
  }

  private setupGeneration() {
    this.nextGeneration$ = fromEvent($("#next", this.shadowRoot), "click")
      .filter(() => !this.isPlaying)
      .map(() => {});

    this.nextShape$ = this.nextGeneration$.map(() => {
      this.setGeneration(this.generation + 1);
      const newShape = wasm.next(this.redraw$.value().pattern);
      if (this.isPlaying) {
        this.timer = setTimeout(() => {
          this.nextGeneration$.dispatch();
        }, this.speed);
      }
      return newShape;
    });
  }

  private setupReset() {
    fromEvent($("#reset", this.shadowRoot), "click").subscribe(() => {
      if (this.generation == 0) {
        this.clearShape$.dispatch();
        router.push("/");
      } else {
        this.resetShape$.dispatch();
        this.setGeneration(0);
      }
    });
  }
}
