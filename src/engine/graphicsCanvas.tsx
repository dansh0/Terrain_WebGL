import React, { useRef, useEffect } from 'react'
import Engine from './engine';

interface Vec3 {
    x: number;
    y: number;
    z: number;
  }

const WebGLCanvas = ({rotation}: {rotation: Vec3}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engine = useRef<Engine | null>(null);

    // run once on mounted
    useEffect(() => {
        engine.current = new Engine(canvasRef.current, rotation);
    }, []);

    // update parameters
    useEffect(() => {
        engine.current.updateRotation(rotation);
    }, [rotation]);
    
    return <canvas className="webglCanvas" ref={canvasRef} />
}


export default WebGLCanvas