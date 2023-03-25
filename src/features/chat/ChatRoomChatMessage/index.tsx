import { useEffect, useState, Fragment } from "react";
import { SnapshotMetadata } from "firebase/firestore";
import type { ASTNode, SingleASTNode } from "simple-markdown";
import { parse } from "./parse";
import { DataChatMessage, DataUser, useDeleteMessage } from "../service";
import { auth } from "../../../../lib/firebase.config";

export type IChatRoomChatMessage = {
  message: DataChatMessage;
  metadata: SnapshotMetadata;
};

type Users = {
  [id: string]: DataUser;
};
export const ChatRoomChatMessage = (props: IChatRoomChatMessage) => {
  const uid = auth.currentUser?.uid ?? 0;
  const { deleteMessage } = useDeleteMessage();
  const { message } = props;
  const [nodes, setNodes] = useState<SimpleMarkdown.SingleASTNode[]>();
  const [users, setUsers] = useState<Users>({});

  useEffect(() => {
    const aux = async () => {
      const parsed = parse(message.content, "normal");
      setNodes(parsed);
      if (message.mentions) {
        for (let mention of message.mentions) {
          setUsers((users) => ({
            ...users,
            [mention.id]: mention,
          }));
        }
      }
    };
    aux();
  }, [message, setNodes]);

  return (
    <div className="first:pt-8 pb-4">
      <p className="flex gap-4 items-center">
        {message.author.displayName ? (
          <span className="font-bold truncate max-w-[256px]">
            {message.author.displayName}
          </span>
        ) : (
          <span className="font-bold italic text-slate-600">Anonymous</span>
        )}
        <span className="text-slate-400 text-sm">
          {message.createdAt.toLocaleTimeString()}
        </span>
        {uid === message.author.id ? (
          <button
            className="inline-block bg-red-400 px-2"
            onClick={() => deleteMessage(message.id)}
          >
            Delete
          </button>
        ) : null}
      </p>
      {message.embeds && message.embeds.length > 0 ? (
        <img src={message.embeds[0].thumbnail.url} />
      ) : (
        nodes && <DiscordNodes nodes={nodes} users={users} />
      )}
    </div>
  );
};

const DiscordNodes = ({ nodes, users }: { nodes: ASTNode; users: Users }) => {
  return (
    <Fragment>
      {Array.isArray(nodes) ? (
        nodes.map((node, i) => (
          <DiscordASTNode key={i} node={node} users={users} />
        ))
      ) : (
        <DiscordASTNode node={nodes} users={users} />
      )}
    </Fragment>
  );
};

const DiscordASTNode = ({
  node,
  users,
}: {
  node: SingleASTNode;
  users: Users;
}) => {
  if (!node) return null;

  const type = node.type;

  switch (type) {
    case "text":
      return node.content;

    case "link":
      return (
        <a href={node.target}>
          <DiscordNodes nodes={node.content} users={users} />
        </a>
      );

    case "url":
    case "autolink":
      return (
        <a href={node.target} target="_blank" rel="noreferrer">
          <DiscordNodes nodes={node.content} users={users} />
        </a>
      );

    case "blockQuote":
      return (
        <blockquote className="border-0 border-l-4 pl-2 border-slate-300">
          <DiscordNodes nodes={node.content} users={users} />
        </blockquote>
      );

    case "br":
    case "newline":
      return <br />;

    case "channel":
    case "role":
    case "user": {
      const id = node.id as string;
      const name = users[id]?.displayName ?? id;
      return (
        <span className="bg-turquoise-200 px-1 inline-block rounded-md">
          @{name}
        </span>
      );
    }

    case "here":
    case "everyone": {
      const id = node.id as string;
      return <div>{id}</div>;
    }

    case "codeBlock":
    case "inlineCode":
      return <code>{node.content}</code>;

    case "em":
      return (
        <em>
          <DiscordNodes nodes={node.content} users={users} />
        </em>
      );

    case "strong":
      return (
        <strong>
          <DiscordNodes nodes={node.content} users={users} />
        </strong>
      );

    case "underline":
      return (
        <u>
          <DiscordNodes nodes={node.content} users={users} />
        </u>
      );

    case "strikethrough":
      return (
        <s>
          <DiscordNodes nodes={node.content} users={users} />
        </s>
      );

    case "emoticon":
      return typeof node.content === "string" ? (
        node.content
      ) : (
        <DiscordNodes nodes={node.content} users={users} />
      );

    case "spoiler":
      return (
        <span className="bg-slate-200 text-black text-opacity-0 hover:text-opacity-100 p-0.5 rounded-md">
          <DiscordNodes nodes={node.content} users={users} />
        </span>
      );

    case "emoji":
    case "twemoji":
      return <span>{node.name}</span>;

    case "timestamp":
    default: {
      const isString = typeof node.content === "string";
      if (!isString) {
        console.debug(`Unknown node type: ${type}`, node);
      }
      return isString ? (
        node.content
      ) : (
        <DiscordNodes nodes={node.content} users={users} />
      );
    }
  }
};

export default ChatRoomChatMessage;
