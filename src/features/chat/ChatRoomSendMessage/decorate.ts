import Prism from "prismjs";
import { Token } from "prismjs";
import { NodeEntry, Text } from "slate";
import { useCallback } from "react";

export const useDecorate = () => {
  return useCallback(([node, path]: NodeEntry) => {
    const ranges: any[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = (token: string | Token) => {
      if (typeof token === "string") {
        return token.length;
      } else if (typeof token.content === "string") {
        return token.content.length;
      } else {
        return (token.content as (string | Token)[]).reduce(
          (l, t): number => l + getLength(t),
          0
        );
      }
    };

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;
      const validTypes = [
        "bold",
        "italic",
        "underlined",
        "blockquote",
        "code-snippet",
      ];

      if (typeof token !== "string" && validTypes.indexOf(token.type) !== -1) {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }

      start = end;
    }

    return ranges;
  }, []);
};
