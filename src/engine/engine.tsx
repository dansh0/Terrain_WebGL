import React from "react";

type EngineProps = {
    canvas: HTMLCanvasElement | null
};


class Engine extends React.Component<EngineProps> {
    canvas: HTMLCanvasElement | null;
    gl: WebGL2RenderingContext | null;

    constructor(props: EngineProps) {
        super(props)
        this.canvas = props.canvas
        this.gl = this.canvas!.getContext('webgl2')
        this.init()
    }

    init() {

        const gl = this.gl;
        const canvas = this.canvas;

        // Check Null
        if (canvas === null) { throw Error('Cannot get canvas'); }
        if (gl===null) { throw Error("Cannot get webgl2 context from canvas"); }

        // Clear Canvas
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        // Set Canvas Size
        console.log(canvas.width, canvas.height)
        gl.viewport(0, 0, canvas.width, canvas.height)

        // Set up Attributes
        const positionBuff = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuff)
        let positions = [
            -1, -1, -1,
            -1, 1, -1,
            1, 1, -1,
            -1, -1, -1,
            1, 1, -1,
            1, -1, -1
        ]
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
        const buffSize = 3
        const buffType = gl.FLOAT

        // Time Function
        const startTime = Date.now();
        const time = () => { return Date.now() - startTime }

        // Load Shaders
        const vertexShader = `
            attribute vec4 aPosition;
            varying vec2 vUv;
            void main() {
                vUv = aPosition.xy/2.0 + 0.5;
                gl_Position = aPosition;
            }
        `
        const fragmentShader = `
            precision mediump float;
            varying vec2 vUv;
                
            // MAIN
            void main()
            {
                // Output to screen
                gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
                
            }
        `

        // Compile the vertex shader
        const vShader = gl.createShader( gl['VERTEX_SHADER'] )
        if (vShader === null) {throw Error('Cannot create vertex shader')}
        gl.shaderSource(vShader, vertexShader);
        gl.compileShader(vShader);
        console.log(gl.getShaderInfoLog(vShader));

        // Compile the fragment shaders
        const fShader = gl.createShader( gl['FRAGMENT_SHADER'] )
        if (fShader === null) {throw Error('Cannot create fragment shader')}
        gl.shaderSource(fShader, fragmentShader);
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
            
            const posAttribLocation = gl.getAttribLocation(program, 'aPosition')

            // Instruct Program how to use attribute data
            gl.enableVertexAttribArray(posAttribLocation)
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuff)
            gl.vertexAttribPointer( posAttribLocation, buffSize, buffType, false, 0, 0)
            
            // Set up Uniforms
            let timeUniformLocation = gl.getUniformLocation(program, "uTime")
            gl.uniform1f(timeUniformLocation, time())

            let resUniformLocation = gl.getUniformLocation(program, "uResolution")
            gl.uniform2f(resUniformLocation, canvas.width, canvas.height)

            return program
        }

        let program = setUpProgram(fShader)
        gl.useProgram(program)

        // Draw
        const count = Math.floor(positions.length/3)
        gl.drawArrays(gl.TRIANGLES, 0, count) //primitive, offset, count

        // Animate!
        const animate = () => {
            let timeUniformLocation = gl.getUniformLocation(program, "uTime")
            gl.uniform1f(timeUniformLocation, time()/1000)
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

    render() {
        return (null);
    }
}

export default Engine
