attribute vec4 aPosition;
uniform mat4 uMatrix;
varying vec2 vUv;
void main() {
    vUv = aPosition.xy;
    vec4 position = uMatrix * aPosition;
    gl_Position = position;
}