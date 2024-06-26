precision mediump float;
// uniform float uTime;
varying vec3 localPos;
varying vec3 debugColor;
varying vec3 normal;
varying vec4 vColor;
uniform sampler2D uNoise;
    
// MAIN
void main()
{
    // BASE COLOR

    // Define the colors
    vec3 colorBlue = vec3(0.0, 0.0, 1.0);  // Blue
    vec3 colorGreen = vec3(0.0, 1.0, 0.0);  // Green
    vec3 colorBrown = vec3(0.59, 0.29, 0.0); // Brown
    vec3 colorWhite = vec3(1.0, 1.0, 1.0);  // White

    // Get the z value
    float z = localPos.z + 0.1*texture2D(uNoise, vec2(localPos.x, localPos.y)).z;
    float darkness = pow(z,2.)*2.5;

    // Cutoff heights
    float blueCutOff = 0.3;
    float greenCutOff = 0.35;
    float brownCutOff = 0.4;
    float whiteCutOff = 0.6;
    vec3 objCol;

    // Interpolate color based on the z value
    if (localPos.z <= blueCutOff) {
        objCol = colorBlue;
    } else if (z >= whiteCutOff) {
        objCol = colorWhite;
    } else if (z <= brownCutOff) {
        // Interpolate between green and brown
        float t = (z - greenCutOff) / 1.0;
        vec3 color = mix(colorGreen, colorBrown, t);
        objCol = color;
    } else {
        // Interpolate between brown and white
        float t = (z - brownCutOff) / 1.0;
        vec3 color = mix(colorBrown, colorWhite, t);
        objCol = color;
    }
    objCol *= darkness;

    // Light
    vec3 lightCol = vec3(1.0, 1.0, 1.0); // Light color
    vec3 lightPos = vec3(5.); // Light source position
    float ambiStrength = 0.2; // Ambient light strength
    float diffStength = 0.4; // Diffuse light strength

    float depth = gl_FragCoord.z;

    // Ambient Lighting
    vec3 ambiLight = lightCol * ambiStrength;
    
    // Diffuse Lighting
    vec3 diffDir = normalize(lightPos - localPos);
    vec3 diffLight = lightCol * diffStength * max(dot(normal, diffDir), 0.0);

    vec3 combLight = ambiLight + diffLight;
    vec3 col = combLight * objCol;

    // shadow fog
    col = col*(1.-smoothstep(0.97,1.,gl_FragCoord.z));

    // Output to screen
    gl_FragColor = vec4(col, 1.0);

    // LOCAL UV 
    // gl_FragColor = vec4((localPos.x+0.5)*depth, (localPos.y+0.5)*depth, 0.0, 1.0);
    
    // DEBUG WHITE
    // gl_FragColor = vec4(1.0);

    // DEBUG COLOR
    // gl_FragColor = vec4(debugColor, 1.0);

    // DEBUG NORMAL
    // gl_FragColor = vec4(normal, 1.0);

    // DEBUG DEPTH
    // gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);

    // DEBUG NOISE
    // gl_FragColor = vec4(vec3(texture2D(uNoise, vec2(localPos.x, localPos.y)).x), 1.0);
    
}