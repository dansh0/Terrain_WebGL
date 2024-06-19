attribute vec4 aPosition;
uniform mat4 uMatrix;
varying vec2 vUv;
varying float depth;
void main() {
    vUv = aPosition.xy;
    depth = aPosition.z;
    vec4 position = uMatrix * aPosition;
    gl_Position = position;
}