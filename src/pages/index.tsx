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
  const [rotation, setRotation] = useState<Vec3>({ x: 0, y: 0, z: 0 });


  return (
    <>
      <Head>
        <title>WebGL Terrain</title>
        <meta name="description" content="Terrain Demo with WebGL" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WebGLCanvas rotation={rotation}/>
      <RotationControls onChange={setRotation}/>
    </>
  );
}
