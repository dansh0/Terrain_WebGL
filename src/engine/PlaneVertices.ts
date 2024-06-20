import { randomTriColors, calculateNormals } from "./triUtils"
import { basic2DWave, basicXWave, basicYWave, simplexNoise2D } from "./patterns";
import { createNoise2D } from "simplex-noise";

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
        let depths = 10;
        let simplexDepths = [];
        let scaleSum = 0;
        for (let iDepth = 0; iDepth<depths; iDepth++) {
            let simplex = createNoise2D();
            let xMult = Math.random()*1.5;
            let yMult = Math.random()*1.5;
            let scale = Math.random()/(depths/4);
            simplexDepths.push((x,y)=>{
                return simplex(xMult*x, yMult*y)*scale;
            });
        }

        for (let iVert=0; iVert<vertexCount; iVert++) {
            // this.positions[2+iVert*3] = Math.sin(this.positions[0+iVert*3]*this.positions[1+iVert*3]*time/1000)/4;

            let x = this.positions[0 + iVert * 3];
            let y = this.positions[1 + iVert * 3];
            
            // Compute the new z value based on the 2D wave function
            let z1 = basic2DWave(x, y, 0.3, 1.5, 0.01, time); // 2D wave sin function x, y, amplitude, wavelength, velocity, time
            let z2 = basic2DWave(x, y, 0.11, 0.7, 0.005, time); // 2D wave sin function x, y, amplitude, wavelength, velocity, time
            let z3 = basic2DWave(x, y, 0.04, 0.3, 0.001, time); // 2D wave sin function x, y, amplitude, wavelength, velocity, time
            let zSum = z1+z2+z3;

            // let zSum = 0;
            // for (let iDepth=0; iDepth<depths; iDepth++) {
            //     zSum += simplexDepths[iDepth](x, y);
            // }

            // let z1 = simplex(x, y)*0.5;
            // let z2 = simplex2(0.5*x, 0.5*y)*0.2;
            // let z3 = simplex3(0.1*x, 0.1*y)*0.1;

            // Set the new z value for the vertex
            this.positions[2 + iVert * 3] = zSum;
            // console.log(this.positions[2 + iVert * 3])
        }
    }
    
}

export default PlaneVertices