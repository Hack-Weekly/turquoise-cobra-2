import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";
import { ChatGPTAPI, ChatGPTUnofficialProxyAPI } from "chatgpt";
import Authenticator from "openai-token";

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string
);

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: "cobrachat-ea9e8",
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  // check if the request method is POST
  if (req.method === "POST") {
    try {
      // get the Firebase Authentication token from the Authorization header
      const authorizationHeader = req.headers.authorization;
      if (authorizationHeader) {
        const token = authorizationHeader.split(" ")[1];

        const decodedToken = await admin.auth().verifyIdToken(token);

        const auth = new Authenticator(
          process.env.OPENAI_ACCESS_EMAIL as string,
          process.env.OPENAI_ACCESS_PASSWORD as string
        );
        await auth.begin();
        const accessToken = await auth.getAccessToken();

        const api = new ChatGPTUnofficialProxyAPI({
          accessToken: accessToken,
          apiReverseProxyUrl: "https://api.pawan.krd/backend-api/conversation",
        });

        const message = await api.sendMessage(req.body.message);

        await admin
          .firestore()
          .collection("messages")
          .add({
            channelId: req.body.channelId,
            author: {
              id: "",
              displayName: "BOT-CHAT",
            },
            embedType: "place",
            embeds: [],
            mentions: [
              {
                id: decodedToken.uid,
                displayName: decodedToken["name"] || "",
                photoURL: decodedToken.picture,
              },
            ],
            content: `<@${decodedToken.uid}> \n` + message.text,
            createdAt: new Date(),
          });
        res.status(200).json({ message: "Message created" });
      } else {
        res.status(401).json({ message: "User not logged in" });
      }
    } catch (error) {
      console.error(error);
      // return an error response
      res.status(500).json({ message: "Internal server error" });
    }
  } else {
    // return a method not allowed response
    res.status(405).json({ message: "Method not allowed" });
  }
}
