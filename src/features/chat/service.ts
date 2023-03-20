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
} from "firebase/firestore";
import { useCollection, useDocumentData } from "react-firebase-hooks/firestore";
import { auth, db } from "../../../lib/firebase.config";

export type DataChatMessage = {
  channelId: string;
  author: {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
  };
  content: string;

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
    };
  },
};

export const useMessages = (channelId: string) => {
  const q = query(
    collection(db, "messages"),
    where("channelId", "==", channelId),
    orderBy("createdAt", "asc"),
    limit(50)
  ).withConverter(chatMessagesConverter);

  return useCollection<DataChatMessage>(q, {
    snapshotListenOptions: { includeMetadataChanges: true },
  });
};

export const useSendMessage = (channelId: string) => {
  const sendMessage = async (content: string) => {
    if (auth.currentUser) {
      const { uid, displayName, photoURL } = auth.currentUser;
      const message: Omit<DataChatMessage, "id" | "metadata"> = {
        channelId,
        content,
        author: {
          uid,
          displayName,
          photoURL,
        },
      };
      addDoc(collection(db, "messages"), {
        ...message,
        createdAt: serverTimestamp(),
      });
    }
  };

  return { sendMessage };
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
