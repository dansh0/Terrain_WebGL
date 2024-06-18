class PlaneVertices {
    size: number[];
    divisions: number;
    positions: number[];
    normals: number[];

    constructor(size: number[], divisions: number) {
        this.size = size;
        this.divisions = divisions;
        this.positions = this.generatePositions();
        this.normals = [];
    }

    generatePositions(): number[] {
        let positions = [];
        let triangleCount = Math.pow(this.divisions, 2) * 2;
        let xOffset = 0;
        let yOffset = 0;
        let xSideLength = this.size[0]/this.divisions;
        let ySideLength = this.size[1]/this.divisions;

        for (let iTri=0; iTri<triangleCount; iTri+=2) {
            xOffset = xSideLength * ((iTri/2)%this.divisions);
            yOffset = ySideLength * Math.floor((iTri/2)/this.divisions);

            // first tri
            positions.push(...[xOffset, yOffset, 0]);
            positions.push(...[(xOffset+xSideLength), yOffset, 0]);
            positions.push(...[(xOffset+xSideLength), (yOffset+ySideLength), 0]);
            // second tri
            positions.push(...[(xOffset+xSideLength), (yOffset+ySideLength), 0]);
            positions.push(...[xOffset, (yOffset+ySideLength), 0]);
            positions.push(...[xOffset, yOffset, 0]);

        }

        return positions;
        
    }

    modifyZ(time: number): void {
        let vertexCount = this.positions.length/3;

        // CHATGPT WAVE FUNCTION
        const A = 0.25;  // Amplitude of the wave
        const wavelength = 1.0;  // Wavelength of the wave
        const k = 2 * Math.PI / wavelength;  // Wave number
        const v = 1.0;  // Wave speed
        const timeS = time / 1000 / 10;  // Time in seconds
        for (let iVert=0; iVert<vertexCount; iVert++) {
            // this.positions[2+iVert*3] = Math.sin(this.positions[0+iVert*3]*this.positions[1+iVert*3]*time/1000)/4;
            

            let x = this.positions[0 + iVert * 3];
            let y = this.positions[1 + iVert * 3];
            
            // Compute the new z value based on the 2D wave function
            let z = A * Math.sin(k * (x - v * timeS)) * Math.sin(k * (y - v * timeS));
            
            // Set the new z value for the vertex
            this.positions[2 + iVert * 3] = z;
        }
    }
    
}

export default PlaneVertices