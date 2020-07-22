import router from "./router";
import { $ } from "carbonium";
import { Cuprum, fromEvent } from "cuprum";
import { analyticsInit, analyticsPageview } from "./analytics";
import { GolInfo } from "../web-components/info";

let isLexiconLoaded = false;

export function routeListener(newPattern$: Cuprum<string>) {
  const lexicon = <GolInfo>$("#lexicon");
  const info = <GolInfo>$("#info");

  router.observable$.subscribe(({ path, isNew }, oldState) => {
    if (oldState) {
      if (path == oldState.path) {
        return;
      }
      go(oldState.path, false, oldState.isNew);
    }
    go(path, true, isNew);
  });

  async function go(path: string, enter: boolean, isNew: boolean) {
    if (!path) {
      return;
    }

    switch (path) {
      case "/":
        setTitle();
        break;
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
          const matchArray = path.match(/\/lexicon\/(.+)/);
          if (matchArray) {
            newPattern$.dispatch("");
            const json = await (
              await fetch(`/lexicon/data/${matchArray[1]}.json`)
            ).json();
            newPattern$.dispatch(json.pattern);
            setTitle(json.name);
          }
        }
    }
    analyticsPageview(path);
  }
}

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

async function loadLexicon() {
  if (isLexiconLoaded) {
    return;
  }

  const currentTerm = $("[data-term]").getAttribute("data-term");

  const lexicon = await (await fetch("/list.html")).text();

  $("#lexicon .selection").innerHTML = lexicon;

  if (currentTerm) {
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

// Browser fix hash change
fromEvent(window, "hashchange").subscribe(() => {
  $(`a[name='${document.location.hash.substr(1)}']`).scrollIntoView();
});

analyticsInit("UA-93616-2");
