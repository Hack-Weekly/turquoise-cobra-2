import type { NextApiRequest, NextApiResponse } from "next";
import admin from "firebase-admin";

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
        const user = await admin.auth().getUser(decodedToken.uid);

        const db = admin.firestore();
        const query = db
          .collection("monsters")
          .where("userId", "==", decodedToken.uid)
          .orderBy("createdAt", "desc");
        const obtainedData = await query.get();
        if (obtainedData.empty) {
          await admin
            .firestore()
            .collection("messages")
            .add({
              channelId: req.body.channelId,
              author: {
                id: "",
                displayName: "BOT-SPAWN",
              },
              embedType: "monster:list",
              embeds: [
                {
                  type: "monster:list",
                  monsters: [],
                },
              ],
              mentions: [
                {
                  id: decodedToken.uid,
                  displayName: user.displayName || "",
                },
              ],
              content: `<@${decodedToken.uid}> You have no one in your roster! Use /spawn to get one!`,
              createdAt: new Date(),
            });
        } else {
          await admin
            .firestore()
            .collection("messages")
            .add({
              channelId: req.body.channelId,
              author: {
                id: "",
                displayName: "BOT-SPAWN",
              },
              embedType: "monster:list",
              embeds: [
                {
                  type: "monster:list",
                  monsters: obtainedData.docs.map((d) => d.data().monsterUrl),
                },
              ],
              mentions: [
                {
                  id: decodedToken.uid,
                  displayName: user.displayName || "",
                },
              ],
              content: `<@${decodedToken.uid}> You have these: \n`,
              createdAt: new Date(),
            });
        }

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
