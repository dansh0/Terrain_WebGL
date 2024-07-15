precision mediump float;
varying vec3 localPos;
varying vec3 debugColor;
varying vec3 normal;
varying float vShadow;
varying float uWaterLevel;
uniform sampler2D uNoise;
uniform vec2 uCamXZ;

const int OCTAVES_LEVEL = 4;
const int SHADOW_CHECKS = 10;
const float SHADOW_DIST = 0.25;

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

vec4 noiseOctave(float noiseFreq, float noiseScale, vec2 pos) {

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
        getNoiseVals(pos, shifts[i], (noiseFreq * pow(2., float(i))), (noiseScale / pow(2., float(i))), tempHeight, tempNormal);
        height += tempHeight;
        normalVal += tempNormal;
    }

    vec3 noiseNormal = normalize(normalVal);

    return vec4(noiseNormal, height);
}

// MAIN
void main()
{
    // PARAMETERS

    // Light
    vec3 lightCol = vec3(1.0, 1.0, 1.0); // Light color
    vec3 lightDir = vec3(0.577, -0.577, 0.577); // Light source position
    float ambiStrength = 0.4; // Ambient light strength
    float diffStength = 0.7; // Diffuse light strength

    // Define the colors
    vec3 colorBlue = vec3(0.204, 0.569, 0.894);  // Blue
    vec3 colorLightBlue = vec3(0.404, 0.749, 0.886);  // light Blue
    vec3 colorGreen = vec3(0.400, 0.576, 0.282);  // Green
    vec3 colorBrown = vec3(0.561, 0.490, 0.423); // Brown
    vec3 colorWhite = vec3(0.925, 0.961, 0.973);  // White


    // local normal to modify
    vec3 localNormal = normal;

    // BASE COLOR

    // Get the y value
    float height = localPos.y + 0.05*texture2D(uNoise, vec2(localPos.x, localPos.z)).a + 0.2*texture2D(uNoise, vec2(localPos.x/10., localPos.z/10.)).a;
    float darkness = min(pow(height,2.0)*2.5,1.25);

    // Cutoff heights
    float darkBlueCutOff = uWaterLevel;
    float blueCutOff = uWaterLevel+0.05;
    float greenCutOff = 0.7;
    float brownCutOff = 1.0;
    float whiteCutOff = 1.3;
    vec3 objCol;

    // Interpolate color based on the z value
    if (height <= darkBlueCutOff) {
        objCol = colorBlue;
    } else if (localPos.y <= blueCutOff) {
        // Interpolate between green and brown
        float t = (localPos.y - darkBlueCutOff) / (blueCutOff - darkBlueCutOff);
        vec3 color = mix(colorBlue, colorLightBlue, t);
        objCol = color;
    } else if (height >= whiteCutOff) {
        objCol = colorWhite;
    } else if (height <= brownCutOff) {
        // Interpolate between green and brown
        float t = (height - greenCutOff) / (brownCutOff - greenCutOff);
        vec3 color = mix(colorGreen, colorBrown, t);
        objCol = color;
    } else {
        // Interpolate between brown and white
        float t = (height - brownCutOff) / (whiteCutOff - brownCutOff);
        vec3 color = mix(colorBrown, colorWhite, t);
        objCol = color;
    }

    if (localPos.y > blueCutOff) {
        // Operations above water
        objCol *= darkness;
    } else {
        // Operations on water
        float waterScalar = 2.;
        localNormal = vec3(0.,1.,0.) + vec3(
            0.1*texture2D(uNoise, vec2((localPos.x+2.5)/waterScalar, (localPos.z+2.2)/waterScalar)).w,
            0.1*texture2D(uNoise, vec2((localPos.x+1.2)/waterScalar, (localPos.z-4.1)/waterScalar)).w,
            0.1*texture2D(uNoise, vec2((localPos.x-3.6)/waterScalar, (localPos.z+7.7)/waterScalar)).w
        );
    }

    // float dist = distance(uCamXZ, localPos.xz);
    // objCol *= (1.-smoothstep(0.75, 1.0, dist / 10. )); // distance fog
    // objCol *= (1.-smoothstep(0.995, 1.0, gl_FragCoord.z )); // distance fog

    // Debug Normals
    // vec3 objCol = normal;

    float depth = gl_FragCoord.z;

    // Ambient Lighting
    vec3 ambiLight = lightCol * ambiStrength;
    
    // Diffuse Lighting
    vec3 diffLight = lightCol * diffStength * max(dot(localNormal, lightDir), 0.0);

    vec3 combLight = ambiLight + diffLight;
    vec3 col = combLight * objCol;

    // SHADOW

    float inShadow = 0.0;
    vec3 tempPos;
    float tempHeight;
    float noiseFreq = 0.015;
    float noiseScale = 2.0;
    vec3 invLightDir = lightDir * -1.;
    for (int i=0; i<SHADOW_CHECKS; i++) {
        // WIP, need full noise info here
        tempPos = localPos.xyz + ((float(i) * SHADOW_DIST) * invLightDir);

        // height of check
        vec4 packedNoise = noiseOctave(noiseFreq, noiseScale, tempPos.xz);
        float tempHeight = (0.5 + 0.5*packedNoise.w);

        inShadow = min(inShadow, tempPos.y-tempHeight);
    }

    if (localPos.y < blueCutOff) {
        float shadowFactor = 1.0 - 0.5*smoothstep(0.05, 0.25, abs(inShadow));
        col *= shadowFactor;
    }



    // shadow fog
    // col = col*(1.-smoothstep(0.99,1.,gl_FragCoord.z));

    // Output to screen
    gl_FragColor = vec4(col, 1.0);

    // LOCAL UV 
    // gl_FragColor = vec4((localPos.x+0.5)*depth, (localPos.z+0.5)*depth, 0.0, 1.0);
    
    // DEBUG WHITE
    // gl_FragColor = vec4(1.0);

    // DEBUG COLOR
    //gl_FragColor = vec4(gl_FragCoord.xy/1000., 0.0, 1.0);
    // gl_FragColor = vec4(debugColor, 1.0);
    // DEBUG NORMAL
    // gl_FragColor = vec4(normal, 1.0);

    // DEBUG DEPTH
    // gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);

    // DEBUG NOISE
    //gl_FragColor = vec4(vec3(texture2D(uNoise, vec2(localPos.x, localPos.y)).x), 1.0);
    float noiseModifier = 1./250.;
    vec2 fragCoord = gl_FragCoord.xy * noiseModifier;
    // vec4 noiseNormal = 2.0 * texture2D(uNoise, fragCoord) - 1.0;
    // gl_FragColor = noiseNormal;

}