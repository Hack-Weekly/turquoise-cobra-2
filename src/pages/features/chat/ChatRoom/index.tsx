import { useState } from "react";

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
        <form onSubmit={handleSubmit}>
          <input
            className="w-full"
            type="text"
            id="new-message"
            name="message"
            placeholder="Type your message here"
            value={message}
            onChange={handleChange}
          />
          <button type="submit">Enter</button>
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
