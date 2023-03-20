import LoginBox from "@/components/LoginBox";
import { ChatRoom } from "@/features/chat/ChatRoom";
import Link from "next/link";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../lib/firebase.config";

export default function ProfilePage() {
  const [user, loading] = useAuthState(auth);

  let component = <div />;

  if (loading) {
    component = (
      <div className="w-full h-screen flex justify-center items-center">
        <h1 className="text-xl font-bold">Loading...</h1>
      </div>
    );
  } else if (!user) {
    component = <LoginBox />;
  } else if (user) {
    component = (
      <div className="w-full h-screen flex flex-auto flex-col gap-4 justify-center items-center">
        <h2 className="text-2xl font-calistoga">Profile Page</h2>
        <p>Your Name: username</p>
        <Link href={`/channels/T415kos6wzfgjKDBpWe3`} className="hover:underline">Return to Chat Room</Link>
      </div>
    );
  }
  return (
    <> 
      {component}
    </>
  )
}
