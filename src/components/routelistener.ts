import router from "./router";
import { $ } from "carbonium";
import { Cuprum } from "cuprum";
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
          const lexiconMatch = location.hash.match(/#\$?(.+)/);
          lexicon.setAttribute("open", "");
          setTitle("Lexicon");
          loadLexicon(lexiconMatch?.[1]);
        } else {
          lexicon.removeAttribute("open");
          setTitle();
        }
        break;
      default:
        if (enter && isNew) {
          const shapeMatch = path.match(/\/lexicon\/(.+)/);
          if (shapeMatch) {
            newPattern$.dispatch("");
            const json = await (
              await fetch(`/lexicon/data/${shapeMatch[1]}.json`)
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
    lexiconJump(shape);
    return;
  }

  const lexiconHTML = $("#lexicon .selection");
  lexiconHTML.innerHTML = `
    <div class="loader"></div>
    <div class="loading">Loading lexicon…</div>`;

  const lexicon = await (await fetch("/list.html")).text();

  if (lexicon == "") {
    setTimeout(() => {
      $("#lexicon .selection").innerHTML = "Lexicon could not be loaded";
    }, 1000);
    return;
  }

  lexiconHTML.innerHTML = lexicon;
  lexiconJump(shape);

  isLexiconLoaded = true;
}

function lexiconJump(shape?: string) {
  const shapeElement = document.querySelector(`[data-term="${shape}"]`);

  if (shapeElement) {
    shapeElement.scrollIntoView();
  } else {
    const termElement = document.querySelector(`[id="${shape}"]`);
    if (termElement) {
      termElement.scrollIntoView();
    }
  }
}

// analyticsInit("G-V6DPPMYG5N");
