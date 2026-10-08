import { MiniGolfGame } from "./core/game.js";

const canvas = document.getElementById("gameCanvas");
const game = new MiniGolfGame(canvas);
game.start();
