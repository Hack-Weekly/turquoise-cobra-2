import { useState } from "react";
import data from "@emoji-mart/data";
import cx from "classnames";
import Picker from "@emoji-mart/react";
import { HiEmojiHappy } from "react-icons/hi";
import ClickAwayListener from "react-click-away-listener";
import { ReactEditor } from "slate-react";
import { Editor, Transforms } from "slate";

export const ChatEmoji = ({ editor }: { editor: ReactEditor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClickAway = () => {
    setIsOpen(false);
  };
  const onPickerShow = () => {
    setIsOpen(true);
  };
  const onEmojiSelect = (emoji: any) => {
    if (emoji && emoji.native) {
      Transforms.insertText(editor, emoji.native, {
        at: {
          anchor: Editor.end(editor, []),
          focus: Editor.end(editor, []),
        },
      });
    }
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <div>
        <button onClick={onPickerShow}>
          <HiEmojiHappy className="text-2xl" />
        </button>
        {isOpen && (
          <div
            className={cx(
              "absolute right-0 bottom-[calc(100%+8px)]",
              "p-2 flex flex-col overflow-hidden w-full max-w-[384px]"
            )}
          >
            <Picker theme="light" data={data} onEmojiSelect={onEmojiSelect} />
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default ChatEmoji;
