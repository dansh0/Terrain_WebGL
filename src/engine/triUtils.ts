// Set of utility functions for operating on triangles and vertices

// 
export function randomTriColors(triCount: number): number[] {
    // generate a webgl-style attribute array "color" where 3 values make a color for one vertex
    let colors = [];
    let color;

    // chose random color for every tri, 3 points, 9 numbers
    for (let iTri=0; iTri<triCount; iTri++) {
        color = [Math.random(), Math.random(), Math.random()];
        for (let iVert=0; iVert<3; iVert++) {
            // assign the vert to this color
            colors.push(...color);
        }
    }

    return colors
}

export function calculateNormals(positions: number[]): number[] {
    // calculate a webgl-style normal list based on input positions of vertices
    // uses this formula: https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal

    let normals = [];
    let triCount = positions.length/9 // 3 points per vertex, 3 vertices per triangle
    let tri: number[][];
    let si, vec3U, vec3V, nX, nY, nZ, length;

    for (let iTri=0; iTri<triCount; iTri++) {
        si = 9*iTri; //start index
        tri = [
            [positions[si], positions[si + 1], positions[si + 2]], // point 1 xyz
            [positions[si + 3], positions[si + 4], positions[si + 5]], // point 2 xyz
            [positions[si + 6], positions[si + 7], positions[si + 8]] // point 3 xyz
        ];

        // subtract vertices from one another to get two vectors with shared origin
        vec3U = tri[1].map((num: number, index: number) => {
            return num - tri[0][index];
        })
        vec3V = tri[2].map((num: number, index: number) => {
            return num - tri[0][index];
        });
    
        // get normal
        nX = vec3U[1]*vec3V[2] - vec3U[2]*vec3V[1]; // tri's normal x val
        nY = vec3U[2]*vec3V[0] - vec3U[0]*vec3V[2]; // tri's normal y val
        nZ = vec3U[0]*vec3V[1] - vec3U[1]*vec3V[0]; // tri's normal z val

        // normalize vector
        length = Math.sqrt(nX*nX + nY*nY + nZ*nZ);

        // push for all three vertices
        for (let iVert=0; iVert<3; iVert++) {
            normals.push(nX/length);
            normals.push(nY/length);
            normals.push(nZ/length);
        }

    }

    return normals

}