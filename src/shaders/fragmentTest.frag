precision mediump float;
uniform float uTime;
varying vec2 vUv;
    
// MAIN
void main()
{
    float depth = gl_FragCoord.z;

    // Output to screen
    gl_FragColor = vec4(vUv.x*depth, vUv.y*depth, 0.0, 1.0);
    // gl_FragColor = vec4(1.0);
    
}