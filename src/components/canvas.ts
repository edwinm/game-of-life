export class GofCanvas extends HTMLElement {
  canvas: HTMLCanvasElement;

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        :host {
          background: green;
          display: block;
          width: 50vw;
        }
      </style>
      
      <div id="canvas">
        <h1>canvas 3</h1>
      </div>  
    `;

    this.canvas = this.shadowRoot.querySelector('#canvas');
  }

  connectedCallback() {

  }

  attributeChangedCallback(attr, oldValue, newValue) {
  }
}

customElements.define('gof-canvas', GofCanvas);
