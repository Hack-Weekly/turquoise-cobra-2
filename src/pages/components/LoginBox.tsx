export default function LoginBox() {
  const handleSubmit = async (e: React.SyntheticEvent) => {
    // Stop the form from submitting and refreshing the page.
    e.preventDefault();
    console.log("Debug Message");
  };

  return (
    <div className="min-h-fit h-screen flex justify-center items-center">
      <div
        id="loginContainer"
        className="bg-gradient-to-b from-white to-[#f0fbf8] flex flex-col space-y-8 px-8 py-14 rounded-3xl font-merriweatherRegular"
      >
        <div className="flex flex-col justify-center items-center gap-2">
          <h2 className="text-3xl text-gunmetal-1000 font-calistoga">
            Welcome to TurqChat
          </h2>
          <h3 className="font-merriweatherRegular text-gunmetal-600">
            Enter your details below
          </h3>
        </div>

        {/* <form
          id="loginForm"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <input
            type="text"
            id="username"
            placeholder="Username"
            className="p-[20px] rounded-md border-2 active:border-dashed"
          />
          <span className="flex flex-col items-center">
            <button
              type="submit"
              className="w-2/4 bg-turquoise-500 text-gunmetal-1000 px-1 py-3 rounded-md font-merriweatherBold transition-all duration-150 hover:bg-turquoise-800"
            >
              Get Started
            </button>
          </span>
        </form> */}
        <div className="space-y-10">
          <div className="w-full flex justify-center">
            <button className="shadow-xl bg-blue-300 h-12 px-2 rounded-lg">
              Sign to Google
            </button>
          </div>
          <div className="w-full flex justify-center">
            <button className="shadow-xl bg-blue-300 h-12 px-2 rounded-lg">
              Anonymous
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
