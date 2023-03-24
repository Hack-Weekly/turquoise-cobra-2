import { useCallback, useState } from "react";
import { Editor, Transforms, Range, createEditor } from "slate";
import { ReactEditor, withReact } from "slate-react";
import { EditableProps } from "slate-react/dist/components/editable";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { useSendMessage } from "../service";
import { deserialize, serialize } from "./chatSerializer";

export type MentionElement = {
  type: "mention";
  character: string;
  children: [{ text: string }];
};

const CHARACTERS = ["AMEA", "AMEB", "BMEA", "BMEB"];

export const insertMention = (editor: any, character: string) => {
  const mention: MentionElement = {
    type: "mention",
    character,
    children: [{ text: `@${character}` }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
  Editor.insertText(editor, " ");
};

export const useMention = (activeChannel: string) => {
  const { sendMessage } = useSendMessage(activeChannel);

  const [editor] = useState<ReactEditor>(() =>
    withMentions(withReact(createEditor()))
  );

  const [target, setTarget] = useState<Range | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState("");

  const renderElement = useCallback<
    NonNullable<EditableProps["renderElement"]>
  >((props) => <Element {...props} />, []);
  const renderLeaf: NonNullable<EditableProps["renderLeaf"]> = useCallback(
    (props) => <Leaf {...props} />,
    []
  );

  const chars = CHARACTERS.filter((c) =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 10);

  const onChange = () => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection);

      const wordBefore = Editor.before(editor, start, { unit: "word" });
      const before = wordBefore && Editor.before(editor, wordBefore);
      const beforeRange = before && Editor.range(editor, before, start);

      const beforeText = beforeRange && Editor.string(editor, beforeRange);
      const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);

      const charBeforeText = Editor.string(editor, {
        ...selection,
        anchor: {
          ...selection.anchor,
          offset: selection.anchor.offset - 1,
        },
      });

      const after = Editor.after(editor, start);
      const afterRange = Editor.range(editor, start, after);
      const afterText = Editor.string(editor, afterRange);
      const afterMatch = afterText.match(/^(\s|$)/);

      if (beforeMatch && afterMatch) {
        setTarget(beforeRange);
        setSearch(beforeMatch[1]);
        setIndex(0);
        return;
      } else if (charBeforeText === "@" && afterMatch) {
        // when word is empty
        setTarget({
          ...afterRange,
          anchor: {
            ...afterRange.anchor,
            offset: afterRange.anchor.offset - 1,
          },
        });
        setSearch("");
        setIndex(0);
        return;
      }
    }

    setTarget(null);
  };

  const onKeyDown = useCallback<NonNullable<EditableProps["onKeyDown"]>>(
    (event) => {
      if (target && chars.length > 0) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            const prevIndex = index >= chars.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          case "ArrowUp":
            event.preventDefault();
            const nextIndex = index <= 0 ? chars.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          case "Tab":
          case "Enter":
            event.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, chars[index]);
            insertMention;
            setTarget(null);
            break;
          case "Escape":
            event.preventDefault();
            setTarget(null);
            break;
        }
      } else {
        if (event.key === "Enter") {
          if (event.shiftKey) {
            // create newline on shift+enter
          } else {
            event.preventDefault();
            const serialized = serialize(editor.children);
            sendMessage(serialized);
            // replace entire content to empty/delete
            Transforms.delete(editor, {
              at: {
                anchor: Editor.start(editor, []),
                focus: Editor.end(editor, []),
              },
            });
          }
        }
      }
    },
    [chars, editor, index, target]
  );

  return {
    chars,
    editor,
    index,
    setIndex,
    onChange,
    onKeyDown,
    target,
    setTarget,
    renderElement,
    renderLeaf,
  };
};

const withMentions = (editor: ReactEditor) => {
  const { isInline, isVoid, markableVoid } = editor;

  editor.isInline = (element: any) => {
    return element.type === "mention" ? true : isInline(element);
  };

  editor.isVoid = (element: any) => {
    return element.type === "mention" ? true : isVoid(element);
  };

  editor.markableVoid = (element: any) => {
    return element.type === "mention" || markableVoid(element);
  };

  return editor;
};
