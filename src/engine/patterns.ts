// Patterns from nD equations, noise, etc for altering vertex positions
import { createNoise2D } from "simplex-noise";

export function basic2DWave(x: number, y: number, amplitude: number, wavelength: number, velocity?: number, time?: number): number {
    // CHATGPT WAVE FUNCTION
    const A = amplitude;
    const hz = 2 * Math.PI / wavelength;  // Frequency
    const v = velocity || 0.1; 
    const timeS = (time || 0) / 1000;  // Time in seconds
        
    // Solve for z
    let z = A + A * Math.sin(hz * (x - v * timeS)) * Math.sin(hz * (y - v * timeS));        
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

export function simplexNoise2D(size: number[], scale: number[]): number[][] {
    // returns an 2D array of noise by simplex algo
    let noiseArray2D = [];
    let simplex = createNoise2D();
    for (let i=0; i<size[0]; i++) {
        noiseArray2D.push([]);
        for (let j=0; j<size[1]; j++) {
            noiseArray2D[i].push(simplex(i*scale[0],j*scale[1]));
        }
    }
    return noiseArray2D;
}