attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec4 aNormal;
uniform mat4 uMatrix;
uniform mat4 uCamera;
uniform float uTime;
uniform sampler2D uNoise;
varying vec3 debugColor;
varying vec3 normal;
varying vec3 localPos;
varying float uWaterLevel;

const int OCTAVES_LEVEL = 4;

void getNoiseVals( vec2 pos, vec2 shift, float freq, float scale, out float height, out vec3 normal ) {
    // get the noise and gradients, modify by shift, frequency, and scale factors
    
    vec2 modifiedPos = (pos + shift) * freq;
    height = (texture2D(uNoise, vec2(modifiedPos.x, modifiedPos.y)).w * 2.0 - 1.0) * scale;
    
    // Get normal and adjust to consider texture mirroring
    normal = texture2D(uNoise, vec2(modifiedPos.x, modifiedPos.y)).xyz * 2.0 - 1.0; // convert from 0 - 1 to -1 - 1
    if(mod(floor(modifiedPos.x), 2.0) == 1.0) { 
        // when texture is mirrored, flip opposite
        normal.y *= -1.;
    }
    if (mod(floor(modifiedPos.y), 2.0) == 1.0) { 
        // when texture is mirrored, flip opposite
        normal.x *= -1.;
    }
    normal *= scale;

}

void addValues(inout float height, inout vec3 normal, in float tempHeight, in vec3 tempNormal) {
    height += tempHeight;
    normal += tempNormal;
}

void main() {
    // // NOISE NOISE NOISE
    float heightModifier = 1.0;

    localPos = aPosition.xyz;
    vec2 camSpeed = vec2(0.1 , 0.1);
    localPos.x -= uTime * camSpeed.x;
    localPos.y -= uTime * camSpeed.y;

    // noise octave
    // settings
    float noiseFreq = 0.015;
    float noiseScale = 2.0;
    vec2 shifts[OCTAVES_LEVEL];
    shifts[0] = vec2(-10.0, -10.0);
    shifts[1] = vec2(12.0, -5.5);
    shifts[2] = vec2(-48.0, 4.5);
    shifts[3] = vec2(-50.0, -17.5);

    // inits
    float height = 0.;
    vec3 normalVal = vec3(0.);
    float tempHeight;
    vec3 tempNormal;
    
    for (int i=0; i<OCTAVES_LEVEL; i++) {
        getNoiseVals(localPos.xy, shifts[i], (noiseFreq * pow(2., float(i))), (noiseScale / pow(2., float(i))), tempHeight, tempNormal);
        height += tempHeight;
        normalVal += tempNormal;
    }

    vec3 noiseNormal = normalize(normalVal);
    float simpNoise = (0.5 + 0.5*height);

    localPos.z = simpNoise;
    normal = noiseNormal;

    // flatten water
    uWaterLevel = 0.3;
    if (localPos.z <= uWaterLevel) {
        localPos.z = uWaterLevel;
    }

    vec4 alterPosition = vec4(localPos, 1.0);
    alterPosition.x += uTime * camSpeed.x;
    alterPosition.y += uTime * camSpeed.y;
    vec4 position = uCamera * uMatrix * alterPosition;
    gl_Position = position;
}