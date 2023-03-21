import { MdSend } from "react-icons/md";

export const SkeletonLoader = () => {
  return (
    <main className="bg-turquoise-200 mx-auto h-screen flex">
      <aside className="flex flex-col w-[256px]">
        <div className="h-16 w-full"></div>
        <div className="flex flex-col flex-1 gap-4 p-4 w-full overflow-hidden">
          <div className="flex flex-1 flex-col overflow-y-scroll gap-2">
            <div className="bg-[#E5E4E2] bg-opacity-75 p-2 rounded-xl w-[200px] h-[40px] animate-pulse"></div>
            <div className="bg-[#E5E4E2] bg-opacity-75 p-2 rounded-xl w-[200px] h-[40px] animate-pulse"></div>
          </div>
          <div className="flex">
            <div className="bg-[#E5E4E2] w-[144px] h-[24px] mr-2 rounded-md animate-pulse"></div>
            <div className="bg-[#E5E4E2] w-[100px] h-[48px] rounded-md animate-pulse"></div>
          </div>
        </div>
      </aside>
      <section className="flex flex-auto flex-col items-stretch">
        <div className="h-16 p-4">
          <div className="h-[32px] w-[150px] bg-[#E5E4E2] rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="flex flex-auto flex-col bg-white rounded-3xl rounded-b-none overflow-hidden p-8 pt-0">
          <div className="flex flex-1 flex-col overflow-y-scroll">
            <div className="first:pt-8 pb-4">
              <div className="h-[40px] w-[140px] bg-[#E5E4E2] rounded-lg mb-7 animate-pulse"></div>
              <div className="h-[40px] w-[140px] bg-[#E5E4E2] rounded-lg mb-7 animate-pulse"></div>
              <div className="h-[40px] w-[140px] bg-[#E5E4E2] rounded-lg mb-7 animate-pulse"></div>
              <div className="h-[40px] w-[140px] bg-[#E5E4E2] rounded-lg mb-7 animate-pulse"></div>
              <div className="h-[40px] w-[140px] bg-[#E5E4E2] rounded-lg mb-7 animate-pulse"></div>
              <div className="h-[40px] w-[140px] bg-[#E5E4E2] rounded-lg mb-7 animate-pulse"></div>
              <div className="h-[40px] w-[140px] bg-[#E5E4E2] rounded-lg mb-7 animate-pulse"></div>
            </div>
          </div>
        <form className="flex">
          <input className="flex-auto px-4 py-2 border-2 rounded-xl"></input>
          <button className="p-4">
            <MdSend className="fill-[#E5E4E2]" />
          </button>
        </form>
        </div>
      </section>
    </main>   
  );
};

export default SkeletonLoader;