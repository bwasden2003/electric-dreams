import { Vec4, Vec3, epsilon } from "../lib/TSM.js";
import { GUI } from "./gui.js";
import * as SimplexNoise from "./simplex-noise.js"


export class Cylinder {
    
    private positionsArray: Vec4[];
    private verticesArray: Float32Array;
    private indicesArray: Uint32Array;
    private colorsArray: Float32Array;

    constructor(
        private start: [number, number, number],
        private end: [number, number, number],
        private radius: number,
        private originalrad: number,
        private segments: number,
        private divisions: number,
        private gui: GUI,
    ) {
        this.generateVerticesAndIndices();
    }

    private calculateCircleVertices(start: [number, number, number], end: [number, number, number], segments: number): Vec4[] {
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
        } else if (Math.abs(ny) < Math.abs(nz)) {
            px = 0;
            py = 1;
            pz = 0;
        } else {
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
    
        const vertices: Vec4[] = [];
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
        const vertices: Vec4[] = [];
        const indices: number[] = [];
    
        // Generate vertices for the base circle at the start
        const startCircleVertices = this.calculateCircleVertices(
            [this.start[0], this.start[1], this.start[2]],
            [this.end[0], this.end[1], this.end[2]],
            this.segments
        );
    
        // Push vertices for the start circle
        vertices.push(...startCircleVertices);
    
        // Push indices for drawing lines for the start circle
        for (let i = 0; i < this.segments; i++) {
            indices.push(i, (i + 1) % this.segments);
        }
    


    


  
    
        // Set private values
        const pos: number[] = [];
        for (let i = 0; i < vertices.length; i++) {
            pos.push(vertices[i].x)
            pos.push(vertices[i].y)
            pos.push(vertices[i].z)
            pos.push(vertices[i].w)
        };
    
        const color: number[] = [];
        for (let i = 0; i < vertices.length; i++) {
            color.push(0.0)
            color.push(0.0)
            color.push(1.0)
            color.push(0.0)
        };
    
        this.verticesArray = new Float32Array(pos);
        this.indicesArray = new Uint32Array(indices);
        this.colorsArray = new Float32Array(color);
        this.positionsArray = vertices;
    
        // console.log("Vertices:", vertices);
        // console.log("Indices:", indices);
    }

    public update(deltaTime) {
        
        let recycleThreshold = 0;
        let averages = this.gui.updateFrequencyData();
        this.radius = this.originalrad*this.gui.sunFactor*averages.bass
        this.generateVerticesAndIndices()
    }

    
    colors(): Vec4[] {
        return [];
    }
    indices(): Vec3[] {
        return [];
    }
    normals(): Vec4[] {
        return [];
    }

    public positions(): Vec4[] {
        // console.log(this.positionsArray)
        return this.positionsArray;
    }

    public positionsFlat() {
        // console.log(this.verticesArray)
        return this.verticesArray;
    }

    public colorsFlat(): Float32Array {
        return this.colorsArray;
    }

    public indicesFlat(): Uint32Array {
        // console.log(this.indicesArray)
        return this.indicesArray;
    }

    public normalsFlat() {
        return new Float32Array([]);
    }

    public scale() {}

    public translate() {}

}
