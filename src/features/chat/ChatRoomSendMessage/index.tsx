import cx from "classnames";
import { Transforms } from "slate";
import { Slate, Editable, ReactEditor } from "slate-react";
import { useDecorate } from "./decorate";
import { insertMention, useMention } from "./useMention";

import "prismjs";
import "prismjs/components/prism-markdown";
import { useEffect } from "react";
import { ChatGIF } from "../ChatGIF";

const initialValue = [
  {
    type: "paragraph",
    children: [
      {
        text: "",
      },
    ],
  },
];

type IChatRoomSendMessage = {
  activeChannel: string;
  message?: string;
};
export const ChatRoomSendMessage = (props: IChatRoomSendMessage) => {
  const decorate = useDecorate();

  const {
    usernames,
    editor,
    index,
    setIndex,
    onChange,
    onKeyDown,
    target,
    setTarget,
    renderElement,
    renderLeaf,
  } = useMention(props.activeChannel);

  const { message } = props;
  useEffect(() => {
    if (message) {
      Transforms.insertText(editor, message);
    }
  }, [message]);

  if (props.activeChannel === "T415kos6wzfgjKDBpWe3") {
    return (
      <div className="border px-4 py-2 rounded-lg relative select-none cursor-not-allowed text-slate-400 tw-opacity-70 bg-slate-100">
        You do not have permission to send messages in this channel. Try the
        other ones!
      </div>
    );
  }

  return (
    <div className="border px-4 py-2 rounded-lg relative flex w-full">
      <Slate editor={editor} value={initialValue} onChange={onChange}>
        <Editable
          className="w-full max-w-none break-all"
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
        />
      </Slate>
      <ChatGIF activeChannel={props.activeChannel} />
      {target && usernames.length > 0 && (
        <div
          className={cx(
            "absolute left-0 right-0 bottom-[calc(100%+8px)] shadow-md border border-2 border-slate-200",
            "bg-white flex flex-col overflow-hidden w-full p-2 rounded-md"
          )}
        >
          {usernames.map((user, i) => (
            <div
              key={user.id}
              onClick={(e) => {
                e.preventDefault();
                Transforms.select(editor, target);
                insertMention(editor, user);
                setTarget(null);
                ReactEditor.focus(editor);
              }}
              onMouseOver={(e) => {
                e.preventDefault();
                setIndex(i);
              }}
              className={cx(
                i === index && "bg-turquoise-300",
                "text-left p-2 rounded-md overflow-hidden hover:cursor-pointer"
              )}
            >
              {user.displayName}{" "}
              <span className="text-slate-400 text-sm pl-4">
                #{user.id.substring(0, 6)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
