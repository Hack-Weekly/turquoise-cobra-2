import Head from 'next/head';
import Image from 'next/image';
import LoginBox from './components/LoginBox';
import { useState } from 'react';

export default function Home() {

  const [isLoggedIn, setIsLoggedIn] = useState(false)

  return (
    <>
      <Head>
        <title>TurqChat</title>
        <meta
          name="description"
          content="Chat Application by team Turquoise Cobra"
        />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='bg-turquoise-200 mx-auto h-screen flex items-center justify-center'>
        <div className='flex flex-col items-center justify-center'>
          <h1 className="text-6xl font-calistoga mb-8">TurqChat</h1>
          {!isLoggedIn ? <LoginBox /> : (
            <div>
              <h2 className='font-merriweatherRegular'>Chat Window state test (WIP)</h2>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
