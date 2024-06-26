attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec4 aNormal;
uniform mat4 uMatrix;
uniform mat4 uCamera;
varying vec3 debugColor;
varying vec3 normal;
varying vec3 localPos;

void main() {
    localPos = aPosition.xyz;
    debugColor = aColor.rgb; 
    vec4 normal4 = vec4((aNormal.xyz*0.5 + 0.5), 1.0);
    normal = normal4.xyz;

    vec4 alterPosition = aPosition;
    vec4 position = uCamera * uMatrix * alterPosition;
    gl_Position = position;
}