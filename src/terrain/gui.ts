import { Camera } from "../lib/webglutils/Camera.js";
import { TerrainAnimation } from "./app.js";
import { Mat4, Vec3, Vec4 } from "../lib/TSM.js";
import { Terrain } from "./terrain.js";
import { RenderPass } from "../lib/webglutils/RenderPass.js";
import{MusicAnalyzer} from "../lib/music.js";

interface IGUI {
    viewMatrix(): Mat4;
    projMatrix(): Mat4;
    onKeydown(ke: KeyboardEvent): void;
}

export class GUI implements IGUI {
    public camera: Camera;
    public height: number;
    public width: number;
    public animation: TerrainAnimation;
    private musicAnalyzer = new MusicAnalyzer();
    private audioBuffer: ArrayBuffer;
   

    public mousePosition: number[];

    public backgroundColor: Vec3;

    public sunFactor: number;
    public midFactor: number;
    public bassFactor: number;
    public speedFactor: number;

    public vertexFactor: number;
    public noiseFactor: number;
    public hue: number;

     /**
   *
   * @param canvas required to get the width and height of the canvas
   */

    constructor(canvas: HTMLCanvasElement, animation: TerrainAnimation) {
        this.height = canvas.height;
        this.width = canvas.width;
        console.log("GUI Width: ", this.width);
        console.log("GUI Height: ", this.height);
        this.mousePosition = [0, 0];

        this.backgroundColor = new Vec3([0.0, 0.0, 1.0]);

        this.animation = animation;

        this.camera = new Camera(
            new Vec3([0, 2, -10]),
            new Vec3([0, 1, 0]),
            new Vec3([0, 1, 0]),
            45,
            this.width / this.height,
            0.1,
            1000.0
        );

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

    public handleResize(): void {
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        const canvas = document.getElementById('glCanvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.width = this.width;
            canvas.height = this.height;
        }

        this.camera.setAspect(this.width / this.height);
    }

    public reset(): void {
        
    }
    /**
   * Callback function for a key press event
   * @param key
   */
    public async onKeydown(key: KeyboardEvent): Promise<void> {
        switch (key.code) {
            case "Digit1": {
                console.log("Digit 2 pressed. Play audio file.");
                let fileHandle;
                let fileData;
                let audioBlob;
                async function fileListener(): Promise<void> {
                    console.log("File Listener");
                    try {
                        [fileHandle] = await (window as any).showOpenFilePicker()
                        fileData = await fileHandle.getFile();
                        audioBlob = await getFileArrayBuffer(fileData);
                    } catch (error) {
                        console.error("File Error: ", error);
                    }
                }

                // Function to convert file to ArrayBuffer using FileReader
                async function getFileArrayBuffer(file) {
                    console.log("File Array Buffer")
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();

                        reader.onload = function(event) {
                            const arrayBuffer = event.target?.result;
                            resolve(arrayBuffer);
                        };

                        reader.onerror = function(error) {
                            reject(error);
                        };

                        reader.readAsArrayBuffer(file);
                    });
                }
                
                await fileListener();

                if(fileData.type === "audio/mpeg" || fileData.type === "audio/wav") {
                    this.audioBuffer = audioBlob;
                    this.musicAnalyzer.loadAudio(this.audioBuffer);
                    alert(fileData.name + " uploaded successfully!");
                } else {
                    alert("This file is not a valid audio file. Please try again.")
                }
                
                console.log("audio buffer: ", this.audioBuffer)
                break;
            }
            case "Digit2": {
                console.log("Digit 3 pressed. Play audio file.");
                this.musicAnalyzer.playAudio();
								this.musicAnalyzer
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
                async function getFileArrayBuffer(file) {
                    console.log("File Array Buffer")
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();

                        reader.onload = function(event) {
                            const arrayBuffer = event.target?.result;
                            resolve(arrayBuffer);
                        };

                        reader.onerror = function(error) {
                            reject(error);
                        };

                        reader.readAsArrayBuffer(file);
                    });
                }

