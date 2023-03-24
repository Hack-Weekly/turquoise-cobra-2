import { useCallback, useState } from "react";
import { Editor, Transforms, Range, createEditor } from "slate";
import { ReactEditor, withReact } from "slate-react";
import { jsx } from "slate-hyperscript";
import { EditableProps } from "slate-react/dist/components/editable";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { DataUser, useAutocompleteUsername, useSendMessage } from "../service";
import { serialize } from "./chatSerializer";

export type MentionElement = {
  type: "mention";
  user: DataUser;
  children: [{ text: string }];
};

export const insertMention = (editor: any, user: DataUser) => {
  const mention: MentionElement = {
    type: "mention",
    user: user,
    children: [{ text: `@${user.displayName}` }],
  };
  Transforms.insertNodes(editor, mention);
  Transforms.move(editor);
  Editor.insertText(editor, " ");
};

export const useMention = (activeChannel: string) => {
  const { sendMessage } = useSendMessage(activeChannel);
  const { usernames, fetchUsernames } = useAutocompleteUsername();

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
        fetchUsernames("", beforeMatch[1]);
        setTarget(beforeRange);
        setSearch(beforeMatch[1]);
        setIndex(0);
        return;
      } else if (charBeforeText === "@" && afterMatch) {
        fetchUsernames("", "");
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
      if (target && usernames.length > 0) {
        switch (event.key) {
          case "ArrowDown":
            event.preventDefault();
            const prevIndex = index >= usernames.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          case "ArrowUp":
            event.preventDefault();
            const nextIndex = index <= 0 ? usernames.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          case "Tab":
          case "Enter":
            event.preventDefault();
            Transforms.select(editor, target);
            insertMention(editor, usernames[index]);
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
            sendMessage(editor.children);
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
    [usernames, editor, index, target]
  );

  const onPaste = useCallback<NonNullable<EditableProps["onPaste"]>>(
    (event) => {
      event.preventDefault();
    },
    []
  );

  return {
    usernames,
    editor,
    index,
    setIndex,
    onChange,
    onKeyDown,
    onPaste,
    target,
    setTarget,
    renderElement,
    renderLeaf,
  };
};

const withMentions = (editor: ReactEditor) => {
  const { isInline, isVoid, insertData, markableVoid } = editor;

  editor.isInline = (element: any) => {
    return element.type === "mention" ? true : isInline(element);
  };

  editor.isVoid = (element: any) => {
    return element.type === "mention" ? true : isVoid(element);
  };

  editor.markableVoid = (element: any) => {
    return element.type === "mention" || markableVoid(element);
  };

  editor.insertData = (data) => {
    const html = data.getData("text/html");

    if (html) {
      const parsed = new DOMParser().parseFromString(html, "text/html");
      const fragments = deserialize(parsed.body);
      Transforms.insertFragment(editor, fragments);
      return;
    }

    const plain = data.getData("text/plain");

    if (plain) {
      const text = (plain || "").replace(/\t/g, "");
      const splitText = text.split(/\r?\n/);
      for (let line of splitText) {
        Transforms.insertText(editor, line);
        Transforms.insertText(editor, "\n");
      }
      return;
    }

    insertData(data);
  };

  return editor;
};

const ELEMENT_TAGS = {
  A: (el: HTMLElement) => ({ type: "link", url: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "blockquote" }),
  IMG: (el: HTMLElement) => ({ type: "image", url: el.getAttribute("src") }),
  P: () => ({ type: "paragraph" }),
  PRE: () => ({ type: "code" }),
};

const deserialize = (el: HTMLElement | ChildNode): any => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const nodeName = el.nodeName;
  let parent: HTMLElement | ChildNode = el;

  if (
    nodeName === "PRE" &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === "CODE"
  ) {
    parent = el.childNodes[0];
  }
  let children = Array.from(parent.childNodes).map(deserialize).flat();

  if (children.length === 0) {
    children = [{ text: "" }];
  }

  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (nodeName in ELEMENT_TAGS) {
    const attrs = ELEMENT_TAGS[nodeName as keyof typeof ELEMENT_TAGS](
      el as HTMLElement
    );
    return jsx("element", attrs, children);
  }

  return children;
};
