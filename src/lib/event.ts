export {Event};

class Event<T> {
  private value: T;
  private subscribers: Set<(value: T) => void> = new Set();

  dispatch(value: T) {
    this.value = value;
    this.subscribers.forEach((fn) =>
      fn(value)
    );
  }

  subscribe(fn: (value: T) => void) {
    this.subscribers.add(fn);
  }

  unsubscribe(fn: (value: T) => void) {
    this.subscribers.delete(fn);
  }

  getValue() {
    return this.value;
  }

  promise() {
    return new Promise<T>((resolve) => {
      const fn = (value) => {
        this.unsubscribe(fn);
        resolve(value);
      };
      this.subscribe(fn);
    });
  }
}