                let response = await fetch("./lib/music/Woah.mp3")
                let audioBlob = await response.arrayBuffer()
                this.audioBuffer = audioBlob
                this.musicAnalyzer.loadAudio(this.audioBuffer)
                alert("Woah.mp3 uploaded successfully!");


            }
            case "KeyW": {
                
                if(this.camera.pos().y<=5){
                this.camera.offset(this.camera.up(), 0.1, true);
                }
                else{this.camera.setPos(new Vec3([0,5,-10]))}
                break;
              }
              case "KeyS": {
               
                if(this.camera.pos().y>=2){
                this.camera.offset(this.camera.up().negate(), 0.1, true);
                }
                else{this.camera.setPos(new Vec3([0,2,-10]))}
                break;
              }

          default: {
            console.log("Key : '", key.code, "' was pressed.");
            break;
          }
        }
    }
    /**
     * Sets the GUI's camera to the given camera
     * @param cam a new camera
     */
    public setCamera(
        pos: Vec3,
        target: Vec3,
        upDir: Vec3,
        fov: number,
        aspect: number,
        zNear: number,
        zFar: number
    ) {
        this.camera = new Camera(pos, target, upDir, fov, aspect, zNear, zFar);
    }

    public viewMatrix(): Mat4 {
        return this.camera.viewMatrix();    
    }

    public projMatrix(): Mat4 {
        return this.camera.projMatrix();
    }

    public getMusicAnalyzer(): MusicAnalyzer {
        return this.musicAnalyzer;
    }

    /**
     * Registers all event listeners for the GUI
     * @param canvas The canvas being used
     */
    private registerEventListeners(canvas: HTMLCanvasElement): void {
        /* Event listener for key controls */
        window.addEventListener("keydown", (key: KeyboardEvent) =>
            this.onKeydown(key)
        );

        canvas.addEventListener("mousemove", (mouse: MouseEvent) => 
            this.calculateMouse(mouse)
        );

        const shaderToggle = document.getElementById("shaderToggle") as HTMLInputElement;
        shaderToggle.addEventListener("input", (event) => {
            if (this.animation.checked) {
                this.animation.checked = false;
                this.animation.initTerrain();
            } else {
                this.animation.checked = true;
                this.animation.initRealisticTerrain();
            }
        });

        const backgroundColorPicker = document.getElementById("backgroundColorPicker") as HTMLInputElement;
        backgroundColorPicker.addEventListener("input", (event) => {
            const input = event.target as HTMLInputElement;
            this.updateBackgroundColor(input.value);
        });

        const terrainColorPicker = document.getElementById("terrainColorPicker") as HTMLInputElement;
        terrainColorPicker.addEventListener("input", (event) => {
            const input = event.target as HTMLInputElement;
            this.updateTerrainColor(parseFloat(input.value));
        });

        const sunSlider = document.getElementById('sun-slider') as HTMLInputElement;
        sunSlider.addEventListener("input", (event) => {
            const input = event.target as HTMLInputElement;
            this.sunFactor = parseFloat(input.value); 
        });

        const midSlider = document.getElementById('mid-slider') as HTMLInputElement;
        midSlider.addEventListener("input", (event) => {
            const input = event.target as HTMLInputElement;
            this.midFactor = parseFloat(input.value); 
        });

        const bassSlider = document.getElementById('bass-slider') as HTMLInputElement;
        bassSlider.addEventListener("input", (event) => {
            const input = event.target as HTMLInputElement;
            this.bassFactor = parseFloat(input.value); 
        });

        const speedSlider = document.getElementById('speed-slider') as HTMLInputElement;
        speedSlider.addEventListener("input", (event) => {
            const input = event.target as HTMLInputElement;
            this.speedFactor = parseFloat(input.value); 
        });

        const vertexFactorSlider = document.getElementById("vertexFactor") as HTMLInputElement;
        const noiseFactorSlider = document.getElementById("noiseScale") as HTMLInputElement;

        vertexFactorSlider.addEventListener('input', (event) => {
            const input = event.target as HTMLInputElement;
            this.vertexFactor = (parseFloat(input.value));
            this.animation.resetTerrain();
        });
        noiseFactorSlider.addEventListener('input', (event) => {
            const input = event.target as HTMLInputElement;
            this.noiseFactor = (parseFloat(input.value));
        });
    }

    private updateBackgroundColor(hexColor: string): void {
        const r = parseInt(hexColor.substring(1, 3), 16) / 255;
        const g = parseInt(hexColor.substring(3, 5), 16) / 255;
        const b = parseInt(hexColor.substring(5, 7), 16) / 255;
        this.backgroundColor.x = r;
        this.backgroundColor.y = g;
        this.backgroundColor.z = b;
    }

    private updateTerrainColor(hue: number): void {
        this.hue = hue;
    }

    public getHue(): number {
        return this.hue;
    }

    private calculateMouse(mouse: MouseEvent) {
        this.mousePosition[0] = mouse.clientX / this.width;
        this.mousePosition[1] = mouse.clientY / this.height;
    }

    public getMousePosition() {
        return new Float32Array(this.mousePosition);
    }

    public getFrequencyIndices(sampleRate: number, fftSize: number, lowFreq: number, highFreq: number) {
        const frequencyPerBin = sampleRate / fftSize;
        return {
            startIndex: Math.floor(lowFreq / frequencyPerBin),
            endIndex: Math.floor(highFreq / frequencyPerBin)
        };
    }

    public getAverageFrequency(dataArray, startIndex, endIndex) {
        let sum = 0;
        let count = endIndex - startIndex + 1;
        for (let i = startIndex; i <= endIndex; i++) {
            sum += dataArray[i]
        }
        return sum / count;
    }

    public updateFrequencyData() {
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