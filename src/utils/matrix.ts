class Mat4 {
    matrix: number[]

    constructor() {
        this.matrix = [];
        this.setIdentity()
    }

    setIdentity(): void {
        this.matrix = [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        ]
    }

    multiply(matrixB:Mat4|number[]): void {
        let matA = this.matrix;
        let matB = (matrixB.matrix) ? matrixB.matrix : matrixB; // compatible with Mat4 or just the array
        if (matB.length!=16) { throw Error('Cannot multiply by this matrix'); }

        // multiply element by element
        let matrix = [
            matA[0]*matB[0] + matA[4]*matB[1] + matA[8]*matB[2] + matA[12]*matB[3],
            matA[1]*matB[0] + matA[5]*matB[1] + matA[9]*matB[2] + matA[13]*matB[3],
            matA[2]*matB[0] + matA[6]*matB[1] + matA[10]*matB[2] + matA[14]*matB[3],
            matA[3]*matB[0] + matA[7]*matB[1] + matA[11]*matB[2] + matA[15]*matB[3],

            matA[0]*matB[4] + matA[4]*matB[5] + matA[8]*matB[6] + matA[12]*matB[7],
            matA[1]*matB[4] + matA[5]*matB[5] + matA[9]*matB[6] + matA[13]*matB[7],
            matA[2]*matB[4] + matA[6]*matB[5] + matA[10]*matB[6] + matA[14]*matB[7],
            matA[3]*matB[4] + matA[7]*matB[5] + matA[11]*matB[6] + matA[15]*matB[7],

            matA[0]*matB[8] + matA[4]*matB[9] + matA[8]*matB[10] + matA[12]*matB[11],
            matA[1]*matB[8] + matA[5]*matB[9] + matA[9]*matB[10] + matA[13]*matB[11],
            matA[2]*matB[8] + matA[6]*matB[9] + matA[10]*matB[10] + matA[14]*matB[11],
            matA[3]*matB[8] + matA[7]*matB[9] + matA[11]*matB[10] + matA[15]*matB[11],

            matA[0]*matB[12] + matA[4]*matB[13] + matA[8]*matB[14] + matA[12]*matB[15],
            matA[1]*matB[12] + matA[5]*matB[13] + matA[9]*matB[14] + matA[13]*matB[15],
            matA[2]*matB[12] + matA[6]*matB[13] + matA[10]*matB[14] + matA[14]*matB[15],
            matA[3]*matB[12] + matA[7]*matB[13] + matA[11]*matB[14] + matA[15]*matB[15],
        ];

        // set matrix
        this.matrix = matrix;
    }

    translate(x: number, y: number, z: number): void {
        // set translation matrix
        let translationMat = [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            x,y,z,1
        ];

        // multiply self
        this.multiply(translationMat);
    }

    rotation(angle: number, axis: number[]): void {
        // Rodriguez rotation
        let c = Math.cos(angle);
        let s = Math.sin(angle);
        let d = 1 - c; //simplifies 1-c term in formula

        // find unit vector
        let length = Math.sqrt(axis[0]*axis[0] + axis[1]*axis[1] + axis[2]*axis[2])
        if (length==0) { throw Error('zero length vector distance during rotation') }
        let x = axis[0]/length;
        let y = axis[1]/length;
        let z = axis[2]/length;

        // rotation matrix
        let rotationMatrix = [
            d*x*x + c,   d*x*y - z*s, d*x*z + y*s, 0,
            d*x*y + z*s, d*y*y + c,   d*y*z - x*s, 0,
            d*x*z - y*s, d*y*z + x*s, d*z*z + c,   0,
            0,           0,           0,           1
        ];

        // multiply self
        this.multiply(rotationMatrix);

    }

    rotationX(angle: number):void {
        this.rotation(angle, [1,0,0]);
    }

    rotationY(angle: number):void {
        this.rotation(angle, [0,1,0]);
    }

    rotationZ(angle: number):void {
        this.rotation(angle, [0,0,1]);
    }


}

export default Mat4