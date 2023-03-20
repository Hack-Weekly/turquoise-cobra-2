import LoginBox from "@/components/LoginBox";
import Profile from "@/components/Profile";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../lib/firebase.config";

export default function ProfileMain() {
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
    component = <Profile />
  }
  return (
    <> 
      {component}
    </>
  )
}
