import Head from 'next/head';
import Image from 'next/image';

export default function Home() {
  return (
    <>
      <Head>
        <title>TurqChat</title>
        <meta
          name="description"
          content="Chat App by team Turquoise Cobra"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="mx-auto">
        <h1 className="font-calistoga text-turquoise-1000">
          Hello World
        </h1>
      </main>
    </>
  );
}
