import { GofCanvas } from "./web-components/canvas";
import { GofInfo } from "./web-components/info";
import { GofControls } from "./web-components/controls";
import { Shape } from "./components/shape";
import { $ } from "carbonium";
import { GofButton } from "./web-components/button";
import router from "./components/router";
import { Cuprum, fromEvent } from "cuprum";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = <GofCanvas>$("gof-canvas");
  const controls = <GofControls>$("gof-controls");
  const info = <GofInfo>$("#info");
  const lexicon = <GofInfo>$("#lexicon");
  const shape = new Shape();
  const newPattern$ = new Cuprum<string>();
  let currentPattern = "";
  let isLexiconLoaded = false;

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
        if (path == oldState.path) {
          return;
        }
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
          setTitle("Info");
        } else {
          info.removeAttribute("open");
          setTitle();
        }
        break;
      case "/lexicon":
        if (enter) {
          lexicon.setAttribute("open", "");
          setTitle("Lexicon");
          loadLexicon();
        } else {
          lexicon.removeAttribute("open");
          setTitle();
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
            setTitle(json.name);
          }
        }
    }
  }

  async function loadLexicon() {
    if (isLexiconLoaded) {
      return;
    }

    const currentTerm = $("[data-term]").getAttribute("data-term");

    const lexicon = await (await fetch("/list.html")).text();

    $("#lexicon .selection").innerHTML = lexicon;

    if (currentTerm) {
      console.log("currentTerm", currentTerm);
      $(`[data-term='${currentTerm}']`).scrollIntoView();
    } else {
      const currentHash = document.location.hash.substr(1);
      if (currentHash) {
        document.location.hash = currentHash;
      }
    }

    fromEvent($("#lexicon [data-internal]"), "click").subscribe((event) => {
      const a = (<HTMLElement>event.target).closest("a");
      router.push(a.href);
      event.preventDefault();
    });
    isLexiconLoaded = true;
  }
});

function titleCase(str) {
  return `${str[0].toUpperCase()}${str.substr(1)}`;
}

function setTitle(title?: string) {
  if (title) {
    window.document.title = `${titleCase(title)} - John Conway’s Game of Life`;
  } else {
    window.document.title = "Play John Conway’s Game of Life";
  }
}
