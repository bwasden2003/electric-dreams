import { initializeCanvas } from "./app.js";
function init() {
    const canvas = document.getElementById("glCanvas");
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    console.log("Init Width: ", canvas.width);
    console.log("Init Height: ", canvas.height);
    initializeCanvas();
}
init();
//# sourceMappingURL=index.js.map