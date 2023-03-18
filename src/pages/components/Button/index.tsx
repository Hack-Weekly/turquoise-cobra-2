export type IButton = {
  type?: "button" | "submit" | "reset";
} & React.HTMLProps<HTMLButtonElement>;

export const Button = ({ children, ...props }: IButton) => {
  return (
    <button
      {...props}
      className="bg-turquoise-500 text-gunmetal-1000 px-4 py-3 rounded-md font-merriweatherBold transition-all duration-150 hover:bg-turquoise-800 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
};

export default Button;
