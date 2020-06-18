import { Cuprum } from "cuprum";

class Router {
  private subject$ = new Cuprum<string>();

  constructor() {
    this.dispatch(this.fullPath);

    window.onpopstate = () => {
      this.dispatch(this.fullPath);
    };
  }

  push(url) {
    history.pushState(null, "", url);
    this.dispatch(url);
  }

  back() {
    history.back();
    this.subject$.dispatch(this.fullPath);
  }

  get fullPath() {
    return `${document.location.pathname}${document.location.search}${document.location.hash}`;
  }

  get observable$() {
    return this.subject$.observable();
  }

  private dispatch(url: string) {
    setTimeout(()=>{
      this.subject$.dispatch(url);
    }, 0);
  }
}

const router = new Router();

export default router;
