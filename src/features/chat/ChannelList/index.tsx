import cx from "classnames";
import Link from "next/link";
import { DataChatChannel, useChannels } from "../service";
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export type IChannelList = {
  activeChannel: string;
  className?: React.HTMLProps<HTMLDivElement>["className"];
};
export const ChannelList = (props: IChannelList) => {
  const [channels, loading, error] = useChannels();

  return (
    <div className={cx(props.className, "gap-2")}>
      {channels?.docs.map((ch) => (
        <ChannelListItem
          key={ch.id}
          active={ch.id === props.activeChannel}
          channel={ch.data()}
        />
      )) || <Skeleton count={2} width={200} height={40} />}
    </div>
  );
};

type IChannelListItem = {
  channel: DataChatChannel;
  active?: boolean;
};
const ChannelListItem = (props: IChannelListItem) => {
  const { channel } = props;

  return (
    <Link
      href={`/channels/${channel.id}`}
      className={cx(
        props.active
          ? "bg-white bg-opacity-75"
          : "hover:bg-white hover:bg-opacity-25",
        "font-semibold p-2 px-4 rounded-xl w-full"
      )}
    >
      {channel.name}
    </Link>
  );
};

export default ChannelList;
