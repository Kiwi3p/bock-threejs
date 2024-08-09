// pages/index.js
import Head from 'next/head';
import ThreeScene from './components/threeScene';


export default function Home() {
  return (
    <>
      <Head>
        <title>Three.js Scene in Next.js</title>
        <meta name="description" content="Three.js scene integrated into a Next.js application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1>Three.js Scene</h1>
        <ThreeScene />
      </main>
    </>
  );
}
