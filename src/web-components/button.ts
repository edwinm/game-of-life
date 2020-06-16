import { $ } from 'carbonium';

export class GofButton extends HTMLElement implements CustomElement {
  private button: HTMLButtonElement;

  constructor() {
    super();

    this.attachShadow({mode: 'open'});

    this.shadowRoot.innerHTML = `
      <style>
        #button {
          min-width: var(--min-width, 0);
          height: var(--size, 40px);
          padding: 0 30px;
          border-radius: calc( var(--size, 40px) * 0.5);
          border: 2px solid transparent;
          font-size: calc( var(--size, 40px) * 0.5);
          text-transform: uppercase;
          color: var(--color, white);
          background-color: var(--background, royalblue);
          box-shadow: 2px 2px 3px hsla(0, 0%, 0%, 0.3);
          outline: none;
        }
        
        #button.pressed {
          box-shadow: inset 2px 2px 3px hsla(0, 0%, 0%, 0.3);
        }
        
        #button.pressed div {
          position: relative;
          top: 1px;
        }
        
        #button:focus {
          border: 2px solid white;
        }
        #button.no-focus:focus {
          border: 2px solid transparent;
        }
      </style>
      
      <button id="button">
        <div>
          <slot></slot>
        </div>
      </button>
    `;
  }

  connectedCallback() {
    this.button = $('#button', this.shadowRoot);
    this.button.addEventListener('mousedown', this.onPress);
    this.button.addEventListener('keydown', this.onPress);

    this.button.addEventListener('mouseup', this.onRelease);
    this.button.addEventListener('keyup', this.onRelease);
    this.button.addEventListener('blur', this.onRelease);
  }

  disconnectedCallback() {
    this.button.removeEventListener('mousedown', this.onPress);
    this.button.removeEventListener('keydown', this.onPress);

    this.button.removeEventListener('mouseup', this.onRelease);
    this.button.removeEventListener('keyup', this.onRelease);
    this.button.removeEventListener('blur', this.onRelease);
  }

  focus(options?: FocusOptions) {
    this.button.focus(options);
  }

  blur() {
    this.button.blur();
  }

  set disabled(isDisabled) {
    this.button.disabled = isDisabled;
  }

  private onPress(event: Event) {
    const button = (<HTMLButtonElement>event.target).closest("#button");
    if ((<KeyboardEvent>event).key != "Tab") {
      button.classList.add('pressed');
      if (event.type == "keydown") {
        button.classList.remove('no-focus');
      } else {
        button.classList.add('no-focus');
      }
    } else {
      button.classList.remove('no-focus');
    }
  }

  private onRelease(event: Event) {
    (<HTMLButtonElement>event.target).closest("#button").classList.remove('pressed');
  }
}

customElements.define('gof-button', GofButton);
