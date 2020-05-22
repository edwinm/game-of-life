export { Eventer };

class Eventer<T> {
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
    if (this.dispatched) {
      fn(this.val);
    }
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
      const self = this;
      this.subscribe(function fn(value) {
        self.unsubscribe(fn);
        resolve(value);
      });
    });
  }

  pipe<U>(fn: (val: T) => U) {
    const event$ = new Eventer<U>();
    this.subscribe((value) => {
      event$.dispatch(fn(value));
    });
    return event$;
  }

  filter(fn: (val: T) => boolean) {
    const event$ = new Eventer<T>();
    this.subscribe((value) => {
      if (fn(value)) {
        event$.dispatch(value);
      }
    });
    return event$;
  }
}

function domEvent(element, eventType) {
  const event$ = new Eventer<Event>();
  element.addEventListener(eventType, (evt: Event) => {event$.dispatch(evt)}, false);
  return event$;
}
