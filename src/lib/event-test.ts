import {Observable} from "./observable";

const test1$ = new Observable<string>();

const test3$ = test1$.map((val) => `[${val}]`);

test1$.subscribe((value) => {
  console.log(`event1 value ${value}`);
})

test3$.subscribe((value) => {
  console.log(`event3 value ${value}`);
})

test1$.dispatch("a1");

test1$.subscribe(test2)

function test2(value: string) {
  console.log(`event2 value ${value}`);
}

(async function() {
  setTimeout(
    () =>
      test1$.dispatch("a2"),
    1000);

  console.log('await', await test1$.promise());
})();


test1$.unsubscribe(test2);

test1$.dispatch("a3");

