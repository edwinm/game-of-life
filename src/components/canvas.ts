export class GofCanvas extends HTMLElement {
  canvas: HTMLCanvasElement;

  static get observedAttributes() {
    return [];
  }

  constructor() {
    super();

    const shadowRoot = this.attachShadow({mode: 'open'});

    shadowRoot.innerHTML = `
      <style>
        :host {
          background: green;
          display: block;
        }
        #canvas{
          width: 100%;
          height: 100%;
        }
      </style>
      
      <canvas id="canvas"></canvas>
    `;

    this.canvas = this.shadowRoot.querySelector('#canvas');
  }

  connectedCallback() {

  }

  attributeChangedCallback(attr, oldValue, newValue) {
  }

  getCanvas() {
    return this.canvas;
  }
}

customElements.define('gof-canvas', GofCanvas);
