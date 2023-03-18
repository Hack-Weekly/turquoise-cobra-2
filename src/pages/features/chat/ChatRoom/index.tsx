import { useState } from "react";
import cx from "classnames";
import { MdSend } from "react-icons/md";
import { signOut } from "firebase/auth";
import { auth } from "../../../../../lib/firebase.config";
import {
  DataChatMessage,
  useDeleteMessage,
  useMessages,
  useSendMessage,
} from "../service";
import Button from "@/pages/components/Button";

export type IChatRoom = {
  roomId: number;
  author: {
    id: number;
    name: string;
  };
};

export const ChatRoom = (props: IChatRoom) => {
  const [messages] = useMessages();

  return (
    <main className="bg-turquoise-200 mx-auto h-screen flex">
      <aside className="flex w-[256px]">
        <div className="flex flex-col gap-4 p-4 w-full">
          <RoomListItem />
          <RoomListItem />
          <RoomListItem />
          <RoomListItem />
          <div>
            <div>{auth.currentUser!.displayName}</div>
            <Button onClick={() => signOut(auth)}>Logout</Button>
          </div>
        </div>
      </aside>
      <section className="flex flex-auto flex-col items-stretch">
        <div className="p-4">
          <h1 className="font-bold text-2xl text-center">Room Name</h1>
        </div>
        <div className="flex flex-auto flex-col bg-white rounded-3xl rounded-b-none overflow-hidden">
          <div className="flex flex-auto flex-col p-8">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
          <SendChatMessage />
        </div>
      </section>
    </main>
  );
};

const SendChatMessage = () => {
  const { sendMessage } = useSendMessage();

  const [message, setMessage] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== "") {
      sendMessage(message);

      //send to backend here, for now just console log
      setMessage("");
    }
  };

  return (
    <form className="flex p-4" onSubmit={handleSubmit}>
      <input
        className="flex-auto px-4 py-2 border border-2 rounded-xl"
        type="text"
        id="new-message"
        name="message"
        placeholder="Type your message here"
        value={message}
        onChange={handleChange}
      />
      <button className="text-teal-600 hover:text-teal-800 p-4" type="submit">
        <MdSend />
      </button>
    </form>
  );
};

type IChatMessage = {
  message: DataChatMessage;
};
const ChatMessage = (props: IChatMessage) => {
  const { uid } = auth.currentUser!;
  const { deleteMessage } = useDeleteMessage();
  const { message } = props;

  return (
    <div className="pb-4">
      <p className="flex gap-4 items-center">
        {message.author.displayName ? (
          <span className="font-bold">{message.author.displayName}</span>
        ) : (
          <span className="font-bold italic text-slate-600">Anonymous</span>
        )}
        <span className="text-slate-400 text-sm">12:15 PM</span>
        {uid === message.author.uid ? (
          <button
            className="inline-block bg-red-400 px-2"
            onClick={() => deleteMessage(message.id)}
          >
            Delete
          </button>
        ) : null}
      </p>
      <p className={cx(message.metadata.hasPendingWrites && "opacity-50")}>
        {message.content}
      </p>
    </div>
  );
};

type IRoomListItem = {
  active?: boolean;
};
const RoomListItem = (props: IRoomListItem) => {
  return (
    <div
      className={cx(
        props.active && "bg-white bg-opacity-75",
        "font-semibold p-2 rounded-xl w-full"
      )}
    >
      Room Name
    </div>
  );
};
