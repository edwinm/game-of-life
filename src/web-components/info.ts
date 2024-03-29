import { $ } from "carbonium";
import { Cuprum, combine, fromEvent, Subscription } from "cuprum";
import router from "../components/router";
import { attribute, CustomElement, define } from "web-component-decorator";

@define("gol-info")
export class GolInfo extends HTMLElement implements CustomElement {
  private subscribers = new Set<Subscription>();
  private infoIsOpen$: Cuprum<boolean>;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;
        }

        #whitebox {
          position: absolute;
          display: none;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          justify-content: center;
          align-items: center;
          background-color: rgba(60, 60, 60, 0);
          transition: background-color 250ms ease;
          backdrop-filter: blur(3px);
          z-index: 1000;
        }

        #whitebox.open {
          display: flex;
        }
        
        #whitebox.anim {
          background-color: rgba(60, 60, 60, 0.8);
        }
        
        section {
          position: absolute;
          transform: translate(0, 100px);
          opacity: 0;
          max-width: 60em;
          width: 90vw;
          max-height: 90vh;
          background: white;
          box-shadow: hsla(0, 0%, 0%, 0.3) 5px 5px 5px;
          z-index: 2000;
          transition: all 250ms ease;
        }
        
        .anim section {
          transform: translate(0, 0);
          opacity: 1;
        }
        
        .info-content {
          top: 0;
          max-height: 90vh;
          overflow-y: scroll;
          overflow-x: hidden;
          overflow-scrolling: touch;
          padding: 60px 2em 2em;
          border: 2px solid transparent; /*bugfix*/
        }
        
        @media (prefers-color-scheme: dark) {
          .info-content {
            background-color: #38393c;
            color: #f4f3e6;
          }
        }
        
        .header {
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 70px;
          background-color: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(2px);
          pointer-events: none;
        }
        
        .close-button {
          position: absolute;
          top: 14px;
          right: 2em;        
        }
        
        gol-button {
          --background: #2A4E97;
          --color: white;
        }
        
        @media (prefers-color-scheme: dark) {
          gol-button {
            --background: #29457D;
          }
          .header {
            background-color: rgba(56, 57, 60, 0.9);
          }
        }

        @media (max-width: 650px) {
          section {
            top: 0;
            width: 100vw;
            max-height: 100vh;
          }
          
          .info-content {
            padding: 60px 15px;
            max-height: 100vh;
          }
          
        .close-button {
          right: 15px;        
        }
        }
      </style>
      
      <div id="whitebox">
        <section>
          <div class="header"></div>
          <gol-button class="close-button" icon="close" data-close></gol-button>
          <div class="info-content">
            <slot></slot>
          </div>
        </section>
      </div>
    `;
  }

  @attribute("open")
  setOpenAttribute(newValue) {
    const isOpen = newValue != null;
    if (isOpen) {
      $("#whitebox", this.shadowRoot).classList.add("open");
      setTimeout(() => {
        $("#whitebox", this.shadowRoot).classList.add("anim");
      }, 0);
      $(".close-button", this.shadowRoot).focus();
    } else {
      $("#whitebox", this.shadowRoot).classList.remove("anim");
      setTimeout(() => {
        $("#whitebox", this.shadowRoot).classList.remove("open");
      }, 250);
    }
    this.infoIsOpen$.dispatch(isOpen);
  }

  connectedCallback() {
    this.infoIsOpen$ = new Cuprum<boolean>();

    const closeButtonClick = fromEvent(
      $("[data-close]", this.shadowRoot),
      "click"
    );

    const escKey = fromEvent(document.documentElement, "keyup").filter(
      (event) => event.key == "Escape" && this.hasAttribute("open")
    );

    const outsideClick = fromEvent(
      $("#whitebox", this.shadowRoot),
      "click"
    ).filter((event) => (<HTMLElement>event.target).id == "whitebox");

    this.subscribers.add(
      combine(closeButtonClick, escKey, outsideClick).subscribe(() => {
        // TODO: Fix this when new navigation API is available
        router.push("/");
      })
    );

    fromEvent(this, "click").subscribe((event) => {
      const section = (<HTMLElement>event.target).closest("[data-url]");
      if (section) {
        router.push(section.getAttribute("data-url"));
      }
    });
  }

  disconnectedCallback() {
    this.subscribers.forEach((subscriber) => {
      subscriber.unsubscribe();
    });
  }

  getObservers() {
    return {
      infoIsOpen$: this.infoIsOpen$.observable(),
    };
  }
}
