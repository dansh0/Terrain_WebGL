import { useState } from "react";
import Head from "next/head";
import WebGLCanvas from "@/engine/graphicsCanvas";
import RotationControls from "./controls";

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export default function Home() {
  const [rotation, setRotation] = useState<Vec3>({ x: 30, y: 0, z: 0 });
  const [height, setHeight] = useState<number>(2);
  const [forward, setForward] = useState<number>(0);
  const [fps, setFPS] = useState<number>(0);
  const resetClick = () => {
    console.log('Reset')
  }

  const cameraProps = {
    rotation,
    setRotation,
    height,
    setHeight,
    forward, 
    setForward
  }

  return (
    <>
      <Head>
        <title>WebGL Terrain</title>
        <meta name="description" content="Terrain Demo with WebGL" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WebGLCanvas rotation={rotation} height={height} forward={forward} resetClick={resetClick} setFPS={setFPS}/>
      <RotationControls cameraProps={cameraProps} resetClick={resetClick} fps={fps}/>
    </>
  );
}
