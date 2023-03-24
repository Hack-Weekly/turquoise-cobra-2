import { Descendant, Node, Text } from "slate";

export const serialize = (value: Descendant[]) => {
  return value
    .map((node) => {
      if (Text.isText(node)) {
        return node.text;
      } else {
        return node.children
          .map((node) => {
            if ("type" in node) {
              const customNode = node as any;
              switch (node.type) {
                case "mention":
                  return `<@${customNode.character}>`;
              }
            }
            return Node.string(node);
          })
          .join("");
      }
    })
    .join("\n");
};
