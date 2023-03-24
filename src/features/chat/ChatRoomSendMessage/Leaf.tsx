import cx from "classnames";
export const Leaf = ({ attributes, children, leaf }: any) => {
  const LeafElement = leaf["code-snippet"] ? "code" : "span";

  return (
    <LeafElement
      {...attributes}
      className={cx(
        leaf.bold && "font-bold",
        leaf.italic && "italic",
        leaf.underlined && "underlined",
        leaf.blockquote && "pl-2 italic border-0 border-l-4 inline-block",
        leaf["code-snippet"] && "font-mono bg-slate-200 rounded-sm"
      )}
    >
      {children}
    </LeafElement>
  );
};
export default Leaf;
