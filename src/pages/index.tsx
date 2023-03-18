import Head from "next/head";
import LoginBox from "./components/LoginBox";
import { ChatRoom } from "./features/chat/ChatRoom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase.config";

export default function Home() {
  const [user, loading] = useAuthState(auth);

  let component = <div />;

  if (loading) {
    component = (
      <div className="w-full h-screen flex justify-center items-center">
        <h1>loading...</h1>
      </div>
    );
  } else if (!user) {
    component = <LoginBox />;
  } else if (user) {
    component = <ChatRoom roomId={0} author={{ id: 0, name: "" }} />;
  }

  return (
    <>
      <Head>
        <title>Cobra Chat</title>
        <meta
          name="description"
          content="Chat Application by team Turquoise Cobra"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {component}
    </>
  );
}
