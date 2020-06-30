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

export function attribute(attr: string) {
  return function (
    target: CustomElement,
    propertyName: string,
    propertyDesciptor: PropertyDescriptor
  ): PropertyDescriptor {
    if (target.constructor["observedAttributes"]) {
      target.constructor["observedAttributes"].push(attr);
      target.constructor["_attrMap"].set(attr, propertyDesciptor.value);
    } else {
      target.constructor["observedAttributes"] = [attr];
      target.constructor["_attrMap"] = new Map();
      target.constructor["_attrMap"].set(attr, propertyDesciptor.value);
    }

    target.attributeChangedCallback = function (attr, oldValue, newValue) {
      const fn = target.constructor["_attrMap"].get(attr);
      fn.call(this, newValue, oldValue);
    };

    return propertyDesciptor;
  };
}
