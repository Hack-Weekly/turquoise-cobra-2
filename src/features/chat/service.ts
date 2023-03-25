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
  content: string;
  createdAt: Date;

  id: string;
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
      createdAt: data.createdAt.toDate(),
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

export const useSendMessage = (channelId: string) => {
  const sendMessage = async (value: Descendant[]) => {
    if (auth.currentUser) {
      const { uid, displayName } = auth.currentUser;
      const { content, mentions } = serialize(value);
      // TODO: This should be generated by the server somehow (mentions)
      const message: Omit<DataChatMessage, "id" | "metadata" | "createdAt"> = {
        channelId,
        content,
        author: {
          id: uid,
          displayName: displayName || "",
        },
        mentions,
      };
      addDoc(collection(db, "messages"), {
        ...message,
        createdAt: serverTimestamp(),
      });
    }
  };

  return { sendMessage };
};

export type DataUser = {
  id: string;
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
