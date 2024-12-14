var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Camera } from "../lib/webglutils/Camera.js";
import { Vec3 } from "../lib/TSM.js";
import { MusicAnalyzer } from "../lib/music.js";
export class GUI {
    /**
  *
  * @param canvas required to get the width and height of the canvas
  */
    constructor(canvas, animation) {
        this.musicAnalyzer = new MusicAnalyzer();
        this.height = canvas.height;
        this.width = canvas.width;
        console.log("GUI Width: ", this.width);
        console.log("GUI Height: ", this.height);
        this.mousePosition = [0, 0];
        this.backgroundColor = new Vec3([0.0, 0.0, 1.0]);
        this.animation = animation;
        this.camera = new Camera(new Vec3([0, 2, -10]), new Vec3([0, 1, 0]), new Vec3([0, 1, 0]), 45, this.width / this.height, 0.1, 1000.0);
        this.sunFactor = 0.1;
        this.midFactor = 5.0;
        this.bassFactor = 3.0;
        this.speedFactor = 0.1;
        this.vertexFactor = 10;
        this.noiseFactor = 1.0;
        this.hue = 180;
        this.registerEventListeners(canvas);
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    handleResize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        const canvas = document.getElementById('glCanvas');
        if (canvas) {
            canvas.width = this.width;
            canvas.height = this.height;
        }
        this.camera.setAspect(this.width / this.height);
    }
    reset() {
    }
    /**
   * Callback function for a key press event
   * @param key
   */
    onKeydown(key) {
        return __awaiter(this, void 0, void 0, function* () {
            switch (key.code) {
                case "Digit1": {
                    console.log("Digit 2 pressed. Play audio file.");
                    let fileHandle;
                    let fileData;
                    let audioBlob;
                    function fileListener() {
                        return __awaiter(this, void 0, void 0, function* () {
                            console.log("File Listener");
                            try {
                                [fileHandle] = yield window.showOpenFilePicker();
                                fileData = yield fileHandle.getFile();
                                audioBlob = yield getFileArrayBuffer(fileData);
                            }
                            catch (error) {
                                console.error("File Error: ", error);
                            }
                        });
                    }
                    // Function to convert file to ArrayBuffer using FileReader
                    function getFileArrayBuffer(file) {
                        return __awaiter(this, void 0, void 0, function* () {
                            console.log("File Array Buffer");
                            return new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = function (event) {
                                    var _a;
                                    const arrayBuffer = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                                    resolve(arrayBuffer);
                                };
                                reader.onerror = function (error) {
                                    reject(error);
                                };
                                reader.readAsArrayBuffer(file);
                            });
                        });
                    }
                    yield fileListener();
                    if (fileData.type === "audio/mpeg" || fileData.type === "audio/wav") {
                        this.audioBuffer = audioBlob;
                        this.musicAnalyzer.loadAudio(this.audioBuffer);
                        alert(fileData.name + " uploaded successfully!");
                    }
                    else {
                        alert("This file is not a valid audio file. Please try again.");
                    }
                    console.log("audio buffer: ", this.audioBuffer);
                    break;
                }
                case "Digit2": {
                    console.log("Digit 3 pressed. Play audio file.");
                    this.musicAnalyzer.playAudio();
                    this.musicAnalyzer;
                    break;
                }
                case "Digit3": {
                    console.log("Digit 4 pressed. Pause audio file.");
                    this.musicAnalyzer.pauseAudio();
                    break;
                }
                case "Digit4": {
                    console.log("Digit 5 pressed. Stop audio file.");
                    this.musicAnalyzer.stopAudio();
                    break;
                }
                case "Digit5": {
                    // Function to convert file to ArrayBuffer using FileReader
                    function getFileArrayBuffer(file) {
                        return __awaiter(this, void 0, void 0, function* () {
                            console.log("File Array Buffer");
                            return new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = function (event) {
                                    var _a;
                                    const arrayBuffer = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
                                    resolve(arrayBuffer);
                                };
                                reader.onerror = function (error) {
                                    reject(error);
                                };
                                reader.readAsArrayBuffer(file);
                            });
                        });
                    }
                    let response = yield fetch("./lib/music/Woah.mp3");
                    let audioBlob = yield response.arrayBuffer();
                    this.audioBuffer = audioBlob;
                    this.musicAnalyzer.loadAudio(this.audioBuffer);
                    alert("Woah.mp3 uploaded successfully!");
                }
                case "KeyW": {
                    if (this.camera.pos().y <= 5) {
                        this.camera.offset(this.camera.up(), 0.1, true);
                    }
                    else {
                        this.camera.setPos(new Vec3([0, 5, -10]));
                    }
                    break;
                }
                case "KeyS": {
                    if (this.camera.pos().y >= 2) {
                        this.camera.offset(this.camera.up().negate(), 0.1, true);
                    }
                    else {
                        this.camera.setPos(new Vec3([0, 2, -10]));
                    }
                    break;
                }
                default: {
                    console.log("Key : '", key.code, "' was pressed.");
                    break;
                }
            }
        });
    }
    /**
     * Sets the GUI's camera to the given camera
     * @param cam a new camera
     */
    setCamera(pos, target, upDir, fov, aspect, zNear, zFar) {
        this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
    }
    viewMatrix() {
        return this.camera.viewMatrix();
    }
    projMatrix() {
        return this.camera.projMatrix();
    }
    getMusicAnalyzer() {
        return this.musicAnalyzer;
    }
    /**
     * Registers all event listeners for the GUI
     * @param canvas The canvas being used
     */
    registerEventListeners(canvas) {
        /* Event listener for key controls */
        window.addEventListener("keydown", (key) => this.onKeydown(key));
        canvas.addEventListener("mousemove", (mouse) => this.calculateMouse(mouse));
        const shaderToggle = document.getElementById("shaderToggle");
        shaderToggle.addEventListener("input", (event) => {
            if (this.animation.checked) {
                this.animation.checked = false;
                this.animation.initTerrain();
            }
            else {
                this.animation.checked = true;
                this.animation.initRealisticTerrain();
            }
        });
        const backgroundColorPicker = document.getElementById("backgroundColorPicker");
        backgroundColorPicker.addEventListener("input", (event) => {
            const input = event.target;
            this.updateBackgroundColor(input.value);
        });
        const terrainColorPicker = document.getElementById("terrainColorPicker");
        terrainColorPicker.addEventListener("input", (event) => {
            const input = event.target;
            this.updateTerrainColor(parseFloat(input.value));
        });
        const sunSlider = document.getElementById('sun-slider');
        sunSlider.addEventListener("input", (event) => {
            const input = event.target;
            this.sunFactor = parseFloat(input.value);
        });
        const midSlider = document.getElementById('mid-slider');
        midSlider.addEventListener("input", (event) => {
            const input = event.target;
            this.midFactor = parseFloat(input.value);
        });
        const bassSlider = document.getElementById('bass-slider');
        bassSlider.addEventListener("input", (event) => {
            const input = event.target;
            this.bassFactor = parseFloat(input.value);
        });
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener("input", (event) => {
            const input = event.target;
            this.speedFactor = parseFloat(input.value);
        });
        const vertexFactorSlider = document.getElementById("vertexFactor");
        const noiseFactorSlider = document.getElementById("noiseScale");
        vertexFactorSlider.addEventListener('input', (event) => {
            const input = event.target;
            this.vertexFactor = (parseFloat(input.value));
            this.animation.resetTerrain();
        });
        noiseFactorSlider.addEventListener('input', (event) => {
            const input = event.target;
            this.noiseFactor = (parseFloat(input.value));
        });
    }
    updateBackgroundColor(hexColor) {
        const r = parseInt(hexColor.substring(1, 3), 16) / 255;
        const g = parseInt(hexColor.substring(3, 5), 16) / 255;
        const b = parseInt(hexColor.substring(5, 7), 16) / 255;
        this.backgroundColor.x = r;
        this.backgroundColor.y = g;
        this.backgroundColor.z = b;
    }
    updateTerrainColor(hue) {
        this.hue = hue;
    }
    getHue() {
        return this.hue;
    }
    calculateMouse(mouse) {
        this.mousePosition[0] = mouse.clientX / this.width;
        this.mousePosition[1] = mouse.clientY / this.height;
    }
    getMousePosition() {
        return new Float32Array(this.mousePosition);
    }
    getFrequencyIndices(sampleRate, fftSize, lowFreq, highFreq) {
        const frequencyPerBin = sampleRate / fftSize;
        return {
            startIndex: Math.floor(lowFreq / frequencyPerBin),
            endIndex: Math.floor(highFreq / frequencyPerBin)
        };
    }
    getAverageFrequency(dataArray, startIndex, endIndex) {
        let sum = 0;
        let count = endIndex - startIndex + 1;
        for (let i = startIndex; i <= endIndex; i++) {
            sum += dataArray[i];
        }
        return sum / count;
    }
    updateFrequencyData() {
        if (this.musicAnalyzer.initialized) {
            let freqData = this.musicAnalyzer.analyzeFrequency();
            const bassIndices = this.getFrequencyIndices(this.musicAnalyzer.getSampleRate(), this.musicAnalyzer.getFFTSize(), 20, 150);
            const midIndices = this.getFrequencyIndices(this.musicAnalyzer.getSampleRate(), this.musicAnalyzer.getFFTSize(), 150, 4000);
            const bassAverage = this.getAverageFrequency(freqData, bassIndices.startIndex, bassIndices.endIndex);
            const midAverage = this.getAverageFrequency(freqData, midIndices.startIndex, midIndices.endIndex);
            return {
                bass: bassAverage,
                mid: midAverage
            };
        }
        return {
            bass: 0,
            mid: 0
        };
    }
}
//# sourceMappingURL=gui.js.map