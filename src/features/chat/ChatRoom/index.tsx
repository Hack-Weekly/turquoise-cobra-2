import { useState } from "react";
import { useRouter } from "next/router";
import cx from "classnames";
import { signOut } from "firebase/auth";
import { SnapshotMetadata } from "firebase/firestore";
import {
  DataChatMessage,
  useDeleteMessage,
  useMessages,
  useSendMessage,
} from "../service";
import { auth } from "../../../../lib/firebase.config";
import ChannelList from "../ChannelList";

import Button from "@/components/Button";
import { MdSend } from "react-icons/md";
import ProfilePage from "@/pages/profile/[profileId]";
import Link from "next/link";

export type IChatRoom = {
  roomId: number;
  author: {
    id: number;
    name: string;
  };
};

export const ChatRoom = (props: IChatRoom) => {
  const router = useRouter();
  const activeChannel =
    (router.query.channelId as string) ?? "T415kos6wzfgjKDBpWe3";

  const [messages, loading, error] = useMessages(activeChannel);

  return (
    <main className="bg-turquoise-200 mx-auto h-screen flex">
      <aside className="flex flex-col w-[256px]">
        <div className="h-16 w-full"></div>
        <div className="flex flex-col flex-1 gap-4 p-4 w-full overflow-hidden">
          <ChannelList
            activeChannel={activeChannel}
            className="flex flex-1 flex-col overflow-y-scroll"
          />
          <div className="flex">
            <div className="flex-1 font-semibold">
              <Link href={`/profile/${auth.currentUser.uid}`} className="hover:underline">{auth.currentUser!.displayName}</Link>
            </div>
            <Button onClick={() => signOut(auth)}>Logout</Button>
          </div>
        </div>
      </aside>
      <section className="flex flex-auto flex-col items-stretch">
        <div className="h-16 p-4">
          <h1 className="font-bold text-2xl text-center">Room Name</h1>
        </div>
        <div className="flex flex-auto flex-col bg-white rounded-3xl rounded-b-none overflow-hidden p-8 pt-0">
          <div className="flex flex-1 flex-col overflow-y-scroll">
            {messages?.docs.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.data()}
                metadata={message.metadata}
              />
            ))}
          </div>
          <SendChatMessage activeChannel={activeChannel} />
        </div>
      </section>
    </main>
  );
};

type ISendChatMessage = {
  activeChannel: string;
};
const SendChatMessage = (props: ISendChatMessage) => {
  const { sendMessage } = useSendMessage(props.activeChannel);

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
    <form className="flex" onSubmit={handleSubmit}>
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
  metadata: SnapshotMetadata;
};
const ChatMessage = (props: IChatMessage) => {
  const { uid } = auth.currentUser!;
  const { deleteMessage } = useDeleteMessage();
  const { message } = props;

  return (
    <div className="first:pt-8 pb-4">
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
      <p className={cx(props.metadata.hasPendingWrites && "opacity-50")}>
        {message.content}
      </p>
    </div>
  );
};
