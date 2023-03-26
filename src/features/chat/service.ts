import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  orderBy,
  query,
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  where,
  serverTimestamp,
  startAt,
  endAt,
  getDocs,
} from "firebase/firestore";
import { useCallback, useState } from "react";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import { Descendant } from "slate";
import { auth, db } from "../../../lib/firebase.config";
import { serialize } from "./ChatRoomSendMessage/chatSerializer";

export type DataChatMessage = {
  channelId: string;
  author: DataUser;
  mentions: DataUser[];
  embeds: DataChatMessageEmbed[];
  embedType: "" | "gifv" | "place" | "monster:spawn" | "monster:list";
  content: string;
  createdAt: Date;

  id: string;
};

export type DataChatMessageEmbed =
  | DataChatMessageGifv
  | DataChatMessageEmbedMonster
  | DataChatMessageEmbedMonsterList
  | DataChatMessageEmbedPlace;

export type DataChatMessageGifv = {
  type: "gifv";
  url: string;
  provider: {
    name: "Tenor";
  };
  thumbnail: {
    url: string;
    width: number;
    height: number;
  };
  video: {
    url: string;
    width: number;
    height: number;
  };
};

export type DataChatMessageEmbedMonster = {
  type: "monster:spawn";
  monster: {
    url: string;
  };
};
export type DataChatMessageEmbedMonsterList = {
  type: "monster:list";
  monsters: string[];
};

type PlaceColor = string;
export type DataChatMessageEmbedPlace = {
  type: "place";
  grid: PlaceColor[25][25];
};

export type DataChatChannel = {
  name: string;
  server: string;

  id: string;
};

const chatChannelConverter: FirestoreDataConverter<DataChatChannel> = {
  toFirestore(data: WithFieldValue<DataChatChannel>): DocumentData {
    return {
      name: data.name,
      server: data.server,
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): DataChatChannel {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: data.name,
      server: data.server,
    };
  },
};

