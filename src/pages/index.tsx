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
      <aside>
        <ol>
          <li>Jane Doe</li>
          <li>Juan Perez</li>
          <li>Mohammed Ahmed</li>
        </ol>
      </aside>
      <section>
        <p>Hey</p>
        <p>Hello</p>
        <p>Hi</p>
      </section>
      <form>
        <input type="text" id="new-message" name="message" placeholder="Type your message here" />
        <button type="submit">Enter</button>
      </form>
    </main>
      
    </>
  );
}
