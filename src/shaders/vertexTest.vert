attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec4 aNormal;
uniform mat4 uMatrix;
varying vec2 vUv;
varying vec3 debugColor;
varying vec3 normal;
varying vec3 localPos;
uniform float uTime;
varying vec4 vColor;

void main() {
    localPos = aPosition.xyz;
    debugColor = aColor.rgb; 
    vec4 normal4 = vec4((aNormal.xyz*0.5 + 0.5), 1.0);
    normal = normal4.xyz;

    // Define the colors
    vec3 colorGreen = vec3(0.0, 1.0, 0.0);  // Green
    vec3 colorBrown = vec3(0.59, 0.29, 0.0); // Brown
    vec3 colorWhite = vec3(1.0, 1.0, 1.0);  // White

    // Get the z value
    float z = -1.*aPosition.z;

    float greenCutOff = -0.05;
    float brownCutOff = 0.0;
    float whiteCutOff = 0.15;

    // Interpolate color based on the z value
    if (z <= greenCutOff) {
        vColor = vec4(colorGreen, 1.0);
    } else if (z >= whiteCutOff) {
        vColor = vec4(colorWhite, 1.0);
    } else if (z <= brownCutOff) {
        // Interpolate between green and brown
        float t = (z - greenCutOff) / 1.0;
        vec3 color = mix(colorGreen, colorBrown, t);
        vColor = vec4(color, 1.0);
    } else {
        // Interpolate between brown and white
        float t = (z - brownCutOff) / 1.0;
        vec3 color = mix(colorBrown, colorWhite, t);
        vColor = vec4(color, 1.0);
    }

    // float A = 0.1;  // Amplitude of the wave
    // float wavelength = 0.5;  // Wavelength of the wave
    // float k = 2. * 3.1415 / wavelength;  // Wave number
    // float v = 1.0;  // Wave speed
    // float timeS = uTime / 10.; 


    vec4 alterPosition = aPosition;
    // alterPosition.z = A * sin(k * (vUv.x - v * timeS));
    vec4 position = uMatrix * alterPosition;
    gl_Position = position;
}