import { $ } from "carbonium";
import router from "../components/router";

export class GofButton extends HTMLElement implements CustomElement {
  private button: HTMLButtonElement;

  constructor() {
    super();

    this.attachShadow({ mode: "open" });

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
        
        .container {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        #button.pressed .container {
          top: 1px;
        }

        #button:focus {
          outline: none;
          border: 2px solid white;
        }
        #button.no-focus:focus {
          border: 2px solid transparent;
        }
        
        /* Icons */
        svg {
          display: none;
        }

        svg.visible {
          display: inline-block;
          width: calc(var(--size, 40px) * 0.7);
          height: calc(var(--size, 40px) * 0.7);
          fill: var(--color, white);
          margin-right: calc(var(--size, 40px) * 0.2);;
        }
      </style>
      
      <button id="button">
        <div class="container">
          <svg class="close" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          <svg class="book" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><rect fill="none" height="24" width="24"/></g><g><g><g><path d="M17.5,4.5c-1.95,0-4.05,0.4-5.5,1.5c-1.45-1.1-3.55-1.5-5.5-1.5S2.45,4.9,1,6v14.65c0,0.65,0.73,0.45,0.75,0.45 C3.1,20.45,5.05,20,6.5,20c1.95,0,4.05,0.4,5.5,1.5c1.35-0.85,3.8-1.5,5.5-1.5c1.65,0,3.35,0.3,4.75,1.05 C22.66,21.26,23,20.86,23,20.6V6C21.51,4.88,19.37,4.5,17.5,4.5z M21,18.5c-1.1-0.35-2.3-0.5-3.5-0.5c-1.7,0-4.15,0.65-5.5,1.5V8 c1.35-0.85,3.8-1.5,5.5-1.5c1.2,0,2.4,0.15,3.5,0.5V18.5z"/></g></g></g></svg>
          <svg class="info" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
          <svg class="play" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M8 5v14l11-7z"/></svg>
          <svg class="redo" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
          <svg class="replay" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
          <svg class="stop" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 6h12v12H6z"/></svg>          
          <slot></slot>
        </div>
      </button>
    `;
  }

  // Icons from https://material.io/resources/icons/?style=baseline
  // <svg class="settings" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24" viewBox="0 0 24 24" width="24"><g><path d="M0,0h24v24H0V0z" fill="none"/><path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/></g></svg>
  // <svg class="share" xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg>

  connectedCallback() {
    this.button = $("#button", this.shadowRoot);
    this.button.addEventListener("mousedown", this.onPress);
    this.button.addEventListener("keydown", this.onPress);

    this.button.addEventListener("mouseup", this.onRelease);
    this.button.addEventListener("keyup", this.onRelease);
    this.button.addEventListener("blur", this.onRelease);

    this.button.addEventListener("click", () => {
      this.onClick();
    });
  }

  disconnectedCallback() {
    this.button.removeEventListener("mousedown", this.onPress);
    this.button.removeEventListener("keydown", this.onPress);

    this.button.removeEventListener("mouseup", this.onRelease);
    this.button.removeEventListener("keyup", this.onRelease);
    this.button.removeEventListener("blur", this.onRelease);
  }

  static get observedAttributes() {
    return ["icon"];
  }

  attributeChangedCallback(attr, oldValue, newValue) {
    if (attr == "icon") {
      $("svg.visible", this.shadowRoot).classList.remove("visible");
      $(`svg.${newValue}`, this.shadowRoot).classList.add("visible");
    }
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

  private onClick() {
    if (this.hasAttribute("href")) {
      router.push(this.getAttribute("href"));
    }
  }

  private onPress(event: Event) {
    const button = (<HTMLButtonElement>event.target).closest("#button");
    if ((<KeyboardEvent>event).key != "Tab") {
      button.classList.add("pressed");
      if (event.type == "keydown") {
        button.classList.remove("no-focus");
      } else {
        button.classList.add("no-focus");
      }
    } else {
      button.classList.remove("no-focus");
    }
  }

  private onRelease(event: Event) {
    (<HTMLButtonElement>event.target)
      .closest("#button")
      .classList.remove("pressed");
  }
}

customElements.define("gof-button", GofButton);
