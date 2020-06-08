interface CustomElement {
  attributeChangedCallback?(attributeName: string, oldValue: string, newValue: string): void;
  connectedCallback?(): void;
  disconnectedCallback?(): void;
  observedAttributes?: string[];
}
