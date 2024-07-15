// Patterns from nD equations, noise, etc for altering vertex positions
import { createNoise2D, NoiseFunction2D } from "simplex-noise";

export function basic2DWave(x: number, y: number, amplitude: number, wavelength: number, offsetX: number, offsetY: number, velocity?: number, time?: number): number {
    // CHATGPT WAVE FUNCTION
    const A = amplitude;
    const hz = 2 * Math.PI / wavelength;  // Frequency
    const v = velocity || 0.1; 
    const timeS = (time || 0) / 1000;  // Time in seconds
        
    // Solve for z
    let z = A + A * Math.sin(hz * (x - v * timeS) + offsetX) * Math.sin(hz * (y - v * timeS) + offsetY);        
    return z
}

export function basicXWave(x: number, y: number, amplitude: number, wavelength: number, velocity?: number, time?: number): number {
    // CHATGPT WAVE FUNCTION
    const A = amplitude;
    const hz = 2 * Math.PI / wavelength;  // Frequency
    const v = velocity || 0.1; 
    const timeS = (time || 0) / 1000;  // Time in seconds
        
    // Solve for z
    let z = A + A * Math.sin(hz * (x - v * timeS));
        
    return z
}

export function basicYWave(x: number, y: number, amplitude: number, wavelength: number, velocity?: number, time?: number): number {
    // CHATGPT WAVE FUNCTION
    const A = amplitude;
    const hz = 2 * Math.PI / wavelength;  // Frequency
    const v = velocity || 0.1; 
    const timeS = (time || 0) / 1000;  // Time in seconds
        
    // Solve for z
    let z = A + A * Math.sin(hz * (y - v * timeS));
    return z
}

export function initSimplex(): NoiseFunction2D {
    return createNoise2D();
}

// export function simplexNormal(noiseFunc: NoiseFunction2D, size: number[], scale: number[]): Uint8Array {
//     // returns an 2D array of noise by simplex algo
//     let noiseArray = new Uint8Array(size[0]*size[1]);
//     for (let i=0; i<size[0]; i++) {
//         for (let j=0; j<size[1]; j++) {
//             noiseArray[i*size[1] + j] = Math.floor((0.5+0.5*noiseFunc(i*scale[0], j*scale[1]))*256);
//         }
//     }
//     // console.log(noiseArray)
//     return noiseArray;
// }

export function simplexNoise2D(noiseFunc: NoiseFunction2D, size: number[], scale: number[]): Uint8Array {
    // returns an 2D array of noise by simplex algo
    let noiseArray = new Uint8Array(size[0]*size[1]*4);
    let height, hX1, hX2, hZ1, hZ2, normal;
    const epsilon = 0.01;

    for (let i=0; i<size[0]; i++) {
        for (let j=0; j<size[1]; j++) {
            
            height = noiseFunc(i*scale[0], j*scale[1]);
            hX1 = noiseFunc(i*scale[0] + epsilon, j*scale[1]); //noise( pos + vec2(epsilon, 0.0) );
            hX2 = noiseFunc(i*scale[0] - epsilon, j*scale[1]); //noise( pos - vec2(epsilon, 0.0) );
            hZ1 = noiseFunc(i*scale[0], j*scale[1] + epsilon); //noise( pos + vec2(0.0, epsilon) );
            hZ2 = noiseFunc(i*scale[0], j*scale[1] - epsilon); //noise( pos - vec2(0.0, epsilon) );

            // Compute gradient vectors
            const dx = [2.0 * epsilon, hX1 - hX2, 0];
            const dz = [0.0, hZ1 - hZ2, 2.0 * epsilon];

            // Compute cross product of dx and dz
            const crossNormal = [
                dx[1] * dz[2] - dx[2] * dz[1],
                dx[2] * dz[0] - dx[0] * dz[2],
                dx[0] * dz[1] - dx[1] * dz[0]
            ];

            // Normalize the crossNormal vector
            const length = Math.sqrt(crossNormal[0] * crossNormal[0] + crossNormal[1] * crossNormal[1] + crossNormal[2] * crossNormal[2]);
            normal = crossNormal.map(n => n / length);

            // add normal as xyz in texture
            noiseArray[4*(i*size[1] + j) + 0] = Math.floor((0.5 + 0.5*normal[0]) * 256);
            noiseArray[4*(i*size[1] + j) + 1] = Math.floor((0.5 + 0.5*normal[1]) * 256);
            noiseArray[4*(i*size[1] + j) + 2] = Math.floor((0.5 + 0.5*normal[2]) * 256);


            // and finally the noise value (height) as the w value
            noiseArray[4*(i*size[1] + j) + 3] = Math.floor((0.5 + 0.5*height) * 256);
        }
    }
    // console.log(noiseArray)
    return noiseArray;
}
