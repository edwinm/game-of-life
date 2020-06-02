export { Observable, tap, fromEvent };

class Observable<T> {
  private val: T;
  private subscribers: Set<(value: T) => void> = new Set();
  private subscribersHot: Set<(value: boolean) => void> = new Set();
  private dispatched = false;
  private hot = false;

  dispatch(value: T) {
    this.val = value;
    this.dispatched = true;
    this.subscribers.forEach((fn) =>
      fn(value)
    );
  }

  subscribeNext(fn: (value: T) => void): Subscription {
    this.subscribers.add(fn);
    this.notifyHotSubscribers();
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
    this.notifyHotSubscribers();
  }

  private notifyHotSubscribers() {
    if (this.subscribers.size > 0 != this.hot) {
      this.hot = this.subscribers.size > 0;
      this.subscribersHot.forEach((fn) =>
        fn(this.hot)
      );
    }
  }

  subscribeHot(fn: (value: boolean) => void) {
    this.subscribersHot.add(fn);
    return {
      unsubscribe: () => {
        this.subscribersHot.delete(fn)
      }
    }
  }

  clear() {
    this.subscribers.clear();
    this.subscribersHot.clear();
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

  // TODO: async map

  map<U>(fn: (val: T) => U) {
    const event$ = new Observable<U>();
    const dispatch = (value) => {
      event$.dispatch(fn(value));
    };
    event$.subscribeHot((hot) => {
      if (hot) {
        this.subscribe(dispatch);
      } else {
        this.unsubscribe(dispatch);
      }
    });
    return event$;
  }

  filter(fn: (val: T) => boolean) {
    const event$ = new Observable<T>();
    const dispatch = (value) => {
      if (fn(value)) {
        event$.dispatch(value);
      }
    };
    event$.subscribeHot((hot) => {
      if (hot) {
        this.subscribe(dispatch);
      } else {
        this.unsubscribe(dispatch);
      }
    });
    return event$;
  }
}

class Subscription {
  unsubscribe: () => void;
}

function tap(fn: (val: any) => any) {
  fn(this.val);
  return this;
}

function fromEvent(element, eventType) {
  const obs$ = new Observable<Event>();
  const dispatch = (evt: Event) => {
    obs$.dispatch(evt)
  };
  obs$.subscribeHot((hot) => {
    if (hot) {
      element.addEventListener(eventType, dispatch, false);
    } else {
      element.removeEventListener(eventType, dispatch, false);
    }
  });
  return obs$;
}

// TODO: combine with more than two arguments
function combine<T, U>(obs1$: Observable<T>, obs2$: Observable<U>) {
  const obs$ = new Observable<[T, U]>();
  let sub1: Subscription;
  let sub2: Subscription;

  obs$.subscribeHot((hot) => {
    if (hot) {
      sub1 = obs1$.subscribe((val1) => {
        obs$.dispatch([val1, obs2$.value()]);
      });

      sub2 = obs2$.subscribe((val2) => {
        obs$.dispatch([obs1$.value(), val2]);
      });
    } else {
      sub1.unsubscribe();
      sub2.unsubscribe();
    }
  });

  return obs$;
}
