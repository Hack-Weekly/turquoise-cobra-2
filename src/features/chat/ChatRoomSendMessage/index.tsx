import cx from "classnames";
import { Transforms } from "slate";
import { Slate, Editable, ReactEditor } from "slate-react";
import { useDecorate } from "./decorate";
import { insertMention, useMention } from "./useMention";

import "prismjs";
import "prismjs/components/prism-markdown";
import { useEffect } from "react";

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

  return (
    <div className="border px-4 py-2 rounded-lg relative">
      <Slate editor={editor} value={initialValue} onChange={onChange}>
        <Editable
          className="w-full max-w-none"
          decorate={decorate}
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={onKeyDown}
        />
      </Slate>
      {target && usernames.length > 0 && (
        <div
          className={cx(
            "absolute left-0 right-0 bottom-[calc(100%+8px)] shadow-md border border-2 border-slate-200",
            "bg-white flex flex-col overflow-hidden w-full p-2 rounded-md"
          )}
        >
          {usernames.map((user, i) => (
            <div
              key={user.displayName}
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
              {user.displayName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