export const useChannel = (channelId: string) => {
  const q = doc(db, "channels", channelId).withConverter(chatChannelConverter);

  return useDocumentData<DataChatChannel>(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
};

export const useChannels = () => {
  const q = query(
    collection(db, "channels"),
    orderBy("createdAt", "desc"),
    limit(50)
  ).withConverter(chatChannelConverter);

  return useCollection<DataChatChannel>(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
};

const chatMessagesConverter: FirestoreDataConverter<DataChatMessage> = {
  toFirestore(data: WithFieldValue<DataChatMessage>): DocumentData {
    return {
      channelId: data.channelId,
      author: data.author,
      content: data.content,
      createdAt: serverTimestamp(),
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): DataChatMessage {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      channelId: data.channelId,
      author: data.author,
      content: data.content,
      mentions: data.mentions,
      embeds: data.embeds || [],
      embedType: data.embedType,
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
    };
  },
};

export const useMessages = (channelId: string) => {
  const q = query(
    collection(db, "messages"),
    where("channelId", "==", channelId),
    orderBy("createdAt", "desc"),
    limit(50)
  ).withConverter(chatMessagesConverter);

  return useCollection<DataChatMessage>(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
};

const matchCommandPlace = (content: string) => {
  const regex = /^\/place\s([1-9]|[1-9][0-9]{0,1})([a-yA-Y])\s([^\s]*)$/;
  const match = regex.exec(content);

  if (match) {
    const number = match[1];
    const letter = match[2];
    const text = match[3];

    return { number, letter, text };
  } else {
    return false;
  }
};
const matchCommandChat = (content: string) => {
  const regex = /^\/chat\s(.+)$/;
  const match = regex.exec(content);

  if (match) {
    const chat = match[1];

    return { chat };
  } else {
    return false;
  }
};
const matchCommandSpawn = (content: string) => {
  const regex = /^\/spawn$/;
  const match = regex.exec(content);

  if (match) {
    return true;
  } else {
    return false;
  }
};
const matchCommandList = (content: string) => {
  const regex = /^\/list$/;
  const match = regex.exec(content);

  if (match) {
    return true;
  } else {
    return false;
  }
};

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXY".split("");
export const useSendMessage = (channelId: string) => {
  const [sendingChatBot, setSendingChatBot] = useState(false);

  const sendMessage = async (value: Descendant[]) => {
    if (auth.currentUser) {
      const { content } = serialize(value);
      const placeMatch = matchCommandPlace(content);
      const chatMatch = matchCommandChat(content);
      const spawnMatch = matchCommandSpawn(content);
      const listMatch = matchCommandList(content);

      if (placeMatch) {
        sendCommandPlace(
          LETTERS.indexOf(placeMatch.letter.toUpperCase()),
          Number(placeMatch.number) - 1,
          placeMatch.text
        );
      } else if (chatMatch) {
        sendCommandChat(chatMatch.chat);
        sendMessageRaw(value);
      } else if (spawnMatch) {
        sendCommandSpawn();
        sendMessageRaw(value);
      } else if (listMatch) {
        sendCommandList();
        sendMessageRaw(value);
      } else {
        sendMessageRaw(value);
      }
    }
  };

  const sendMessageRaw = (value: Descendant[]) => {
    if (auth.currentUser) {
      const { uid, displayName, photoURL } = auth.currentUser;
      const { content, mentions } = serialize(value);
      // TODO: This should be generated by the server somehow (mentions)
      const author: DataUser = {
        id: uid,
        displayName: displayName || "",
      };
      if (photoURL) {
        author.photoURL = photoURL;
      }

      const message: Omit<DataChatMessage, "id" | "metadata" | "createdAt"> = {
        channelId,
        content,
        author,
        mentions,
        embedType: "",
        embeds: [],
      };
      addDoc(collection(db, "messages"), {
        ...message,
        createdAt: serverTimestamp(),
      });
    }
  };

  const sendCommandChat = async (chat: string) => {
    if (auth.currentUser) {
      setSendingChatBot(true);
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch("/api/commands/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ message: chat, channelId }),
      });

      await response.json();
      setSendingChatBot(false);
    }
  };

  const sendCommandSpawn = async () => {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch("/api/commands/spawn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ channelId }),
      });

      await response.json();
    }
  };
  const sendCommandList = async () => {
    if (auth.currentUser) {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch("/api/commands/listowned", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ channelId }),
      });

      await response.json();
    }
  };
  const sendCommandPlace = async (x: number, y: number, color: string) => {
    if (auth.currentUser) {
      const { uid, displayName, photoURL } = auth.currentUser;
      // TODO: This should be generated by the server somehow (mentions)
      const author: DataUser = {
        id: uid,
        displayName: displayName || "",
      };
      if (photoURL) {
        author.photoURL = photoURL;
      }

      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch("/api/commands/place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ x, y, color }),
      });

      const data = await response.json();
    }
  };

  const sendGIF = async (embed: DataChatMessageGifv) => {
    if (auth.currentUser) {
      const { uid, displayName } = auth.currentUser;
      // TODO: This should be generated by the server somehow (mentions)
      const message: Omit<DataChatMessage, "id" | "metadata" | "createdAt"> = {
        channelId,
        content: embed.url,
        author: {
          id: uid,
          displayName: displayName || "",
        },
        mentions: [],
        embedType: "gifv",
        embeds: [embed],
      };
      addDoc(collection(db, "messages"), {
        ...message,
        createdAt: serverTimestamp(),
      });
    }
  };

  return { sendingChatBot, sendGIF, sendMessage, sendCommandPlace };
};

export type DataUser = {
  id: string;
  photoURL?: string;
  displayName: string;
};
export const useAutocompleteUsername = () => {
  const [usernames, setUsernames] = useState<DataUser[]>([]);

  // highest value unicode character,
  // so we can search from _usernameSTART_ -> _usernameEND_
  const fetchUsernames = useCallback(
    (_channelId: string, username: string) => {
      const aux = async () => {
        const endUsername = username + "\uf8ff";
        const snapshot = await getDocs(
          query(
            collection(db, "users"),
            orderBy("displayName"),
            startAt(username),
            endAt(endUsername),
            // orderBy("createdAt", "desc"),
            limit(10)
          )
        );
        const data: DataUser[] = [];
        snapshot.forEach((doc) => {
          data.push({ ...doc.data(), id: doc.id } as DataUser);
        });
        setUsernames(data);
      };
      aux();
    },
    [setUsernames]
  );

  return { usernames, fetchUsernames };
};

export const useDeleteMessage = () => {
  const deleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, "messages", id));
    } catch (e) {
      // TODO: Handle delete error
      console.log(e);
    }
  };

  return { deleteMessage };
};
