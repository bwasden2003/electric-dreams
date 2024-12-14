import { Debugger } from "../lib/webglutils/Debugging.js";
import { Vec3, Vec4 } from "../lib/TSM.js";
import { CanvasAnimation } from "../lib/webglutils/CanvasAnimation.js";
import { RenderPass } from "../lib/webglutils/RenderPass.js";
import { GUI } from "./gui.js";
import { Terrain } from "./terrain.js";
import { Cylinder } from "./sun.js";
import { terrainFSText, terrainVSText, realisticTerrainFSText, realisticTerrainVSText, cylinderFSText, cylinderVSText } from "./shaders.js";
export class TerrainAnimation extends CanvasAnimation {
    constructor(canvas) {
        super(canvas);
        this.canvas = document.getElementById("glCanvas");
        this.ctx = Debugger.makeDebugContext(this.ctx);
        let gl = this.ctx;
        this.gui = new GUI(this.canvas, this);
        this.cellSize = 100;
        this.terrain = new Terrain(Math.ceil((canvas.height / this.cellSize) * 3), Math.ceil(canvas.width / this.cellSize), this.gui.camera.pos(), this.gui);
        this.terrainRenderPass = new RenderPass(this.extVAO, gl, terrainVSText, terrainFSText);
        this.realisticTerrainRenderPass = new RenderPass(this.extVAO, gl, realisticTerrainVSText, realisticTerrainFSText);
        this.sun = new Cylinder([0, 3, 30], [0, 3, 31], 0.5, 0.5, 24, 1, this.gui);
        this.sunRenderPass = new RenderPass(this.extVAO, gl, cylinderVSText, cylinderFSText);
        this.lightDirection = new Vec3([0, 1, -1]);
        this.backgroundColor = new Vec4([0.25, 0.0, 0.55, 1.0]);
        this.lastUpdate = 0;
        this.checked = false;
        this.initTerrain();
        this.initSun();
    }
    reset() {
        this.gui.reset();
    }
    resetTerrain() {
        this.terrain = new Terrain(Math.ceil(this.canvas.height / this.cellSize) * 4, Math.ceil(this.canvas.width / this.cellSize), this.gui.camera.pos(), this.gui);
        this.lastUpdate = 0;
        if (this.checked) {
            this.initRealisticTerrain();
        }
        else {
            this.initTerrain();
        }
    }
    initTerrain() {
        this.terrainRenderPass.setIndexBufferData(this.terrain.getIndices());
        this.terrainRenderPass.addAttribute("vertPosition", 4, this.ctx.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.terrain.getVertices());
        this.terrainRenderPass.addAttribute("normal", 4, this.ctx.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.terrain.getNormals());
        this.terrainRenderPass.addUniform("lightDirection", (gl, loc) => {
            gl.uniform3fv(loc, this.lightDirection.xyz);
        });
        this.terrainRenderPass.addUniform("mProj", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
        });
        this.terrainRenderPass.addUniform("mView", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
        });
        this.terrainRenderPass.addUniform("mousePosition", (gl, loc) => {
            gl.uniform2fv(loc, new Float32Array(this.gui.getMousePosition()));
        });
        this.terrainRenderPass.addUniform("hue", (gl, loc) => {
            gl.uniform1f(loc, this.gui.getHue());
        });
        this.terrainRenderPass.setDrawData(this.ctx.TRIANGLE_STRIP, this.terrain.getIndices().length, this.ctx.UNSIGNED_INT, 0);
        this.terrainRenderPass.setup();
    }
    initRealisticTerrain() {
        this.realisticTerrainRenderPass.setIndexBufferData(this.terrain.getIndices());
        this.realisticTerrainRenderPass.addAttribute("vertPosition", 4, this.ctx.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.terrain.getVertices());
        this.realisticTerrainRenderPass.addAttribute("normal", 4, this.ctx.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.terrain.getNormals());
        this.realisticTerrainRenderPass.addUniform("lightDirection", (gl, loc) => {
            gl.uniform3fv(loc, this.lightDirection.xyz);
        });
        this.realisticTerrainRenderPass.addUniform("mProj", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
        });
        this.realisticTerrainRenderPass.addUniform("mView", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
        });
        this.realisticTerrainRenderPass.addUniform("mProjInv", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().inverse().all()));
        });
        this.realisticTerrainRenderPass.addUniform("mViewInv", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().inverse().all()));
        });
        this.realisticTerrainRenderPass.setDrawData(this.ctx.TRIANGLE_STRIP, this.terrain.getIndices().length, this.ctx.UNSIGNED_INT, 0);
        this.realisticTerrainRenderPass.setup();
    }
    initSun() {
        this.sunRenderPass.setIndexBufferData(this.sun.indicesFlat());
        this.sunRenderPass.addAttribute("vertPosition", 3, this.ctx.FLOAT, false, 4 * Float32Array.BYTES_PER_ELEMENT, 0, undefined, this.sun.positionsFlat());
        this.sunRenderPass.addUniform("mProj", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.projMatrix().all()));
        });
        this.sunRenderPass.addUniform("mView", (gl, loc) => {
            gl.uniformMatrix4fv(loc, false, new Float32Array(this.gui.viewMatrix().all()));
        });
        this.sunRenderPass.setDrawData(this.ctx.TRIANGLE_FAN, this.sun.indicesFlat().length, this.ctx.UNSIGNED_INT, 0);
        this.sunRenderPass.setup();
    }
    draw() {
        const gl = this.ctx;
        gl.clearColor(this.gui.backgroundColor.x, this.gui.backgroundColor.y, this.gui.backgroundColor.z, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.frontFace(gl.CW);
        gl.cullFace(gl.BACK);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); // null is the default frame buffer
        this.drawScene(0, 0, this.canvas.width, this.canvas.height);
    }
    drawScene(x, y, width, height) {
        const gl = this.ctx;
        gl.viewport(x, y, width, height);
        const now = Date.now();
        if (this.gui.getMusicAnalyzer().playing()) {
            this.terrain.update(now - this.lastUpdate);
            this.sun.update(now - this.lastUpdate);
            this.sunRenderPass.updateVertPosition(this.sun.positionsFlat());
            if (this.checked) {
                this.realisticTerrainRenderPass.updateVertPosition(this.terrain.getVertices());
                this.realisticTerrainRenderPass.updateNormals(this.terrain.getNormals());
            }
            else {
                this.terrainRenderPass.updateVertPosition(this.terrain.getVertices());
                this.terrainRenderPass.updateNormals(this.terrain.getNormals());
            }
            this.lastUpdate = now;
        }
        if (this.checked) {
            this.realisticTerrainRenderPass.draw();
        }
        else {
            this.terrainRenderPass.draw();
        }
        this.sunRenderPass.draw();
    }
}
export function initializeCanvas() {
    const canvas = document.getElementById("glCanvas");
    const canvasAnimation = new TerrainAnimation(canvas);
    canvasAnimation.start();
}
//# sourceMappingURL=app.js.map