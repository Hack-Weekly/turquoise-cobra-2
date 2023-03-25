import { Descendant, Node, Text } from "slate";
import { DataChatMessage, DataUser } from "../service";
import { MentionElement } from "./useMention";

export const serialize = (
  value: Descendant[]
): Pick<DataChatMessage, "content" | "mentions"> => {
  const mentions: DataUser[] = [];
  const content = value
    .map((node) => {
      if (Text.isText(node)) {
        return node.text;
      } else {
        return node.children
          .map((node) => {
            if ("type" in node) {
              const customNode = node as MentionElement;
              switch (node.type) {
                case "mention":
                  mentions.push(customNode.user);
                  return `<@${customNode.user.id}>`;
              }
            }
            return Node.string(node);
          })
          .join("");
      }
    })
    .join("\n");

  return { content, mentions };
};
