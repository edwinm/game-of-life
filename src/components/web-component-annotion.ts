/**
 web-component-decorator
 @copyright 2020 Edwin Martin
 @license MIT
 */

export function define(tag: string) {
  return function (constructor: CustomElementConstructor) {
    customElements.define(tag, constructor);
  };
}
