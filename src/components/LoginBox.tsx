import { useState } from "react";
import { getAuth, signInAnonymously, updateProfile } from "firebase/auth";
import Button from "./Button";

export default function LoginBox() {
  const [displayName, setUsername] = useState("");
  const onSignInAnonymously = (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const aux = async () => {
      try {
        const auth = getAuth();
        await signInAnonymously(auth);
        const user = auth.currentUser!;
        await updateProfile(user, { displayName });
      } catch (e) {
        // TODO: Handle errors
        console.log(e);
      }
    };
    aux();
  };

  return (
    <div className="min-h-fit h-screen flex justify-center items-center">
      <div
        id="loginContainer"
        className="bg-gradient-to-b from-white to-[#f0fbf8] flex flex-col space-y-8 px-8 py-14 rounded-3xl font-merriweatherRegular w-[512px]"
      >
        <div className="flex flex-col justify-center items-center gap-2">
          <h2 className="text-3xl text-gunmetal-1000 font-calistoga">
            Welcome to Cobra Chat
          </h2>
        </div>

        <form
          id="loginForm"
          onSubmit={onSignInAnonymously}
          className="flex flex-col gap-2 w-full"
        >
          <div className="flex flex-col gap-2 w-full">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="What do you want your username to be?"
              className="p-3 rounded-md border-2 active:border-dashed w-full"
              value={displayName}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={displayName.length === 0}>
            Continue
          </Button>
        </form>

        <div className="text-center">OR</div>

        <div className="space-y-10">
          <div className="w-full flex justify-center">
            <Button className="shadow-xl bg-blue-300 h-12 px-2 rounded-lg">
              Log in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
