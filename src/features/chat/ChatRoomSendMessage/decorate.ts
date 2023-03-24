import type { SingleASTNode } from "simple-markdown";
import { NodeEntry, Range, Text } from "slate";
import { useCallback } from "react";
import { parse } from "discord-markdown-parser";

export const useDecorate = () => {
  return useCallback(([node, path]: NodeEntry) => {
    const ranges: Range[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const parsed = parse(node.text, "normal");

    const parseNode = (token: SingleASTNode, start: number) => {
      let length = 0;
      let contentLength = 0;
      const tokenType = token.type;

      switch (tokenType) {
        case "strong":
          length += 4;
          break;
        case "em":
          length += 2;
          break;
        case "strikethrough":
          length += 4;
          break;
        case "underline":
          length += 4;
          break;
        case "spoiler":
          length += 4;
          break;
        case "inlineCode":
          length += 2;
          break;
      }

      if (token.type === "br") {
        contentLength = 1;
      } else if (!("content" in token)) {
        contentLength = 0;
      } else if (typeof token.content === "string") {
        // don't count newlines
        contentLength = token.content.replace(/(\r\n|\n|\r)/g, "").length;
      } else {
        contentLength = (token.content as SingleASTNode[]).reduce(
          (l, t): number => {
            return l + parseNode(t, start + length / 2 + l);
          },
          0
        );
      }

      length += contentLength;
      let end = start + length;
      if (tokenType !== "text") {
        ranges.push({
          [tokenType]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }
      return length;
    };

    parseNode({ content: parsed, type: "" }, 0);

    return ranges;
  }, []);
};
