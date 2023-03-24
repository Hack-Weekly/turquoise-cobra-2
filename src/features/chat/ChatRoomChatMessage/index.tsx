import { useEffect, useState, Fragment } from "react";
import { SnapshotMetadata } from "firebase/firestore";
import type { ASTNode, SingleASTNode } from "simple-markdown";
import { parse } from "discord-markdown-parser";
import { DataChatMessage, useDeleteMessage } from "../service";
import { auth } from "../../../../lib/firebase.config";

export type IChatRoomChatMessage = {
  message: DataChatMessage;
  metadata: SnapshotMetadata;
};
export const ChatRoomChatMessage = (props: IChatRoomChatMessage) => {
  const { uid } = auth.currentUser!;
  const { deleteMessage } = useDeleteMessage();
  const { message } = props;
  const [nodes, setNodes] = useState<SimpleMarkdown.SingleASTNode[]>();

  useEffect(() => {
    const aux = async () => {
      const parsed = parse(message.content, "normal");
      setNodes(parsed);
    };
    aux();
  }, [message, setNodes]);

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
      {nodes && <DiscordNodes nodes={nodes} />}
    </div>
  );
};

const DiscordNodes = ({ nodes }: { nodes: ASTNode }) => {
  return (
    <Fragment>
      {Array.isArray(nodes) ? (
        nodes.map((node, i) => <DiscordASTNode key={i} node={node} />)
      ) : (
        <DiscordASTNode node={nodes} />
      )}
    </Fragment>
  );
};

const DiscordASTNode = ({ node }: { node: SingleASTNode }) => {
  if (!node) return null;

  const type = node.type;

  switch (type) {
    case "text":
      return node.content;

    case "link":
      return (
        <a href={node.target}>
          <DiscordNodes nodes={node.content} />
        </a>
      );

    case "url":
    case "autolink":
      return (
        <a href={node.target} target="_blank" rel="noreferrer">
          <DiscordNodes nodes={node.content} />
        </a>
      );

    case "blockQuote":
      return (
        <blockquote className="border-0 border-l-4 pl-2 border-slate-300">
          <DiscordNodes nodes={node.content} />
        </blockquote>
      );

    case "br":
    case "newline":
      return <br />;

    case "channel":
    case "role":
    case "user": {
      const id = node.id as string;
      return <div>{id}</div>;
    }

    case "here":
    case "everyone": {
      const id = node.id as string;
      return <div>{id}</div>;
    }

    case "codeBlock":
    case "inlineCode":
      return (
        <code>
          <DiscordNodes nodes={node.content} />
        </code>
      );

    case "em":
      return (
        <em>
          <DiscordNodes nodes={node.content} />
        </em>
      );

    case "strong":
      return (
        <strong>
          <DiscordNodes nodes={node.content} />
        </strong>
      );

    case "underline":
      return (
        <u>
          <DiscordNodes nodes={node.content} />
        </u>
      );

    case "strikethrough":
      return (
        <s>
          <DiscordNodes nodes={node.content} />
        </s>
      );

    case "emoticon":
      return typeof node.content === "string" ? (
        node.content
      ) : (
        <DiscordNodes nodes={node.content} />
      );

    case "spoiler":
      return (
        <span className="bg-slate-200">
          <DiscordNodes nodes={node.content} />
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
      return isString ? node.content : <DiscordNodes nodes={node.content} />;
    }
  }
};

export default ChatRoomChatMessage;
