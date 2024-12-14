var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class MusicAnalyzer {
    constructor() {
        this.isPlaying = false;
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.animationFrameId = null;
        this.initialized = false;
    }
    initializeAudioContext() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if AudioContext is supported
            if (!window.AudioContext) {
                console.error('Web Audio API is not supported in this browser.');
                return;
            }
            // Initialize AudioContext
            this.audioContext = new AudioContext();
            console.log("Sample rate: ", this.audioContext.sampleRate);
            // Create AnalyserNode
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.connect(this.audioContext.destination);
            console.log('Audio context initialized successfully.');
            this.initialized = true;
        });
    }
    loadAudio(blob) {
        return __awaiter(this, void 0, void 0, function* () {
            // Initialize AudioContext if not already initialized
            if (!this.audioContext) {
                yield this.initializeAudioContext();
            }
            // Check if AudioContext is initialized
            if (!this.audioContext) {
                console.error('Audio context is not initialized. Please initialize it first.');
                return;
            }
            if (this.isPlaying) {
                this.stopAudio();
            }
            try {
                this.audioFile = blob;
                this.audioBuffer = yield this.audioContext.decodeAudioData(this.audioFile);
                this.source = this.audioContext.createBufferSource();
                this.source.connect(this.analyser);
                this.source.buffer = this.audioBuffer;
                this.current = 0;
                console.log('Audio file loaded.');
            }
            catch (error) {
                console.error('Error loading audio file:', error);
                return null;
            }
        });
    }
    playAudio() {
        return __awaiter(this, void 0, void 0, function* () {
            // Check if AudioContext is initialized
            if (!this.audioContext) {
                console.error('Audio context is not initialized. Please initialize it first.');
                return;
            }
            // Check if source is initialized
            if (!this.source) {
                console.error('Missing audio buffer. Please load a music file.');
                return;
            }
            if (!this.isPlaying) {
                try {
                    this.isPlaying = true;
                    // const audioBuffer = await this.audioContext.decodeAudioData(this.audioFile);
                    this.source = this.audioContext.createBufferSource();
                    this.source.connect(this.analyser);
                    this.source.buffer = this.audioBuffer;
                    this.source.start(0, this.current);
                    console.log('Audio file started playback.');
                    // Start frequency analysis
                    return this.analyzeFrequency();
                }
                catch (error) {
                    console.error('Error loading audio file:', error);
                    return null;
                }
            }
        });
    }
    pauseAudio() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check if AudioContext is initialized
            if (!this.audioContext) {
                console.error('Audio context is not initialized. Please initialize it first.');
                return;
            }
            // Check if source is initialized
            if (!this.source) {
                console.error('Missing audio buffer. Please load a music file.');
                return;
            }
            // Check if audio is currently playing
            if (this.isPlaying) {
                try {
                    this.isPlaying = false;
                    (_a = this.source) === null || _a === void 0 ? void 0 : _a.stop(); // Pause the audio playback
                    this.stopAnalyzingFrequency(); // Stop the frequency analysis
                    this.current = this.getCurrentTime();
                    console.log("current time: ", this.current);
                    console.log('Audio playback paused.');
                }
                catch (error) {
                    console.error('Error pausing audio playback:', error);
                }
            }
            else {
                console.log('No audio is currently playing.');
            }
        });
    }
    stopAudio() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            // Check if AudioContext is initialized
            if (!this.audioContext) {
                console.error('Audio context is not initialized. Please initialize it first.');
                return;
            }
            // Check if source is initialized
            if (!this.source) {
                console.error('Missing audio buffer. Please load a music file.');
                return;
            }
            // Check if audio is currently playing
            if (this.isPlaying) {
                try {
                    this.isPlaying = false;
                    (_a = this.source) === null || _a === void 0 ? void 0 : _a.stop(); // Stop the audio playback
                    this.stopAnalyzingFrequency(); // Stop the frequency analysis
                    this.isPlaying = false; // Set isPlaying to false
                    this.current = 0;
                    console.log('Audio playback stopped.');
                }
                catch (error) {
                    console.error('Error stopping audio playback:', error);
                }
            }
            else {
                console.log('No audio is currently playing.');
            }
        });
    }
    analyzeFrequency() {
        if (!this.analyser) {
            console.error('AnalyserNode is not initialized.');
            return null;
        }
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        this.analyser.getByteFrequencyData(dataArray);
        const total = dataArray.reduce((acc, val) => acc + val, 0);
        const averageAmplitude = total / bufferLength;
        // console.log('Average amplitude:', averageAmplitude);
        // Continue analyzing frequency recursively
        this.animationFrameId = requestAnimationFrame(() => this.analyzeFrequency());
        // console.log(dataArray)
        // Return the frequency data array
        return dataArray;
    }
    stopAnalyzingFrequency() {
        // Stop analyzing frequency
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    getCurrentTime() {
        if (this.audioContext) {
            // Calculate the current time by subtracting the start time of the audio context from the current time
            return this.audioContext.currentTime;
        }
        else {
            console.error('Audio context or audio source is not initialized.');
            return -1;
        }
    }
    getSampleRate() {
        if (this.audioContext) {
            return this.audioContext.sampleRate;
        }
        return 0;
    }
    getFFTSize() {
        if (this.analyser) {
            return this.analyser.fftSize;
        }
        return 0;
    }
    playing() {
        return this.isPlaying;
    }
}
//# sourceMappingURL=music.js.map