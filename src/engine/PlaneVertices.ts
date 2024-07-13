import { randomTriColors, calculateNormals } from "./triUtils"
import { basic2DWave, basicXWave, basicYWave } from "./patterns";
import { simplexNoise2D } from './patterns';

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
    
}

export default PlaneVertices