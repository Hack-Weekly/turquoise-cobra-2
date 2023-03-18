import Head from "next/head";
import Image from "next/image";
import LoginBox from "./components/LoginBox";
import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase.config";

export type IHome = {
  roomId: number;
  author: {
    id: number;
    name: string;
  };
};

export default function Home(props: IHome) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [user, loading, error] = useAuthState(auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date();
    if (message) {
      const messageData = {
        content: message,
        roomID: props.roomId,
        author: {
          id: props.author.id,
          name: props.author.name,
        },
        timestamp: d.getTime(),
      };
      //send to backend here, for now just console log
      setMessage("");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <h1>loading...</h1>
      </div>
    );
  }

  if (!user) {
    return <LoginBox />;
  }

  return (
    <>
      <Head>
        <title>TurqChat</title>
        <meta
          name="description"
          content="Chat Application by team Turquoise Cobra"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="bg-turquoise-200 mx-auto h-screen flex">
        <aside className="flex w-[256px]">
          <ol>
            <RoomListItem />
            <RoomListItem />
            <RoomListItem />
            <RoomListItem />
          </ol>
        </aside>
        <section className="flex flex-auto flex-col iNametems-stretch bg-white">
          <div className="flex flex-auto flex-col">
            <ChatMessage />
            <ChatMessage />
            <ChatMessage />
            <ChatMessage />
          </div>
          <form onSubmit={handleSubmit}>
            <input
              className="w-full"
              type="text"
              id="new-message"
              name="message"
              placeholder="Type your message here"
              value={message}
              onChange={handleChange}
            />
            <button type="submit">Enter</button>
          </form>
        </section>
      </main>
    </>
  );
}

const ChatMessage = () => {
  return <p className="p-4">Hi</p>;
};

const RoomListItem = () => {
  return <li className="p-4">Room Name</li>;
};
