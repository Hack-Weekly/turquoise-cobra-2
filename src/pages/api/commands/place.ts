import type { NextApiRequest, NextApiResponse } from "next";
import stc from "string-to-color";
import admin from "firebase-admin";
import {
  DataChatMessage,
  DataChatMessageEmbedPlace,
} from "@/features/chat/service";
import { compressToUTF16, decompressFromUTF16 } from "lz-string";

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

type Data = {
  message: string;
};

const N = 25;
const makeEmptyRow = () => Array(N).fill("#ffffff");
const makeEmptyGrid = () => Array(N).fill(0).map(makeEmptyRow);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // check if the request method is POST
  if (req.method === "POST") {
    try {
      // get the Firebase Authentication token from the Authorization header
      const authorizationHeader = req.headers.authorization;
      if (authorizationHeader) {
        const token = authorizationHeader.split(" ")[1];

        const decodedToken = await admin.auth().verifyIdToken(token);

        const db = admin.firestore();
        const query = db
          .collection("messages")
          .where("embedType", "==", "place")
          .orderBy("createdAt", "desc")
          .limit(1);

        const obtainedData = await query.get();
        let data: Omit<DataChatMessage, "id" | "createdAt">;
        let grid = [];

        if (obtainedData.empty) {
          data = {
            channelId: "i39FeIJVeRW3Fr71aI4x",
            author: {
              id: "",
              displayName: "BOT-PLACE",
            },
            mentions: [],
            embedType: "place",
            embeds: [
              {
                type: "place",
                grid: "",
              },
            ],
            content: "",
          };
          grid = makeEmptyGrid();
        } else {
          data = obtainedData.docs[0].data() as any;
          grid = JSON.parse(
            decompressFromUTF16(
              (data.embeds[0] as DataChatMessageEmbedPlace).grid
            )
          );
        }

        grid[req.body.y][req.body.x] = stc(req.body.color);
        (data.embeds[0] as any).grid = compressToUTF16(JSON.stringify(grid));

        await admin
          .firestore()
          .collection("messages")
          .add({
            ...data,
            mentions: [
              {
                id: decodedToken.uid,
                displayName: decodedToken["name"] || "",
              },
            ],
            content: `from <@${decodedToken.uid}>`,
            createdAt: new Date(),
          });
        res.status(200).json({ message: "User data created successfully" });
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
