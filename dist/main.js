import { fillBackground, render } from "./render.js";
import { GRID_INFO } from "./constants.js";
/** Connexion WebSocket au serveur de jeu */
const socket = new WebSocket("ws://localhost:8080");
const canvas = document.getElementById("pixel-fight");
const button = document.getElementById("paint-button");
const ctx = canvas.getContext("2d");
canvas.width = GRID_INFO.WIDTH * 2;
canvas.height = GRID_INFO.HEIGHT * 2;
fillBackground(ctx);
// Envoie une action de peinture au serveur au clic du bouton
button.addEventListener("click", () => {
    socket.send(JSON.stringify({ type: "paint" }));
});
// Reçoit l'état mis à jour du serveur et redessine le canvas
socket.addEventListener("message", (event) => {
    const state = JSON.parse(event.data);
    render(ctx, state);
});
//# sourceMappingURL=main.js.map