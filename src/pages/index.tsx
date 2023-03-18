import Head from "next/head";
import Image from "next/image";
import LoginBox from "./components/LoginBox";
import { ChatRoom } from "./features/chat/ChatRoom";
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
  const [user, loading, error] = useAuthState(auth);

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
      <ChatRoom roomId={0} author={{ id: 0, name: "" }} />
    </>
  );
}
