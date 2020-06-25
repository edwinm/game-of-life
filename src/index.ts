import { GofCanvas } from "./web-components/canvas";
import { GofInfo } from "./web-components/info";
import { GofControls } from "./web-components/controls";
import { Shape } from "./components/shape";
import { $ } from "carbonium";
import { GofButton } from "./web-components/button";
import router from "./components/router";
import { Cuprum } from "cuprum";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = <GofCanvas>$("gof-canvas");
  const controls = <GofControls>$("gof-controls");
  const info = <GofInfo>$("#info");
  const lexicon = <GofInfo>$("#lexicon");
  const shape = new Shape();
  const newPattern$ = new Cuprum<string>();
  let currentPattern = "";

  const { infoIsOpen$ } = info.getObservers();
  const {
    click$,
    dimension$,
    offset$,
    initialPattern$,
  } = canvas.getObservers();
  const { redraw$ } = shape.getObservers();
  const { nextShape$, resize$, size$ } = controls.getObservers();

  canvas.setObservers(redraw$, resize$, size$);
  shape.setObservers(
    initialPattern$,
    newPattern$,
    nextShape$,
    dimension$,
    click$,
    offset$
  );
  controls.setObservers(redraw$, click$, infoIsOpen$);

  routeListener();

  // Prevent tree shaking of web components
  if (GofCanvas && GofInfo && GofControls && GofButton) {
  }

  function routeListener() {
    router.observable$.subscribe(({ path, isNew }, oldState) => {
      if (oldState) {
        go(oldState.path, false, oldState.isNew);
      }
      go(path, true, isNew);
    });
  }

  async function go(url: string, enter: boolean, isNew: boolean) {
    if (!url) {
      return;
    }

    // console.log('go', url, enter, isNew);

    switch (url) {
      case "/info":
        if (enter) {
          info.setAttribute("open", "");
        } else {
          info.removeAttribute("open");
        }
        break;
      case "/lexicon":
        if (enter) {
          lexicon.setAttribute("open", "");
        } else {
          lexicon.removeAttribute("open");
        }
        break;
      default:
        if (enter && isNew) {
          const matchArray = url.match(/\/lexicon\/(.+)/);
          if (matchArray && matchArray[1] != currentPattern) {
            currentPattern = matchArray[1];
            const json = await (
              await fetch(`/lexicon/data/${currentPattern}.json`)
            ).json();
            newPattern$.dispatch(json.pattern);
          }
        }
    }
  }
});
