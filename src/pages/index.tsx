import Head from "next/head";
import WebGLCanvas from "@/engine/graphicsCanvas";

export default function Home() {
  return (
    <>
      <Head>
        <title>WebGL Terrain</title>
        <meta name="description" content="Terrain Demo with WebGL" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <WebGLCanvas/>
    </>
  );
}
