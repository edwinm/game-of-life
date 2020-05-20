import {GofCanvas} from "./components/canvas";
import {GofInfo} from "./components/info";
import {GofGameOfLife} from "./components/gameoflife";
import {GofControls} from "./components/controls";
import Gof from "./gameoflife";
import $ from './miq';

$(Gof);

console.log(GofCanvas && GofInfo && GofGameOfLife && GofControls && "Game of Life");
