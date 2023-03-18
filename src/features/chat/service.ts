import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  SnapshotMetadata,
} from "firebase/firestore";
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
  metadata: SnapshotMetadata;
};

export const useMessages = () => {
  const [messages, setMessages] = useState<Array<DataChatMessage>>([]);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      let messages: Array<DataChatMessage> = [];
      QuerySnapshot.forEach((doc: any) => {
        messages.push({ ...doc.data(), id: doc.id, metadata: doc.metadata });
      });
      setMessages(messages);
    });

    return unsubscribe;
  }, []);

  return [messages];
};

export const useSendMessage = () => {
  const sendMessage = async (content: string) => {
    if (auth.currentUser) {
      const { uid, displayName, photoURL } = auth.currentUser;
      const message: Omit<DataChatMessage, "id" | "metadata"> = {
        channelId: "",
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
