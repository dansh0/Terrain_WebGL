attribute vec4 aPosition;
attribute vec4 aColor;
attribute vec4 aNormal;
uniform mat4 uMatrix;
uniform mat4 uCamera;
uniform float uTime;
varying vec3 debugColor;
varying vec3 normal;
varying vec3 localPos;
varying float uWaterLevel;

vec2 hash( vec2 p ) 
{
	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( in vec2 pos )
{
    // Modified from iq - https://www.shadertoy.com/view/Msf3WH
    const float K1 = 0.366025404; // constant from (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // constant from (3-sqrt(3))/6;

	vec2  iGrid = floor( pos + (pos.x + pos.y)*K1 );    // simplex grid cell
    vec2  a = pos - iGrid + (iGrid.x+iGrid.y)*K2;       // relative position within cell
    float vertOrder = step(a.y,a.x);                    // ordering of the simplex vertices
    vec2  vertOffset = vec2(vertOrder,1.0-vertOrder);   // offset of the second vertex
    vec2  b = a - vertOffset + K2;                      // relative position of second vertex
	vec2  c = a - 1.0 + 2.0*K2;                         // relative position of third vertex
    vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );  // attenuation vector
    vec3  h4 = h * h * h * h;               // attentuation to fourth power, to modulate gradient contributions
    vec2  g0 = hash(iGrid + 0.0);           // gradient of first vertex
    vec2  g1 = hash(iGrid + vertOffset);    // gradient of second vertex
    vec2  g2 = hash(iGrid + 1.0);           // gradient of third vertex
    float  dotG0 = dot(a, g0);
    float  dotG1 = dot(b, g1);
    float  dotG2 = dot(c, g2);

	vec3  n = h4 * vec3( dotG0, dotG1, dotG2);      // noise contributions of three vertices
    float noiseValue = dot(n, vec3(70.0));          // resulting noise value

    return noiseValue;

    // // Compute the derivatives
    // vec2 grad0 = -8.0 * h4.x * dot(a, g0) * a + h4.x * g0;
    // vec2 grad1 = -8.0 * h4.y * dot(b, g1) * b + h4.y * g1;
    // vec2 grad2 = -8.0 * h4.z * dot(c, g2) * c + h4.z * g2;

    // vec2 gradient = 70. * (grad0 + grad1 + grad2);

    // return vec3(gradient, noiseValue);
}

// vec3 calcNormal(vec3 noisePacked) {
//     // Get the normal of the noise value from the returned derivatives
//     // WIP - Currently not matching the more accurate results from calcNormal2
//     float height = noisePacked.z;
//     vec2 gradient = noisePacked.xy;

//     // Construct the normal from the gradient
//     vec3 dx = vec3(1.0, 0.0, gradient.x);
//     vec3 dy = vec3(0.0, 1.0, gradient.y);

//     // Cross the partial derivates to get the normal vector
//     vec3 normal = normalize(cross(dx, dy));

//     return normal;
// }

void calcGradients(vec2 pos, float epsilon, out vec3 dx, out vec3 dy) {
    // calc x and y gradients

    // calculate noise surrounding the point
    float height = noise( pos );
    float hX1 = noise( pos + vec2(epsilon, 0.0) );
    float hX2 = noise( pos - vec2(epsilon, 0.0) );
    float hY1 = noise( pos + vec2(0.0, epsilon) );
    float hY2 = noise( pos - vec2(0.0, epsilon) );

    // calculate gradient
    dx = vec3(2.0 * epsilon, 0.0, hX1 - hX2);
    dy = vec3(0.0, 2.0 * epsilon, hY1 - hY2);

}

vec3 calcNormal2(vec2 pos, float epsilon) {
    // calc normal from position

    // init derivatives
    vec3 dx = vec3(0);
    vec3 dy = vec3(0);

    // get derivates
    calcGradients(pos, epsilon, dx, dy);
    
    vec3 normal = normalize(cross(dx, dy));

    return normal;
}

void getNoiseVals( vec2 pos, vec2 shift, float freq, float scale, out float height, out vec3 dx, out vec3 dy ) {
    // get the noise and gradients
    vec2 modifiedPos = (pos + shift) * freq;
    height = noise(modifiedPos) * scale;
    float epsilon = 0.001;
    calcGradients(modifiedPos, epsilon, dx, dy);
    dx *= scale;
    dy *= scale;
}

// void getNoiseVals( vec2 pos, vec2 shift, float freq, float scale, out float height, out vec3 dx, out vec3 dy ) {
//     // get the noise and gradients
//     vec2 modifiedPos = (pos + shift) * freq;
//     vec3 noisePacked = noise(modifiedPos) * scale;
//     height = noisePacked.z;

//     // Construct the normal from the gradient
//     dx = vec3(1.0, 0.0, noisePacked.x);
//     dy = vec3(0.0, 1.0, noisePacked.y);
// }

vec3 getNormalFromGradient( vec3 dx, vec3 dy ) {
    // get the normal value from xy gradients
    vec3 normal = normalize(cross(dx, dy));
    return normal;
}

void addValues(inout float height, inout vec3 dx, inout vec3 dy, in float tempHeight, in vec3 tempDx, in vec3 tempDy) {
    height += tempHeight;
    dx += tempDx;
    dy += tempDy;
}



void main() {
    // // NOISE NOISE NOISE
    float heightModifier = 1.0;

    localPos = aPosition.xyz;
    vec2 camSpeed = vec2(0.1, 0.1);
    localPos.x -= uTime * camSpeed.x;
    localPos.y -= uTime * camSpeed.y;

    // first level
    float height;
    vec3 dx;
    vec3 dy;
    getNoiseVals(localPos.xy, vec2(0., 0.), 0.2, 2.0, height, dx, dy);

    // subsequent levels
    float tempHeight;
    vec3 tempDx;
    vec3 tempDy;
    
    // second noise level
    getNoiseVals(localPos.xy, vec2(3.0, -4.5), 0.8, 0.5, tempHeight, tempDx, tempDy);
    addValues( height, dx, dy, tempHeight, tempDx, tempDy );

    // third noise level
    getNoiseVals(localPos.xy, vec2(-8.0, 12.5), 1.6, 0.2, tempHeight, tempDx, tempDy);
    addValues( height, dx, dy, tempHeight, tempDx, tempDy );

    // fourth noise level
    getNoiseVals(localPos.xy, vec2(-5.0, -17.5), 5.0, 0.05, tempHeight, tempDx, tempDy);
    addValues( height, dx, dy, tempHeight, tempDx, tempDy );

    vec3 noiseNormal = getNormalFromGradient(dx, dy);

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