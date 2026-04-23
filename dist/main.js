import { fillBackground } from "./render.js";
import { GRID_INFO } from "./constants.js";
const socket = new WebSocket("ws://localhost:8080");
const canvas = document.getElementById("pixel-fight");
const button = document.getElementById("paint-button");
const ctx = canvas.getContext("2d");
canvas.width = GRID_INFO.WIDTH * 2;
canvas.height = GRID_INFO.HEIGHT * 2;
// Partie connexion client
fillBackground(ctx);
button.addEventListener("click", () => {
    socket.send("paint");
});
socket.addEventListener("message", (event) => {
    const state = JSON.parse(event.data);
    render(ctx, state);
});
console.log(ctx);
//# sourceMappingURL=main.js.map