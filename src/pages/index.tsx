import Head from 'next/head';
import Image from 'next/image';
import LoginBox from './components/LoginBox';
import { useState } from 'react';

export default function Home(props: { roomId: number, author: {id: number, name: string}}) {

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	setMessage(e.target.value);
  }

  const handleClick = (e: React.FormEvent) => {
    e.preventDefault();
    if(message){
      const messageData = {
		"content": message,
		"roomID": props.roomId,
		"author": {
			"id": props.author.id,
            "name": props.author.name
		},
		"timestamp": new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
	  };
	  //send to backend here, for now just console log
      console.log(messageData);
	}
  }

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
        <input type="text" id="new-message" name="message" placeholder="Type your message here" value={message} onChange={handleChange} />
        <button type="submit" onClick={handleClick}>Enter</button>
      </form>
    </main>
      
    </>
  );
}
