import { Cuprum } from "cuprum";

class Router {
  private subject$ = new Cuprum<HistoryState>();
  private depth = 0;

  constructor() {
    this.dispatch(this.fullPath);

    window.onpopstate = () => {
      this.dispatch(this.fullPath, false);
    };
  }

  push(url: string, isNew: boolean = true) {
    this.depth++;
    history.pushState(null, "", url);
    this.dispatch(url, isNew);
  }

  back() {
    if (this.depth > 0) {
      this.depth--;
      history.back();
    } else {
      this.push("/", false);
    }
  }

  get fullPath() {
    return `${document.location.pathname}${document.location.search}${document.location.hash}`;
  }

  get observable$() {
    return this.subject$.observable();
  }

  private dispatch(path: string, isNew: boolean = true) {
    setTimeout(() => {
      this.subject$.dispatch({ path: stripHash(path), isNew });
    }, 0);
  }
}

function stripHash(url: string): string {
  const matches = url.match(/(.+)#/);
  return matches ? matches[1] : url;
}

export default new Router();
