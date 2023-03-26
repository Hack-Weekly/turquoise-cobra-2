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
            <div className="max-w-[120px] truncate flex-1 font-semibold hover:bg-white/50 mx-1 p-2 py-4 rounded-lg">
              {auth.currentUser && (
                <Link
                  href={`/profile/${auth.currentUser.uid}`}
                  className="hover:underline"
                >
                  {auth.currentUser.displayName}
                </Link>
              )}
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
          {channel && channel.name === "Place" && (
            <div className="py-2 pt-4 text-lg">
              <p className="px-4 py-2 rounded-lg bg-turquoise-500">
                Place is a playground to draw! Use /place [number][letter]
                [color] to draw to that pixel.
                <p>(Like /place 1a red or /place 12K #ff00ff)</p>
              </p>
            </div>
          )}
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
          200
        );
      }

      if (scrollHeight <= scrollTop + offsetHeight + 350) {
        setTimeout(
          () => lastMessageRef.current?.scrollIntoView({ behavior: "smooth" }),
          200
        );
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
