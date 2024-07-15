import vertexShader from '../shaders/vertexTest.vert';
import fragmentShader from '../shaders/fragmentTest.frag';
import PlaneVertices from './PlaneVertices.ts';
import Mat4 from "@/utils/matrix";
import { initSimplex, simplexNoise2D } from './patterns';
import Camera from '@/utils/camera';

interface Vec3 {
    x: number;
    y: number;
    z: number;
}

class Engine {
    canvas: HTMLCanvasElement;
    gl: WebGL2RenderingContext | null;
    vertexShader: string = vertexShader;
    fragmentShader: string = fragmentShader;
    camera: Camera | null;
    tMat: Mat4;
    size: number[];
    divisions: number;
    noiseSize: number;
    noiseScale: number;
    cameraDist: number;
    cameraHeight: number;
    plane: PlaneVertices | null;
    positionBuff: WebGLBuffer | null;
    colorBuff: WebGLBuffer | null;
    normalBuff: WebGLBuffer | null;
    startTime: number;
    frameCount: number;
    lastFrameCount: number;
    lastFrameTime: DOMHighResTimeStamp;
    setFPS: Dispatch<SetStateAction<number>>;


    constructor(canvas: HTMLCanvasElement, setFPS: Dispatch<SetStateAction<number>>) {
        this.size = [50, 50];
        this.divisions = 500;
        this.noiseSize = 500;
        this.noiseScale = 1/50;
        this.cameraDist = 30;
        this.cameraHeight = 0.0;
        this.plane = null;
        this.positionBuff = null;
        this.colorBuff = null;
        this.normalBuff = null;
        this.startTime = Date.now();
        this.canvas = canvas;
        this.gl = this.canvas!.getContext('webgl2');
        this.camera = null;
        this.tMat = new Mat4();
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.lastFrameCount = 0;
        this.setFPS = setFPS;
        this.init();
    }

    init(): void {

        const gl = this.gl;
        const canvas = this.canvas;

        // Check Null
        if (canvas === null) { throw Error('Cannot get canvas'); }
        if (gl===null) { throw Error("Cannot get webgl2 context from canvas"); }
        
        // Clear Canvas
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Set Canvas Size
        canvas.width = canvas.clientWidth; // resize to client canvas
        canvas.height = canvas.clientHeight; // resize to client canvas
        console.log(canvas.width, canvas.height);
        gl.viewport(0, 0, canvas.width, canvas.height);

        // Time Function
        const startTime = Date.now();
        this.getTime = () => { return Date.now() - startTime; }

        // this.tMat.rotationX(0.1);

        // Set up Position Attribute
        this.positionBuff = gl.createBuffer();
        this.plane = new PlaneVertices(this.size, Math.floor(this.divisions)); // PLANE CONFIGS HERE
        let positions = this.plane.positions;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuff);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        const posBuffSize = 3;
        const posBuffType = gl.FLOAT;
        
