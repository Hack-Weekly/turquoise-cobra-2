import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
import { useChannel } from "../service";

import Button from "@/components/Button";
import { ChatRoomSendMessage } from "../ChatRoomSendMessage";
import ChatRoomChatMessage from "../ChatRoomChatMessage";
import { MdSend } from "react-icons/md";
import ProfilePage from "@/pages/profile/[profileId]";
import Link from "next/link";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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

  //determine the current channel's name and send it to the h1 element
  const [channel, channelsLoading, channelsError] = useChannel(activeChannel);

  return (
    <main className="bg-turquoise-200 mx-auto h-screen flex items-stretch">
      <aside className="flex flex-col w-[256px] flex-initial shrink-0">
        <div className="h-16 w-full"></div>
        <div className="flex flex-col flex-1 gap-4 p-4 w-full overflow-hidden">
          <ChannelList
            activeChannel={activeChannel}
            className="flex flex-1 flex-col overflow-y-scroll"
          />
          <div className="flex">
            <div className="flex-1 font-semibold">
              <Link
                href={`/profile/${auth.currentUser!.uid}`}
                className="hover:underline"
              >
                {auth.currentUser!.displayName}
              </Link>
            </div>
            <Button onClick={() => signOut(auth)}>Logout</Button>
          </div>
        </div>
      </aside>
      <section className="flex flex-auto flex-col items-stretch">
        <div className="h-16 p-4">
          <h1 className="font-bold text-2xl text-center">
            {channel ? channel.name : <Skeleton width={150} />}
          </h1>
        </div>
        <div className="flex flex-auto flex-col bg-white rounded-3xl rounded-b-none overflow-hidden p-8 pt-0">
          <ChatMessages activeChannel={activeChannel} />
          <ChatRoomSendMessage activeChannel={activeChannel} />
        </div>
      </section>
    </main>
  );
};

const ChatMessages = ({ activeChannel }: { activeChannel: string }) => {
  const [messages, loading, error] = useMessages(activeChannel);

  const lastMessageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesLenRef = useRef<number>(0);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const { offsetHeight, scrollHeight, scrollTop } = containerRef.current;

      if (messagesLenRef.current === 0 && messages) {
        // XXX: This is the only way I could make it scroll to bottom on mount
        setTimeout(
          () => lastMessageRef.current?.scrollIntoView({ behavior: "smooth" }),
          100
        );
      }

      if (scrollHeight <= scrollTop + offsetHeight + 100) {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
      }

      messagesLenRef.current = messages ? messages.docs.length : 0;
    }
  }, [messages?.docs, messagesLenRef]);

  return (
    <div
      className="flex grow flex-col overflow-y-scroll h-2"
      ref={containerRef}
    >
      {messages &&
        reverseMap(messages?.docs, (message) => (
          <ChatRoomChatMessage
            key={message.id}
            message={message.data()}
            metadata={message.metadata}
          />
        ))}
      <div
        ref={lastMessageRef}
        className="w-full opacity-0 h-2 relative bottom-4"
      ></div>
    </div>
  );
};

function reverseMap<T, O>(arg: T[], fn: (a: T) => O) {
  return arg.map((_, i, arr) => fn(arr[arr.length - i - 1]));
}
