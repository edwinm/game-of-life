export class GofSkeleton extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });

    this.shadowRoot.innerHTML = `
      <style>
        :host {
        }
      </style>
      
      <div></div>
    `;

  }

  static get observedAttributes() {
    return [];
  }

  connectedCallback() {

  }
}

customElements.define('gof-skeleton', GofSkeleton);

