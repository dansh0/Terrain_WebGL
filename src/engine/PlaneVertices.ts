import { randomTriColors, calculateNormals } from "./triUtils"
import { basic2DWave, basicXWave, basicYWave } from "./patterns";

class PlaneVertices {
    size: number[];
    divisions: number;
    positions: number[];
    normals: number[];
    colors: number[];

    constructor(size: number[], divisions: number) {
        this.size = size;
        this.divisions = divisions;
        this.positions = this.generatePositions();
        this.normals = [];
        this.colors = [];
        this.generateRandomTriColors();
        this.generateNormals();
    }

    generatePositions(): number[] {
        let positions = [];
        let triangleCount = Math.pow(this.divisions, 2) * 2;
        let xOffset, yOffset, zOffset;
        let xSideLength = this.size[0]/this.divisions;
        let ySideLength = this.size[1]/this.divisions;

        for (let iTri=0; iTri<triangleCount; iTri+=2) {
            xOffset = -this.size[0]/2 + xSideLength * ((iTri/2)%this.divisions);
            yOffset = -this.size[1]/2 + ySideLength * Math.floor((iTri/2)/this.divisions);
            zOffset = 0;

            // first tri
            positions.push(...[xOffset, yOffset, zOffset]);
            positions.push(...[(xOffset+xSideLength), yOffset, zOffset]);
            positions.push(...[(xOffset+xSideLength), (yOffset+ySideLength), zOffset]);
            // second tri
            positions.push(...[(xOffset+xSideLength), (yOffset+ySideLength), zOffset]);
            positions.push(...[xOffset, (yOffset+ySideLength), zOffset]);
            positions.push(...[xOffset, yOffset, zOffset]);

        }

        return positions;
        
    }

    generateRandomTriColors(): void {
        let triCount = this.positions.length/9;
        this.colors.length = 0; // don't lose ref

        let colors = randomTriColors(triCount);
        colors.forEach((value: number) => {
            // save reference by passing individual values
            this.colors.push(value)
        })

    }

    generateNormals(): void {
        this.normals.length = 0; // don't lose ref
        let normals = calculateNormals(this.positions)
        normals.forEach((value: number) => {
            // save reference by passing individual values
            this.normals.push(value)
        })
    }

    modifyZ(time: number): void {
        let vertexCount = this.positions.length/3;

        for (let iVert=0; iVert<vertexCount; iVert++) {
            // this.positions[2+iVert*3] = Math.sin(this.positions[0+iVert*3]*this.positions[1+iVert*3]*time/1000)/4;

            let x = this.positions[0 + iVert * 3];
            let y = this.positions[1 + iVert * 3];
            
            // Compute the new z value based on the 2D wave function
            let z1 = basic2DWave(x, y, 0.3, 1.5, 0.01, time); // 2D wave sin function x, y, amplitude, wavelength, velocity, time
            let z2 = basic2DWave(x, y, 0.11, 0.7, 0.005, time); // 2D wave sin function x, y, amplitude, wavelength, velocity, time
            let z3 = basic2DWave(x, y, 0.04, 0.3, 0.001, time); // 2D wave sin function x, y, amplitude, wavelength, velocity, time
            // let z1 = basicYWave(x, y, 0.2, 2, 0.01, time);

            // Set the new z value for the vertex
            this.positions[2 + iVert * 3] = z1+z2+z3;
            // console.log(this.positions[2 + iVert * 3])
        }
    }
    
}

export default PlaneVertices