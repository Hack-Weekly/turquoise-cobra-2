import SimpleMarkdown from "simple-markdown";
import { rules } from "discord-markdown-parser";

// we have a custom rule for user based on firebase id
const FirebaseMentionRegex = /^<@!?([a-zA-Z0-9_-]{28,36})>/;
const userRule: SimpleMarkdown.ParserRule = {
  order: SimpleMarkdown.defaultRules.strong.order,
  match: (source) => FirebaseMentionRegex.exec(source),
  parse: function (capture) {
    return {
      id: capture[1],
      type: "user",
    };
  },
};
const customRules = {
  ...rules,
  user: userRule,
};
export const rulesExtended = {
  ...customRules,
  link: SimpleMarkdown.defaultRules.link,
};

const parser = SimpleMarkdown.parserFor(customRules);
const parserExtended = SimpleMarkdown.parserFor(rulesExtended);

// parse function
export function parse(input: string, type: "normal" | "extended" = "normal") {
  if (type === "normal") return parser(input, { inline: true });
  else return parserExtended(input, { inline: true });
}
