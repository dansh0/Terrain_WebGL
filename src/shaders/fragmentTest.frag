precision mediump float;
// uniform float uTime;
varying vec3 localPos;
varying vec3 debugColor;
varying vec3 normal;
varying vec4 vColor;
    
// MAIN
void main()
{
    vec3 objCol = vColor.xyz; // Base material color
    vec3 lightCol = vec3(1.0, 1.0, 1.0); // Light color
    vec3 lightPos = vec3(50.); // Light source position
    float ambiStrength = 0.4; // Ambient light strength
    float diffStength = 0.3; // Diffuse light strength

    float depth = gl_FragCoord.z;

    // Ambient Lighting
    vec3 ambiLight = lightCol * ambiStrength;
    
    // Diffuse Lighting
    vec3 diffDir = normalize(lightPos - localPos);
    vec3 diffLight = lightCol * diffStength * max(dot(normal, diffDir), 0.0);

    vec3 combLight = ambiLight + diffLight;
    vec3 col = combLight * objCol;

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
    
}