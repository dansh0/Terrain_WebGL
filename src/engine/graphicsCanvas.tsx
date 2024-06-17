import React, { useRef, useEffect } from 'react'
import Engine from './engine';

const WebGLCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        // once mounted
        const engine = new Engine({canvas: canvasRef.current})
    }, []);
    
    return <canvas className="webglCanvas" ref={canvasRef} />
}


export default WebGLCanvas