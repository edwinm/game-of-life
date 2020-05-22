export { Event };

class Event<T> {
  private val: T;
  private subscribers: Set<(value: T) => void> = new Set();
  private dispatched = false;

  dispatch(value: T) {
    this.val = value;
    this.dispatched = true;
    this.subscribers.forEach((fn) =>
      fn(value)
    );
  }

  subscribeNext(fn: (value: T) => void) {
    this.subscribers.add(fn);
    return {
      unsubscribe: () => {
        this.subscribers.delete(fn)
      }
    }
  }

  subscribe(fn: (value: T) => void) {
    fn(this.val);
    return this.subscribeNext(fn);
  }

  unsubscribe(fn: (value: T) => void) {
    this.subscribers.delete(fn);
  }

  value() {
    return this.val;
  }

  promise() {
    return new Promise<T>((resolve) => {
      const subscription = this.subscribe((value) => {
        subscription.unsubscribe();
        resolve(value);
      });
    });
  }
}
