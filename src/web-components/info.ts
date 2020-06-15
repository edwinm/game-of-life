import { $ } from 'carbonium';
import { combine, fromEvent } from "cuprum";

export class GofInfo extends HTMLElement implements CustomElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.shadowRoot.innerHTML = `
      <style>
        #info {
          position: absolute;
          display: none;
          left: 0;
          top: 0;
          background-color: rgba(60, 60, 60, 0.8);
          z-index: 1000;
          width: 100%;
          height: 100%;
        }
        #info section {
          position: absolute;
          top: 150px;
          left: 10vw;
          width: 80vw;
          height: calc(100vh - 300px);
          background: white;
          border: 1px solid #666;
          box-shadow: #666 5px 5px 5px;
          z-index: 2000;
        }
        
        #info.open {
          display: block;
        }
        
        .info-content {
          overflow: scroll;
          overflow-scrolling: touch;
          -webkit-overflow-scrolling: touch;
          height: calc(100vh - 300px);
          padding: 1em;
        }
        
        .close-button {
          position: absolute;
          right: 0.5em;
          top: 0.5em;
        }
        
        .center {
          display: flex;
          justify-content: center;
        }
      </style>
      
      <div id="info">
        <section>
          <gof-button class="close-button" data-close>&times;</gof-button>
          <div class="info-content">
            <slot></slot>
            <p class="center">
              <gof-button data-close>Close</gof-button>
            </p>
          </div>
        </section>
      </div>
    `;
  }

  static get observedAttributes() {
    return ['open'];
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (attr == 'open') {
      if (this.hasAttribute('open')) {
        $('#info', this.shadowRoot).classList.add('open');
        $('.close-button', this.shadowRoot).focus();
      } else {
        $('#info', this.shadowRoot).classList.remove('open');
      }
    }
  }

  connectedCallback() {
    const closeButtonClick = fromEvent($('[data-close]', this.shadowRoot), 'click');

    const escKey = fromEvent(document.documentElement, 'keyup')
      .filter((event: KeyboardEvent) => event.key == 'Escape');

    const outsideClick = fromEvent($('#info', this.shadowRoot), 'click')
      .filter(event => (<HTMLElement>event.target).id == "info")

    combine(closeButtonClick, escKey, outsideClick).subscribe(() => {
      this.removeAttribute('open');
    });

    // fromEvent(document.documentElement, 'focusin')
    //   .map((val) => {
    //     return val
    //   })
    //   .filter((event) => (<HTMLElement>event.target).closest("gof-info") != null)
    //   .subscribe(() => {
    //     }
    //   );
  }
}

customElements.define('gof-info', GofInfo);
