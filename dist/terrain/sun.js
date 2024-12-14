import { Vec4 } from "../lib/TSM.js";
export class Cylinder {
    constructor(start, end, radius, originalrad, segments, divisions, gui) {
        this.start = start;
        this.end = end;
        this.radius = radius;
        this.originalrad = originalrad;
        this.segments = segments;
        this.divisions = divisions;
        this.gui = gui;
        this.generateVerticesAndIndices();
    }
    calculateCircleVertices(start, end, segments) {
        const [startX, startY, startZ] = start;
        const [endX, endY, endZ] = end;
        // Calculate the direction vector from start to end
        const dx = endX - startX;
        const dy = endY - startY;
        const dz = endZ - startZ;
        // Calculate the length of the direction vector
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        // Normalize the direction vector
        const nx = dx / length;
        const ny = dy / length;
        const nz = dz / length;
        // Calculate the perpendicular vector
        let px, py, pz;
        if (Math.abs(nx) < Math.abs(ny) && Math.abs(nx) < Math.abs(nz)) {
            px = 1;
            py = 0;
            pz = 0;
        }
        else if (Math.abs(ny) < Math.abs(nz)) {
            px = 0;
            py = 1;
            pz = 0;
        }
        else {
            px = 0;
            py = 0;
            pz = 1;
        }
        // Calculate the cross product to get the second perpendicular vector
        const cx = ny * pz - nz * py;
        const cy = nz * px - nx * pz;
        const cz = nx * py - ny * px;
        // Calculate the radius of the circle
        const radius = this.radius;
        const vertices = [];
        const angleStep = (2 * Math.PI) / segments;
        for (let i = 0; i < segments; i++) {
            const currentAngle = angleStep * i;
            const x = radius * Math.cos(currentAngle);
            const y = radius * Math.sin(currentAngle);
            const z = 0; // The circle lies in the xy-plane initially
            // Apply the transformation matrix to rotate the circle
            const newX = px * x + cx * y + nx * z;
            const newY = py * x + cy * y + ny * z;
            const newZ = pz * x + cz * y + nz * z;
            // Translate the circle to its position relative to the start point
            const finalX = startX + newX;
            const finalY = startY + newY;
            const finalZ = startZ + newZ;
            vertices.push(new Vec4([finalX, finalY, finalZ, 1.0])); // Alpha value set to 1.0
        }
        return vertices;
    }
    generateVerticesAndIndices() {
        const vertices = [];
        const indices = [];
        // Generate vertices for the base circle at the start
        const startCircleVertices = this.calculateCircleVertices([this.start[0], this.start[1], this.start[2]], [this.end[0], this.end[1], this.end[2]], this.segments);
        // Push vertices for the start circle
        vertices.push(...startCircleVertices);
        // Push indices for drawing lines for the start circle
        for (let i = 0; i < this.segments; i++) {
            indices.push(i, (i + 1) % this.segments);
        }
        // Set private values
        const pos = [];
        for (let i = 0; i < vertices.length; i++) {
            pos.push(vertices[i].x);
            pos.push(vertices[i].y);
            pos.push(vertices[i].z);
            pos.push(vertices[i].w);
        }
        ;
        const color = [];
        for (let i = 0; i < vertices.length; i++) {
            color.push(0.0);
            color.push(0.0);
            color.push(1.0);
            color.push(0.0);
        }
        ;
        this.verticesArray = new Float32Array(pos);
        this.indicesArray = new Uint32Array(indices);
        this.colorsArray = new Float32Array(color);
        this.positionsArray = vertices;
        // console.log("Vertices:", vertices);
        // console.log("Indices:", indices);
    }
    update(deltaTime) {
        let recycleThreshold = 0;
        let averages = this.gui.updateFrequencyData();
        this.radius = this.originalrad * this.gui.sunFactor * averages.bass;
        this.generateVerticesAndIndices();
    }
    colors() {
        return [];
    }
    indices() {
        return [];
    }
    normals() {
        return [];
    }
    positions() {
        // console.log(this.positionsArray)
        return this.positionsArray;
    }
    positionsFlat() {
        // console.log(this.verticesArray)
        return this.verticesArray;
    }
    colorsFlat() {
        return this.colorsArray;
    }
    indicesFlat() {
        // console.log(this.indicesArray)
        return this.indicesArray;
    }
    normalsFlat() {
        return new Float32Array([]);
    }
    scale() { }
    translate() { }
}
//# sourceMappingURL=sun.js.map