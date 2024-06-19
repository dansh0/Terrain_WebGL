import React, { useRef, useEffect } from 'react'
import Engine from './engine';

interface Vec3 {
    x: number;
    y: number;
    z: number;
  }

const WebGLCanvas = (rotation: Vec3) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    console.log(rotation)
    useEffect(() => {
        // once mounted
        const engine = new Engine({canvas: canvasRef.current, rotation: rotation.rotation})
    }, []);
    
    return <canvas className="webglCanvas" ref={canvasRef} />
}


export default WebGLCanvas