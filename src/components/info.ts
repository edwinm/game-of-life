import { $ } from 'carbonium';
import { Cuprum, combine, fromEvent } from "cuprum";

export class GofInfo extends HTMLElement implements CustomElement {
  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.shadowRoot.innerHTML = `
      <style>
        :host {
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
        
        .info-content {
          overflow: scroll;
          overflow-scrolling: touch;
          -webkit-overflow-scrolling: touch;
          height: calc(100vh - 300px);
          padding: 1em;
        }
        
        .close-button {
          position: absolute;
          width: 22px;
          height: 20px;
          right: 0.5em;
          top: 0.5em;
          background: url(pix/close.svg) no-repeat;
        }
        
        section {
          background: white;
        }
      </style>
      
      <section>
        <button class="close-button" data-close aria-label="Close"></button>
        <div class="info-content">
          <slot></slot>
          <p class="center">
            <button data-close>Close</button>
          </p>
        </div>
      </section>
    `;
  }

  connectedCallback() {
    combine(
      fromEvent($('[data-close]', this.shadowRoot), 'click'),
      fromEvent(document.documentElement, 'keyup')
        .filter((event: KeyboardEvent) => event.key == 'Escape'),
      fromEvent(document.documentElement, 'click')
        .filter(event => (<HTMLElement>event.target).classList.contains('whitebox'))
    ).subscribe(() => {
      this.setAttribute('hidden', '');
      document.body.classList.remove('whitebox');
    })

    fromEvent(document.documentElement, 'focusout')
      .filter((event) => (<HTMLElement>event.target).closest("gof-info") != null)
      .subscribe(() => {
          $('.close-button', this.shadowRoot).focus();
          return false;
        }
      );
  }

  init(info$: Cuprum<Event>) {
    info$.subscribe(() => {
      this.removeAttribute('hidden');
      document.body.classList.add('whitebox');
      $('.close-button', this.shadowRoot).focus();
    });
  }
}

customElements.define('gof-info', GofInfo);
