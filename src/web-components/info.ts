import { $ } from "carbonium";
import { Cuprum, combine, fromEvent, Subscription } from "cuprum";
import router from "../components/router";
import {
  attribute,
  CustomElement,
  define,
} from "../components/web-component-decorator";

@define("gof-info")
export class GofInfo extends HTMLElement implements CustomElement {
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
          border: 1px solid #666;
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
          padding: 2em;
          border: 2px solid transparent; /*bugfix*/
        }
        
        .close-button {
          position: absolute;
          right: 1em;
          top: 0.5em;
        }
        
        .close-button-container {
          display: flex;
          justify-content: center;
          padding-top: 2em;
        }
        
        gof-button {
          --background: #2A4E97;
          --color: white;
        }

        @media (max-width: 650px) {
          section {
            top: 10vh;
            width: 95vw;
            max-height: 70vh;
          }
          
          .info-content {
            padding: 5px;
            max-height: 70vh;
          }
        }
      </style>
      
      <div id="whitebox">
        <section>
          <gof-button class="close-button" icon="close" data-close></gof-button>
          <div class="info-content">
            <slot></slot>
            <p class="close-button-container">
              <gof-button data-close icon="close">Close</gof-button>
            </p>
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
      (event: KeyboardEvent) =>
        event.key == "Escape" && this.hasAttribute("open")
    );

    const outsideClick = fromEvent(
      $("#whitebox", this.shadowRoot),
      "click"
    ).filter((event) => (<HTMLElement>event.target).id == "whitebox");

    this.subscribers.add(
      combine(closeButtonClick, escKey, outsideClick).subscribe(() => {
        router.back();
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
