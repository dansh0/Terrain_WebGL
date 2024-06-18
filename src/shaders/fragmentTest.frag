precision mediump float;
uniform float uTime;
varying vec2 vUv;
    
// MAIN
void main()
{
    // Output to screen
    gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
    // gl_FragColor = vec4(1.0);
    
}