import { useEffect, useState, Fragment, useMemo } from "react";
import cx from "classnames";
import Image from "next/image";
import { SnapshotMetadata } from "firebase/firestore";
import type { ASTNode, SingleASTNode } from "simple-markdown";
import { ErrorBoundary } from "react-error-boundary";
import { parse } from "./parse";
import {
  DataChatMessage,
  DataChatMessageEmbedMonster,
  DataChatMessageEmbedMonsterList,
  DataChatMessageEmbedPlace,
  DataChatMessageGifv,
  DataUser,
  useDeleteMessage,
} from "../service";
import { auth } from "../../../../lib/firebase.config";
import { decompressFromUTF16 } from "lz-string";

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
  const [mentionsUser, setMentionsUsers] = useState(false);

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
          if (mention.id === uid) {
            setMentionsUsers(true);
          }
        }
      }
    };
    aux();
  }, [message, setNodes, setMentionsUsers, uid]);

  const embedType =
    message.embeds && message.embeds.length > 0 && message.embeds[0].type;

  return (
    <div className={"first:pt-8 pb-4"}>
      <div
        className={cx(
          mentionsUser && "bg-yellow-100/25 border-l-4 border-yellow-300",
          "flex gap-4"
        )}
      >
        <div className="w-2 h-10 rounded mt-1" />
        <div className="flex flex-col">
          <p className="flex 4 items-center gap-2">
            {"id" in message.author && message.author.id.length === 0 && (
              <span
                className={cx(
                  "text-sm font-bold bg-turquoise-500 rounded-lg px-1"
                )}
              >
                BOT
              </span>
            )}
            {message.author.displayName ? (
              <span className={cx("font-bold truncate max-w-[256px]")}>
                {message.author.displayName}
              </span>
            ) : (
              <span className="font-bold italic text-slate-600">Anonymous</span>
            )}
            <span className="text-slate-400 text-sm pl-4">
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
          <ErrorBoundary
            fallback={
              <div className="bg-red-200 p-2 rounded-md">
                Error: We couldn't render the message! (Please report to the
                devs!)
              </div>
            }
          >
            <div>
              {embedType === "gifv" && (
                <img
                  src={
                    (message.embeds[0] as DataChatMessageGifv).thumbnail!.url
                  }
                />
              )}
              {(!embedType ||
                embedType === "place" ||
                embedType === "monster:spawn" ||
                embedType === "monster:list") &&
                nodes && <DiscordNodes nodes={nodes} users={users} />}
              {embedType === "place" && (
                <EmbedPlace
                  grid={(message.embeds[0] as DataChatMessageEmbedPlace).grid}
                />
              )}
              {embedType === "monster:list" && (
                <EmbedMonsterList
                  paths={
                    (message.embeds[0] as DataChatMessageEmbedMonsterList)
                      .monsters
                  }
                />
              )}
              {embedType === "monster:spawn" && (
                <EmbedMonster
                  path={
                    (message.embeds[0] as DataChatMessageEmbedMonster).monster
                      .url
                  }
                />
              )}
            </div>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

const EmbedMonster = ({ path }: { path: string }) => {
  return (
    <div>
      <Image width={128} height={128} src={path} alt="monster image" />
      <p className="text-sm text-neutral-400 italic">
        Includes Guardian Monsters Artwork by Georg Eckert / lucidtanooki
      </p>
    </div>
  );
};

const EmbedMonsterList = ({ paths = [] }: { paths: string[] }) => {
  return (
    <div>
      <div className="flex">
        {paths.map((path, i) => (
          <Image
            className="block"
            key={i}
            width={32}
            height={32}
            src={path}
            alt="monster image"
          />
        ))}
      </div>
      <p className="text-sm text-neutral-400 italic">
        Includes Guardian Monsters Artwork by Georg Eckert / lucidtanooki
      </p>
    </div>
  );
};

const topRow = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");

const EmbedPlace = ({ grid }: { grid: string }) => {
  const imgSrc = useMemo<string | null>(() => {
    // create off-screen canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const data = JSON.parse(decompressFromUTF16(grid));

      canvas.width = 250;
      canvas.height = 250;
      for (var y = 0; y < 25; y++) {
        for (var x = 0; x < 25; x++) {
          ctx.strokeStyle = "#dddddd";
          ctx.lineWidth = 0.5;
          ctx.fillStyle = data[y][x];
          ctx.strokeRect(x * 10, y * 10, 10, 10);
          ctx.fillRect(x * 10, y * 10, 10, 10);
        }
      }
      for (var y = 0; y < 5; y++) {
        ctx.beginPath();
        ctx.strokeStyle = "#aaaaaa";
        ctx.lineTo(0, y * 50);
        ctx.lineTo(250, y * 50);
        ctx.stroke();
      }
      for (var x = 0; x < 5; x++) {
        ctx.beginPath();
        ctx.strokeStyle = "#aaaaaa";
        ctx.lineTo(x * 50, 0);
        ctx.lineTo(x * 50, 250);
        ctx.stroke();
      }

      return canvas.toDataURL("string");
    }
    return null;
  }, [grid]);

  if (imgSrc) {
    return (
      <div className="relative">
        <div className="flex justify-between w-[250px] relative">
          <div className="w-full h-[12px]"></div>
          {topRow.map((c, i) => (
            <div
              key={i}
              className="absolute font-bold text-[8px] text-center"
              style={{ left: 10 * i + 2 }}
            >
              {c}
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-between h-[250px] absolute -left-[12px]">
          {topRow.map((_c, i) => (
            <div
              key={i}
              className="absolute text-[8px] font-bold h-[6px] leading-3 text-center"
              style={{ top: 10 * i }}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <img src={imgSrc} />
      </div>
    );
  }
  return <div></div>;
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
