import { Vec3 } from "../lib/TSM.js";
import * as SimplexNoise from "./simplex-noise.js";
export class Terrain {
    constructor(height, width, cameraPosition, gui) {
        this.height = height;
        this.width = width;
        this.cameraPosition = cameraPosition;
        this.gui = gui;
        // how many vertices per unit length in the terrain strip
        this.vertexFactor = this.gui.vertexFactor;
        this.noiseFunction = SimplexNoise.createNoise3D();
        this.indices = [];
        this.segments = [];
        this.createSegments();
        this.concatenateIndices();
    }
    // creates a list of terrain segments whose length is equal to height + 1
    createSegments() {
        let segments = [];
        const width = this.width;
        const height = this.height;
        let startX = -1 * (width / 2);
        let startZ = ((height * 5) / 8);
        for (let i = 0; i <= height; i++) {
            const z = startZ - i;
            segments.push(new TerrainSegment(width, this.height, startX, z, this.noiseFunction, this.gui));
        }
        this.segments = segments;
    }
    // creates the indices array for the whole terrain, since segments get regenerated, as long as the segments are in the array in the right order the indices don't need to be adjusted
    concatenateIndices() {
        let indices = [];
        let numStrips = this.segments.length;
        let verticesPerStrip = (this.width * this.vertexFactor) + 1;
        for (let i = 0; i < numStrips - 1; i++) {
            if (i > 0) {
                indices.push(i * verticesPerStrip);
            }
            for (let x = 0; x < verticesPerStrip; x++) {
                indices.push(i * verticesPerStrip + x);
                indices.push((i + 1) * verticesPerStrip + x);
            }
            if (i < numStrips - 2) {
                indices.push((i + 1) * verticesPerStrip + (verticesPerStrip - 1));
            }
        }
        this.indices = indices;
    }
    // goes through every terrain segment and pushes its vertices to an array
    getVertices() {
        let flatVertices = [];
        this.segments.forEach(segment => {
            segment.getVertices().forEach(vertex => {
                flatVertices.push(vertex);
            });
        });
        return new Float32Array(flatVertices);
    }
    // returns the indices
    getIndices() {
        return new Uint32Array(this.indices);
    }
    // goes through every terrain segment and pushes its normals to an array
    getNormals() {
        let flatNormals = [];
        this.segments.forEach(segment => {
            segment.getNormals().forEach(normal => {
                flatNormals.push(normal);
            });
        });
        return new Float32Array(flatNormals);
    }
    // goes through each segment and updates their position
    update(deltaTime) {
        this.segments.forEach(segment => {
            // moves each segment towards the camera
            segment.updatePosition(this.gui.speedFactor);
            if (segment.position.z < this.cameraPosition.z) {
                // should hopefully only ever be the last segment
                // get the bass and mid averages at the time that the segment is being re-generated so that it will have new height values
                let averages = this.gui.updateFrequencyData();
                this.updateSegments(deltaTime, averages.bass, averages.mid);
            }
        });
    }
    // re-generates the last segment and places it back in the segments array at the first position
    updateSegments(deltaTime, bassAverage, midAverage) {
        // get the last segment in the segment array
        let segment = this.segments.pop();
        if (segment) {
            let newZ = (this.height / 2);
            segment.recycleAndGenerate(newZ, deltaTime, bassAverage, midAverage);
            // place the re-generated segment back into the segment array at the first spot
            this.segments.unshift(segment);
        }
    }
}
class TerrainSegment {
    constructor(width, height, xStart, zStart, noise, gui) {
        this.gui = gui;
        this.vertexFactor = this.gui.vertexFactor;
        this.width = width * this.vertexFactor;
        this.height = height;
        this.position = new Vec3([xStart, 0, zStart]);
        this.noiseFunction = noise;
        this.time = 0;
        this.initializeArrays();
        this.generateVertices();
    }
    // initializes our arrays to be the right size so we can directly access them
    initializeArrays() {
        this.vertices = new Float32Array((this.width + 1) * 4);
        this.normals = new Float32Array((this.width + 1) * 4);
    }
    // generates the initial vertices (flat plane)
    generateVertices() {
        let index = 0;
        for (let j = 0; j <= this.width; j++) {
            const x = this.position.x + (j / this.vertexFactor);
            const z = this.position.z;
            const y = 0.0;
            this.vertices[index * 4] = x;
            this.vertices[index * 4 + 1] = y;
            this.vertices[index * 4 + 2] = z;
            this.vertices[index * 4 + 3] = 1.0;
            this.normals[index * 4] = 0.0;
            this.normals[index * 4 + 1] = 1.0;
            this.normals[index * 4 + 2] = 0.0;
            this.normals[index * 4 + 3] = 0.0;
            index++;
        }
    }
    // updates the vertices values based on the averages of the bass and mids
    updateVertices(deltaTime, bassAverage, midAverage) {
        this.time += deltaTime;
        let index = 0;
        const third = Math.floor(this.width / 3);
        for (let j = 0; j <= this.width; j++) {
            // since width stores number of vertices for the strip (actual width * vertex factor), adjust x position by j / vertex factor
            const x = this.position.x + (j / this.vertexFactor);
            const z = this.position.z;
            const calculateHeight = (x, z) => {
                let baseY = (this.noiseFunction(x, z, this.time));
                // get audio contribution based on part of segment (left and right thirds influenced by mids, middle third influenced by bass)
                let audioContribution = (j <= third || j > 2 * third) ? Math.pow(midAverage / 255.0, 2) : Math.pow(bassAverage / 255.0, 2);
                let audioY = audioContribution;
                if (j <= third || j > 2 * third) {
                    // scale so left and right parts of segment have base range [0, noiseFactor]
                    baseY *= this.gui.noiseFactor;
                    // scale so height contributed by audio has range [0, audioFactor]
                    audioY *= this.gui.midFactor;
                }
                else {
                    // scale so middle part of segment has base range [-noiseFactor, 0]
                    baseY *= this.gui.noiseFactor;
                    // scale so height contributed by audio has range [0, audioFactor / 2]
                    audioY *= this.gui.bassFactor;
                }
                return baseY + audioY;
            };
            const y = calculateHeight(x, z);
            const ax = 0.01;
            const az = 0.01;
            // get height values in 4 locations around the vertex
            let yUp = calculateHeight(x, z + az);
            let yDown = calculateHeight(x, z - az);
            let yLeft = calculateHeight(x + ax, z);
            let yRight = calculateHeight(x - ax, z);
            // estimate normal from the surrounding height values
            let normal = new Vec3([(yLeft - yRight) / ax, 2.0, (yDown - yUp) / az]);
            normal.normalize();
            // update vertices array
            this.vertices[index * 4] = x;
            this.vertices[index * 4 + 1] = y;
            this.vertices[index * 4 + 2] = z;
            this.vertices[index * 4 + 3] = 1.0;
            // update normals array
            this.normals[index * 4] = normal.x;
            this.normals[index * 4 + 1] = normal.y;
            this.normals[index * 4 + 2] = normal.z;
            this.normals[index * 4 + 3] = 0.0;
            index++;
        }
    }
    getVertices() {
        return this.vertices;
    }
    getNormals() {
        return this.normals;
    }
    updatePosition(deltaZ) {
        // adjust position of terrain strip
        this.position.z -= deltaZ;
        const stride = 4;
        const zPos = 2;
        // adjust position of all vertices in the terrain strip
        for (let i = zPos; i < this.vertices.length; i += stride) {
            this.vertices[i] -= deltaZ;
        }
    }
    recycleAndGenerate(newZ, deltaTime, bassAverage, midAverage) {
        // reset terrain strip's position
        this.position.z = newZ;
        // regen the vertices
        this.updateVertices(deltaTime, bassAverage, midAverage);
    }
}
//# sourceMappingURL=terrain.js.map