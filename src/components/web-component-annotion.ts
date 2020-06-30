/**
 web-component-decorator
 @copyright 2020 Edwin Martin
 @license MIT
 */

const attrSymbol = Symbol();

export function define(name: string, options?: ElementDefinitionOptions) {
  return function (constructor: CustomElementConstructor) {
    customElements.define(name, constructor, options);
  };
}

export function attribute(attr: string) {
  return function (
    target: CustomElement,
    propertyName: string,
    propertyDescriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const prop = propertyDescriptor.value ? "value" : "set";

    if (target.constructor[attrSymbol]) {
      target.constructor.observedAttributes.push(attr);
      target.constructor[attrSymbol].set(attr, propertyDescriptor[prop]);
    } else {
      target.constructor.observedAttributes = [attr];
      target.constructor[attrSymbol] = new Map([
        [attr, propertyDescriptor[prop]],
      ]);
    }

    target.attributeChangedCallback = function (attr, oldValue, newValue) {
      const fn = target.constructor[attrSymbol].get(attr);
      fn.call(this, newValue, oldValue);
    };

    return propertyDescriptor;
  };
}

export interface CustomElement {
  constructor: Function & {
    observedAttributes?: string[];
  };

  attributeChangedCallback?(
    attributeName: string,
    oldValue: string,
    newValue: string
  ): void;

  connectedCallback?(): void;

  disconnectedCallback?(): void;
}
