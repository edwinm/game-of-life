import $ from '../miq';

export class GofInfo extends HTMLElement {
  static get observedAttributes() {
    return [];
  }

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
    $(this.shadowRoot).find('[data-close]').on('click', () => {
      this.close();
    });

    $(document.documentElement).on('keyup', (e) => {
      if (e.key == 'Escape') {
        this.close();
      }
    });

    $(document.documentElement).on('click', (e) => {
      if (e.target.classList.contains('whitebox')) {
        this.close();
      }
    });
  }

  open() {
    this.removeAttribute('hidden');
    $(document.body).addClass('whitebox');
  }

  close() {
    this.setAttribute('hidden', '');
    $(document.body).removeClass('whitebox');
  }
}

customElements.define('gof-info', GofInfo);
