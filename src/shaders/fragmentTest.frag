precision mediump float;
varying vec3 localPos;
varying vec3 debugColor;
varying vec3 normal;
varying vec4 vColor;
varying float uWaterLevel;
uniform sampler2D uNoise;
uniform vec2 uCamXY;
    
// MAIN
void main()
{
    // local normal to modify
    vec3 localNormal = normal;

    // BASE COLOR

    // Define the colors
    vec3 colorBlue = vec3(0.204, 0.569, 0.894);  // Blue
    vec3 colorLightBlue = vec3(0.404, 0.749, 0.886);  // light Blue
    vec3 colorGreen = vec3(0.400, 0.576, 0.282);  // Green
    vec3 colorBrown = vec3(0.561, 0.490, 0.423); // Brown
    vec3 colorWhite = vec3(0.925, 0.961, 0.973);  // White

    // Get the z value
    float z = localPos.z + 0.1*texture2D(uNoise, vec2(localPos.x, localPos.y)).z + 0.25*texture2D(uNoise, vec2(localPos.x/10., localPos.y/10.)).z;
    float darkness = min(pow(z,2.0)*2.5,1.25);

    // Cutoff heights
    float darkBlueCutOff = uWaterLevel;
    float blueCutOff = uWaterLevel+0.05;
    float greenCutOff = 0.7;
    float brownCutOff = 1.0;
    float whiteCutOff = 1.3;
    vec3 objCol;

    // Interpolate color based on the z value
    if (z <= darkBlueCutOff) {
        objCol = colorBlue;
    } else if (localPos.z <= blueCutOff) {
        // Interpolate between green and brown
        float t = (localPos.z - darkBlueCutOff) / (blueCutOff - darkBlueCutOff);
        vec3 color = mix(colorBlue, colorLightBlue, t);
        objCol = color;
    } else if (z >= whiteCutOff) {
        objCol = colorWhite;
    } else if (z <= brownCutOff) {
        // Interpolate between green and brown
        float t = (z - greenCutOff) / (brownCutOff - greenCutOff);
        vec3 color = mix(colorGreen, colorBrown, t);
        objCol = color;
    } else {
        // Interpolate between brown and white
        float t = (z - brownCutOff) / (whiteCutOff - brownCutOff);
        vec3 color = mix(colorBrown, colorWhite, t);
        objCol = color;
    }

    if (localPos.z > blueCutOff) {
        // Operations above water
        objCol *= darkness;
    } else {
        // Operations on water
        float waterScalar = 2.;
        localNormal = vec3(0.,1.,0.) + vec3(
            0.1*texture2D(uNoise, vec2((localPos.x+2.5)/waterScalar, (localPos.y+2.2)/waterScalar)).z,
            0.1*texture2D(uNoise, vec2((localPos.x+1.2)/waterScalar, (localPos.y-4.1)/waterScalar)).z,
            0.1*texture2D(uNoise, vec2((localPos.x-3.6)/waterScalar, (localPos.y+7.7)/waterScalar)).z
        );
    }

    // float dist = distance(uCamXY, localPos.xy);
    // objCol *= (1.-smoothstep(0.75, 1.0, dist / 10. )); // distance fog
    objCol *= (1.-smoothstep(0.995, 1.0, gl_FragCoord.z )); // distance fog

    // Debug Normals
    // vec3 objCol = normal;

    // Light
    vec3 lightCol = vec3(1.0, 1.0, 1.0); // Light color
    vec3 lightPos = vec3(5., 0., 0.); // Light source position
    float ambiStrength = 0.4; // Ambient light strength
    float diffStength = 0.7; // Diffuse light strength

    float depth = gl_FragCoord.z;

    // Ambient Lighting
    vec3 ambiLight = lightCol * ambiStrength;
    
    // Diffuse Lighting
    vec3 diffDir = normalize(lightPos - localPos);
    vec3 diffLight = lightCol * diffStength * max(dot(localNormal, diffDir), 0.0);

    vec3 combLight = ambiLight + diffLight;
    vec3 col = combLight * objCol;

    // shadow fog
    // col = col*(1.-smoothstep(0.99,1.,gl_FragCoord.z));

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