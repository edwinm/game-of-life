import { fromEvent } from "cuprum";

export function errorHandler() {
  fromEvent(window, "error").subscribe(() => {
    if (
      confirm(
        "⚠️ An error occurred.\n\nAre you using an older browser? Do you want to visit the Game of Life for older browsers?"
      )
    ) {
      document.location.assign("https://bitstorm.org/gameoflife/");
    }
  });
}
