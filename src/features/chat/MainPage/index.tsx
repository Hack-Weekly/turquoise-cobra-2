import Head from "next/head";
import LoginBox from "@/components/LoginBox";
import { ChatRoom } from "@/features/chat/ChatRoom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../../lib/firebase.config";
import cx from "classnames";

export function MainPage() {
  const [user, loading] = useAuthState(auth);

  // XXX: TODO: Ideally, the login is set as insert so there's animations
  const component = (
    <div>
      <div
        className={cx(
          user && "opacity-100",
          !user && "scale-95 opacity-50 blur-sm",
          "transition-all"
        )}
      >
        <ChatRoom roomId={0} author={{ id: 0, name: "" }} />
      </div>
      {!user && (
        <div
          className={cx(
            user && "opacity-0",
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-100 transition-all"
          )}
        >
          <LoginBox loading={loading} />
        </div>
      )}
    </div>
  );

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

export default MainPage;
