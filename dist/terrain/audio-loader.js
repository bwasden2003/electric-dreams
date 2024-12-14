import { FileLoader } from "../lib/threejs/src/Three.js";
class AudioLoader {
    constructor(location) {
        this.fileLocation = location;
        this.loader = new FileLoader;
    }
    load(callback) {
        this.loader.load(this.fileLocation, (response) => {
            console.log("File loaded successfully");
        }, undefined, (event) => {
            console.error("Loading audio file failed");
            console.error(event);
        });
    }
}
//# sourceMappingURL=audio-loader.js.map