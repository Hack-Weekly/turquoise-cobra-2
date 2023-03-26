import { Fragment, useCallback, useMemo, useState } from "react";
import ClickAwayListener from "react-click-away-listener";
import debounce from "lodash.debounce";
import cx from "classnames";
import { useSendMessage } from "../service";
import { HiGif } from "react-icons/hi2";

type SearchResult = {
  next: string;
  results: Gif[];
};
type GifFormat =
  | "gif"
  | "mediumgif"
  | "tinygif"
  | "nanogif"
  | "mp4"
  | "loopedmp4"
  | "tinymp4"
  | "nanomp4"
  | "webm"
  | "tinywebm"
  | "nanowebm";
type Gif = {
  id: string;
  media_formats: { [format in GifFormat]: Media };
  url: string;
};
type Media = {
  preview: string;
  url: string;
  dims: number[];
  size: number;
};

export type IChatGIF = {
  activeChannel: string;
  disabled: boolean;
};
export const ChatGIF = (props: IChatGIF) => {
  const [isOpen, setIsOpen] = useState(false);
  const onClickAway = () => {
    setIsOpen(false);
  };

  const { sendGIF } = useSendMessage(props.activeChannel);
  const onGIF = () => {
    setIsOpen(true);
  };
  const [results, setResults] = useState<SearchResult | null>(null);
  const onSelectGif = (result: Gif) => {
    sendGIF({
      type: "gifv",
      url: result.url,
      provider: {
        name: "Tenor",
      },
      thumbnail: {
        url: result.media_formats.tinygif.url,
        width: result.media_formats.tinygif.dims[0],
        height: result.media_formats.tinygif.dims[1],
      },
      video: {
        url: result.media_formats.mp4.url,
        width: result.media_formats.mp4.dims[0],
        height: result.media_formats.mp4.dims[1],
      },
    });
  };

  const debouncedSearch = useCallback(
    debounce((e: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = encodeURI(e.target.value);
      const apiKey = process.env.NEXT_PUBLIC_TENOR_API_KEY;
      const clientKey = "cobra_chat_gif";
      const uri = `https://tenor.googleapis.com/v2/search?q=${searchTerm}&key=${apiKey}&clientKey=${clientKey}&limit=8&media_filter=tinygif,mp4`;
      const aux = async () => {
        const res = await fetch(uri);
        const responseResults = await res.json();
        setResults(responseResults);
      };
      aux();
    }, 300),
    [setResults]
  );
  return (
    <Fragment>
      <ClickAwayListener onClickAway={onClickAway}>
        <div>
          <button disabled={props.disabled} onClick={onGIF}>
            <HiGif className="text-2xl" />
          </button>
          {isOpen && (
            <div
              className={cx(
                "absolute right-0 bottom-[calc(100%+8px)] shadow-md border border-2 border-slate-200",
                "bg-white flex flex-col overflow-hidden w-full max-w-[384px] p-2 rounded-md"
              )}
            >
              <Fragment>
                <div className="h-12 overflow-y-scroll">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <input
                      autoFocus
                      className="bg-slate-100 w-full p-2 rounded-md outline-none"
                      placeholder="Search Tenor"
                      onChange={debouncedSearch}
                    />
                  </form>
                </div>
                <div className="h-[384px] overflow-y-scroll relative">
                  {results?.results ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                      {results.results.map((result) =>
                        "tinygif" in result.media_formats ? (
                          <img
                            key={result.id}
                            className="h-auto max-w-full rounded-md hover:border-4 hover:border-turquoise-700 hover:cursor-pointer"
                            onClick={() => onSelectGif(result)}
                            src={result.media_formats.tinygif.url}
                          />
                        ) : (
                          <div key={result.id} />
                        )
                      )}
                    </div>
                  ) : (
                    <div className="p-12 text-lg text-center">
                      Lookup Gifs through the search box above!
                    </div>
                  )}
                </div>
              </Fragment>
            </div>
          )}
        </div>
      </ClickAwayListener>
    </Fragment>
  );
};
