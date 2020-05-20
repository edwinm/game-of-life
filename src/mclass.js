/**!
 @preserve mClass 1.4.0

 @copyright Copyright 2013-2015 Edwin Martin

 @see {@link https://github.com/edwinm/mClass|mClass}

 @license MIT
 */

export default mClass;

/**
 * Define a class
 *
 * @param {Object|Function} definition Class definition
 * @returns {Function}
 */
function mClass(definition) {
  "use strict";

  var i;

  if (typeof definition == "function") {
    definition = definition();
  }

  if (definition.extends && definition.extends._definition.public) {
    LinkParent.prototype = definition.extends.prototype;
    Link.prototype = new LinkParent();
  }
  Result.prototype = new Link();

  // Parent Static
  if (definition.extends && definition.extends._definition.static) {
    for(i in definition.extends._definition.static) {
      Result[i] = definition.extends._definition.static[i];
    }
  }
  // Static
  for(i in definition.static) {
    Result[i] = definition.static[i];
  }

  // Set internal representation for extended classes
  Result._definition = definition;

  // Set _super member for calling parent methods and members
  Result._super = definition.extends && definition.extends._definition.public;

  return Result;

  ////// Function definitions //////

  // Object to return
  function Result(){
    // Super constructor
    if (definition.extends && definition.extends._definition.construct) {
      definition.extends._definition.construct.apply(this, arguments);
    }

    // This contructor
    if (definition.construct) {
      definition.construct.apply(this, arguments);
    }
  }

  // Add public functions
  function Link() {
    this.constructor = Result;
    for(i in definition.augments) {
      for(var item in definition.augments[i]) {
        this[item] = definition.augments[i][item];
      }
    }
    for(i in definition.public) {
      this[i] = definition.public[i];
    }
    // Set _super member for calling parent methods and members
    this._super = definition.extends && definition.extends._definition.public;
  }

  // Extends
  function LinkParent() {
    this.constructor = definition.extends;
  }
}