        // Set up Color Attribute
        this.colorBuff = gl.createBuffer();
        this.plane.generateRandomTriColors();
        let colors = this.plane.colors;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuff);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        const colBuffSize = 3;
        const colBuffType = gl.FLOAT;
        
        // Set up Normal Attribute
        this.normalBuff = gl.createBuffer();
        let normals = this.plane.normals;
        this.plane.generateNormals();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuff);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        const normBuffSize = 3;
        const normBuffType = gl.FLOAT;

        // Compile the vertex shader
        const vShader = gl.createShader( gl['VERTEX_SHADER'] );
        if (vShader === null) {throw Error('Cannot create vertex shader');}
        gl.shaderSource(vShader, this.vertexShader);
        gl.compileShader(vShader);
        console.log(gl.getShaderInfoLog(vShader));

        // Compile the fragment shaders
        const fShader = gl.createShader( gl['FRAGMENT_SHADER'] );
        if (fShader === null) {throw Error('Cannot create fragment shader');}
        gl.shaderSource(fShader, this.fragmentShader);
        gl.compileShader(fShader);
        console.log(gl.getShaderInfoLog(fShader));

        // Simplex Noise Uniform
        const size = [this.noiseSize,this.noiseSize];
        const scale = [this.noiseScale, this.noiseScale];
        const noiseFunc = initSimplex();
        const noiseBuffer = simplexNoise2D(noiseFunc, size, scale);
        let noiseTex = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0); // move to first texture
        gl.bindTexture(gl.TEXTURE_2D, noiseTex);
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4); // alignment 4 for RGBA
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0], size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseBuffer);// level, internal format, width, height, border, format, type
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // LINEAR interp
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // LINEAR interp
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT); // repeat
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT); // repeat

        // Set-up Camera
        this.camera = new Camera(Math.PI/4, this.canvas.width/this.canvas.height, 0.1, this.cameraDist);
        // this.camera.matrix.translate(0,-5,1);

        // Create Program
        const setUpProgram = (fShader: WebGLShader) => {

            let program = gl.createProgram();
            if (program === null) {throw Error('Cannot create program');}
            gl.attachShader(program, vShader);
            gl.attachShader(program, fShader);
            gl.linkProgram(program);
            gl.useProgram(program);
            
            // Instruct Program how to use attribute data
            // Position
            const posAttribLocation = gl.getAttribLocation(program, 'aPosition');
            gl.enableVertexAttribArray(posAttribLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuff);
            gl.vertexAttribPointer( posAttribLocation, posBuffSize, posBuffType, false, 0, 0);

            // Color
            const colAttribLocation = gl.getAttribLocation(program, 'aColor');
            gl.enableVertexAttribArray(colAttribLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuff);
            gl.vertexAttribPointer( colAttribLocation, colBuffSize, colBuffType, false, 0, 0);

            // Normal
            const normAttribLocation = gl.getAttribLocation(program, 'aNormal');
            gl.enableVertexAttribArray(normAttribLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuff);
            gl.vertexAttribPointer( normAttribLocation, normBuffSize, normBuffType, false, 0, 0);
            
            // Set up Uniforms
            let timeUniformLocation = gl.getUniformLocation(program, "uTime");
            gl.uniform1f(timeUniformLocation, this.getTime());

            let resUniformLocation = gl.getUniformLocation(program, "uResolution");
            gl.uniform2f(resUniformLocation, canvas.width, canvas.height);

            let matrixUniformLocation = gl.getUniformLocation(program, "uMatrix");
            gl.uniformMatrix4fv(matrixUniformLocation, false, this.tMat.matrix);

            let cameraUniformLocation = gl.getUniformLocation(program, "uCamera");
            gl.uniformMatrix4fv(cameraUniformLocation, false, this.camera.viewProjectionMatrix.matrix);

            let camXYUniformLocation = gl.getUniformLocation(program, "uCamXZ");
            gl.uniform2f(camXYUniformLocation, this.camera.cameraMatrix.matrix[12], this.camera.cameraMatrix.matrix[14]);
            
            let noiseUniformLocation = gl.getUniformLocation(program, "uNoise");
            gl.uniform1i(noiseUniformLocation, 0); // set texture level 0 to this uniform location

            return program
        }

        let program = setUpProgram(fShader);
        gl.useProgram(program);

        // Enable Depth Test
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        // Cull back faces
        gl.enable(gl.CULL_FACE);

        // Draw
        const count = Math.floor(positions.length/3);
        gl.drawArrays(gl.TRIANGLES, 0, count); //primitive, offset, count

        // Animate!
        const animate = () => {
            // update stats
            this.frameCount++;
            this.updateFPS();

            // clear
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // update time
            let timeUniformLocation = gl.getUniformLocation(program, "uTime");
            gl.uniform1f(timeUniformLocation, this.getTime()/1000);

            // Camera Matrix
            let cameraUniformLocation = gl.getUniformLocation(program, "uCamera");
            gl.uniformMatrix4fv(cameraUniformLocation, false, this.camera.viewProjectionMatrix.matrix);

            // Draw frame
            gl.drawArrays(gl.TRIANGLES, 0, count);
            requestAnimationFrame(animate);
        }

        window.addEventListener("resize", () => {
            let width = window.innerWidth;
            let height = window.innerHeight;
            canvas.style.height = height + 'px';
            canvas.style.width = width + 'px';
            canvas.width = canvas.clientWidth; // resize to client canvas
            canvas.height = canvas.clientHeight; // resize to client canvas
            let resUniformLocation = gl.getUniformLocation(program, "uResolution");
            gl.uniform2f(resUniformLocation, canvas.width, canvas.height);
        });

        animate();
    }

    getTime(): number {
        return Date.now() - this.startTime;
    }

    updateCamera(height: number, forward: number, rotation: Vec3): void {
        if (this.camera == null) { throw "Camera not initialized" }

        this.camera.updateCamera(height, forward, rotation);
    }

    updateFPS(): void {
        let currentTime = performance.now();
        let deltaTime = currentTime - this.lastFrameTime;
        let testTime = 1000;
        // only update after a second (or testTime if changed)
        if (deltaTime >= testTime) {
            // figure out how many frames passed and divide by time passed
            let deltaFrames = this.frameCount - this.lastFrameCount;
            let fps = (deltaFrames / deltaTime) * 1000;
            this.setFPS(fps.toFixed(0));

            // reset
            this.lastFrameTime = currentTime;
            this.lastFrameCount = this.frameCount;
        }
    }

    reset(): void {
        // adjust z-position
        console.log('reset not a thing')
    }
}

export default Engine
