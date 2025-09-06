import router from "./router";
import { $ } from "carbonium";
import { Cuprum, fromEvent } from "cuprum";
// import { analyticsInit, analyticsPageview } from "./analytics";
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
        const matchArray1 = path.match(/\/lexicon\?(.+)/);
        if (matchArray1) {
          if (enter) {
            lexicon.setAttribute("open", "");
            setTitle("Lexicon");
            loadLexicon(matchArray1[1]);
          } else {
            lexicon.removeAttribute("open");
            router.push(`/lexicon/${matchArray1[1]}`);
            setTitle();
          }
          return;
        }

        if (enter && isNew) {
          const matchArray2 = path.match(/\/lexicon\/(.+)/);
          if (matchArray2) {
            newPattern$.dispatch("");
            const json = await (
              await fetch(`/lexicon/data/${matchArray2[1]}.json`)
            ).json();
            newPattern$.dispatch(json.pattern);
            setTitle(json.name);
          }
        }
    }
    //analyticsPageview(path);
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

async function loadLexicon(shape?: string) {
  if (isLexiconLoaded) {
    return;
  }

  $("#lexicon .selection").innerHTML = `
    <div class="loader"></div>
    <div class="loading">Loading lexicon…</div>`;

  const lexicon = await (await fetch("/list.html")).text();

  if (lexicon == "") {
    setTimeout(() => {
      $("#lexicon .selection").innerHTML = "Lexicon could not be loaded";
    }, 1000);
    return;
  }

  $("#lexicon .selection").innerHTML = lexicon;

  const shapeElement = document.querySelector(`[data-term="${shape}"]`);

  console.log("shape", shape, shapeElement);

  if (shapeElement) {
    shapeElement.scrollIntoView();
  }

  isLexiconLoaded = true;
}

// analyticsInit("G-V6DPPMYG5N");
