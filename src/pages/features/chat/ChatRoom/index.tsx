import { useState } from "react";
import { MdSend } from "react-icons/md";

export type IChatRoom = {
  roomId: number;
  author: {
    id: number;
    name: string;
  };
};

export const ChatRoom = (props: IChatRoom) => {
  const [message, setMessage] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = new Date();
    if (message) {
      const messageData = {
        content: message,
        roomID: props.roomId,
        author: {
          id: props.author.id,
          name: props.author.name,
        },
        timestamp: d.getTime(),
      };
      //send to backend here, for now just console log
      setMessage("");
    }
  };

  return (
    <main className="bg-turquoise-200 mx-auto h-screen flex">
      <aside className="flex w-[256px]">
        <ol>
          <RoomListItem />
          <RoomListItem />
          <RoomListItem />
          <RoomListItem />
        </ol>
      </aside>
      <section className="flex flex-auto flex-col iNametems-stretch bg-white">
        <div className="flex flex-auto flex-col">
          <ChatMessage />
          <ChatMessage />
          <ChatMessage />
          <ChatMessage />
        </div>
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
          <button
            className="text-teal-600 hover:text-teal-800 p-4"
            type="submit"
          >
            <MdSend />
          </button>
        </form>
      </section>
    </main>
  );
};

const ChatMessage = () => {
  return <p className="p-4">Hi</p>;
};

const RoomListItem = () => {
  return <li className="p-4">Room Name</li>;
};
