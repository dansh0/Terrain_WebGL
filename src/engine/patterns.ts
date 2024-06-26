// Patterns from nD equations, noise, etc for altering vertex positions
import { createNoise2D } from "simplex-noise";

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

export function simplexNoise2D(size: number[]): Uint8Array {
    // returns an 2D array of noise by simplex algo
    let noiseArray = new Uint8Array(size[0]*size[1]);
    let simplex = createNoise2D();
    for (let i=0; i<size[0]; i++) {
        for (let j=0; j<size[1]; j++) {
            noiseArray[i*size[1] + j] = Math.floor(simplex(i,j)*256);
        }
    }
    return noiseArray;
}
