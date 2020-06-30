/**
 web-component-decorator
 @copyright 2020 Edwin Martin
 @license MIT
 */

const attrSymbol = Symbol();

export function define(tag: string) {
  return function (constructor: CustomElementConstructor) {
    customElements.define(tag, constructor);
  };
}

export function attribute(attr: string) {
  return function (
    target: any,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor
  ): PropertyDescriptor {
    const prop = propertyDesciptor.value ? "value" : "set";

    if (target.constructor[attrSymbol]) {
      target.constructor.observedAttributes.push(attr);
      target.constructor[attrSymbol].set(attr, propertyDesciptor[prop]);
    } else {
      target.constructor.observedAttributes = [attr];
      target.constructor[attrSymbol] = new Map();
      target.constructor[attrSymbol].set(attr, propertyDesciptor[prop]);
    }

    target.attributeChangedCallback = function (attr, oldValue, newValue) {
      const fn = target.constructor[attrSymbol].get(attr);
      fn.call(this, newValue, oldValue);
    };

    return propertyDesciptor;
  };
}
