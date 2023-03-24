import cx from "classnames";
export const Leaf = ({ attributes, children, leaf }: any) => {
  const LeafElement = leaf["inlineCode"] ? "code" : "span";

  return (
    <LeafElement
      {...attributes}
      className={cx(
        leaf.strong && "font-bold",
        leaf.em && "italic",
        leaf.strikethrough && "line-through",
        leaf.underline && "underline",
        leaf.blockquote && "pl-2 italic border-0 border-l-4 inline-block",
        leaf.spoiler && "bg-slate-200",
        leaf["inlineCode"] && "font-mono bg-slate-200 rounded-sm"
      )}
    >
      {children}
    </LeafElement>
  );
};
export default Leaf;
