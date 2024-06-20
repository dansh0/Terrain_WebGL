import vertexShader from '../shaders/vertexTest.vert'
import fragmentShader from '../shaders/fragmentTest.frag'
import PlaneVertices from './PlaneVertices.ts'
import Mat4 from "@/utils/matrix";

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

class Engine {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext;
    vertexShader: string = vertexShader;
    fragmentShader: string = fragmentShader;
    tMat: Mat4;
    size: number[];
    divisions: number;
    Plane: PlaneVertices;
    positionBuff: number[];
    colorBuff: number[];
    normalBuff: number[];
    time;

    constructor(canvas: HTMLCanvasElement) {
        this.size = [2,2];
        this.divisions = 50;
        this.Plane;
        this.positonBuff;
        this.colorBuff;
        this.normalBuff;
        this.time;
        this.canvas = canvas;
        this.gl = this.canvas!.getContext('webgl2');
        this.tMat = new Mat4();
        this.init();
    }

    init(): void {

        const gl = this.gl;
        const canvas = this.canvas;

        // Check Null
        if (canvas === null) { throw Error('Cannot get canvas'); }
        if (gl===null) { throw Error("Cannot get webgl2 context from canvas"); }
        
        // Clear Canvas
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        
        // Set Canvas Size
        canvas.width = canvas.clientWidth // resize to client canvas
        canvas.height = canvas.clientHeight // resize to client canvas
        console.log(canvas.width, canvas.height)
        gl.viewport(0, 0, canvas.width, canvas.height)

        // Time Function
        const startTime = Date.now();
        this.time = () => { return Date.now() - startTime }

        // Set up Position Attribute
        this.positionBuff = gl.createBuffer()
        this.Plane = new PlaneVertices(this.size, Math.floor(this.divisions)) // PLANE CONFIGS HERE
        let positions = this.Plane.positions
        this.Plane.modifyZ(this.time()); // set first positions
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuff)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
        const posBuffSize = 3
        const posBuffType = gl.FLOAT
        
        // Set up Color Attribute
        this.colorBuff = gl.createBuffer()
        let colors = this.Plane.colors
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuff)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
        const colBuffSize = 3
        const colBuffType = gl.FLOAT
        
        // Set up Normal Attribute
        this.normalBuff = gl.createBuffer()
        let normals = this.Plane.normals
        this.Plane.generateNormals();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuff)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW)
        const normBuffSize = 3
        const normBuffType = gl.FLOAT


        // Transformation Matrix
        this.tMat.rotationX(Math.PI*(3/8))
        this.tMat.rotationZ(-Math.PI*(5/4))

        // Compile the vertex shader
        const vShader = gl.createShader( gl['VERTEX_SHADER'] )
        if (vShader === null) {throw Error('Cannot create vertex shader')}
        gl.shaderSource(vShader, this.vertexShader);
        gl.compileShader(vShader);
        console.log(gl.getShaderInfoLog(vShader));

        // Compile the fragment shaders
        const fShader = gl.createShader( gl['FRAGMENT_SHADER'] )
        if (fShader === null) {throw Error('Cannot create fragment shader')}
        gl.shaderSource(fShader, this.fragmentShader);
        gl.compileShader(fShader);
        console.log(gl.getShaderInfoLog(fShader));
        

        // Create Program
        const setUpProgram = (fShader: WebGLShader) => {

            let program = gl.createProgram()
            if (program === null) {throw Error('Cannot create program')}
            gl.attachShader(program, vShader)
            gl.attachShader(program, fShader)
            gl.linkProgram(program)
            gl.useProgram(program)
            
            
            // Instruct Program how to use attribute data
            // Position
            const posAttribLocation = gl.getAttribLocation(program, 'aPosition')
            gl.enableVertexAttribArray(posAttribLocation)
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuff)
            gl.vertexAttribPointer( posAttribLocation, posBuffSize, posBuffType, false, 0, 0)
            // Color
            const colAttribLocation = gl.getAttribLocation(program, 'aColor')
            gl.enableVertexAttribArray(colAttribLocation)
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuff)
            gl.vertexAttribPointer( colAttribLocation, colBuffSize, colBuffType, false, 0, 0)
            // Normal
            const normAttribLocation = gl.getAttribLocation(program, 'aNormal')
            gl.enableVertexAttribArray(normAttribLocation)
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuff)
            gl.vertexAttribPointer( normAttribLocation, normBuffSize, normBuffType, false, 0, 0)
            
            // Set up Uniforms
            let timeUniformLocation = gl.getUniformLocation(program, "uTime")
            gl.uniform1f(timeUniformLocation, this.time())

            let resUniformLocation = gl.getUniformLocation(program, "uResolution")
            gl.uniform2f(resUniformLocation, canvas.width, canvas.height)

            let matrixUniformLocation = gl.getUniformLocation(program, "uMatrix")
            gl.uniformMatrix4fv(matrixUniformLocation, false, this.tMat.matrix)

            return program
        }

        let program = setUpProgram(fShader)
        gl.useProgram(program)

        // Enable Depth Test
        gl.enable(gl.DEPTH_TEST);

        // Draw
        const count = Math.floor(positions.length/3)
        gl.drawArrays(gl.TRIANGLES, 0, count) //primitive, offset, count

        // Animate!
        const animate = () => {
            // clear
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // update time
            let timeUniformLocation = gl.getUniformLocation(program, "uTime")
            gl.uniform1f(timeUniformLocation, this.time()/1000)

            // console.log(this.Plane.positions.length, this.Plane.normals.length)

            // Transformation Matrix
            let matrixUniformLocation = gl.getUniformLocation(program, "uMatrix")
            gl.uniformMatrix4fv(matrixUniformLocation, false, this.tMat.matrix)

            gl.drawArrays(gl.TRIANGLES, 0, count)
            requestAnimationFrame(animate);
        }

        window.addEventListener("resize", () => {
            let width = window.innerWidth
            let height = window.innerHeight
            canvas.style.height = height + 'px'
            canvas.style.width = width + 'px'
            canvas.width = canvas.clientWidth // resize to client canvas
            canvas.height = canvas.clientHeight // resize to client canvas
            let resUniformLocation = gl.getUniformLocation(program, "uResolution")
            gl.uniform2f(resUniformLocation, canvas.width, canvas.height)
        });

        animate()
    }

    updateRotation(rotation: Vec3): void {
        // updates rotation around x axis, then y axis, then z axis, in degrees (from UI)
        this.tMat.setIdentity(); // reset
        this.tMat.rotationX(rotation.x*(Math.PI/180))
        this.tMat.rotationY(rotation.y*(Math.PI/180))
        this.tMat.rotationZ(rotation.z*(Math.PI/180))
        this.tMat.translate(0,0,-0.5);
    }

    reset(): void {
        // adjust z-position
        this.Plane.modifyZ(this.time());
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuff)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.Plane.positions), this.gl.STATIC_DRAW)
        
        // // update normals
        this.Plane.generateNormals();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuff)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.Plane.normals), this.gl.STATIC_DRAW)
    }
}

export default Engine
