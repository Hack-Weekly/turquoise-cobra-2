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

const MONSTER_PATHS = [
  "/monsters/0_0.png",
  "/monsters/10_0.png",
  "/monsters/10_1.png",
  "/monsters/11_0.png",
  "/monsters/11_1.png",
  "/monsters/12_0.png",
  "/monsters/12_1.png",
  "/monsters/13_0.png",
  "/monsters/13_1.png",
  "/monsters/14_0.png",
  "/monsters/14_1.png",
  "/monsters/15_0.png",
  "/monsters/15_1.png",
  "/monsters/16_0.png",
  "/monsters/16_1.png",
  "/monsters/16_2.png",
  "/monsters/17_0.png",
  "/monsters/17_1.png",
  "/monsters/17_2.png",
  "/monsters/18_0.png",
  "/monsters/18_1.png",
  "/monsters/18_2.png",
  "/monsters/19_0.png",
  "/monsters/19_1.png",
  "/monsters/19_2.png",
  "/monsters/1_0.png",
  "/monsters/1_1.png",
  "/monsters/1_2.png",
  "/monsters/20_0.png",
  "/monsters/20_1.png",
  "/monsters/20_2.png",
  "/monsters/21_0.png",
  "/monsters/21_1.png",
  "/monsters/21_2.png",
  "/monsters/22_0.png",
  "/monsters/22_1.png",
  "/monsters/23_0.png",
  "/monsters/24_0.png",
  "/monsters/25_0.png",
  "/monsters/26_0.png",
  "/monsters/26_1.png",
  "/monsters/27_0.png",
  "/monsters/27_1.png",
  "/monsters/28_0.png",
  "/monsters/29_0.png",
  "/monsters/2_0.png",
  "/monsters/2_1.png",
  "/monsters/2_2.png",
  "/monsters/30_0.png",
  "/monsters/31_0.png",
  "/monsters/32_0.png",
  "/monsters/33_0.png",
  "/monsters/34_0.png",
  "/monsters/35_0.png",
  "/monsters/36_0.png",
  "/monsters/37_0.png",
  "/monsters/38_0.png",
  "/monsters/39_0.png",
  "/monsters/3_0.png",
  "/monsters/3_1.png",
  "/monsters/3_2.png",
  "/monsters/40_0.png",
  "/monsters/41_0.png",
  "/monsters/42_0.png",
  "/monsters/42_1.png",
  "/monsters/42_2.png",
  "/monsters/43_0.png",
  "/monsters/43_1.png",
  "/monsters/44_0.png",
  "/monsters/44_1.png",
  "/monsters/45_0.png",
  "/monsters/45_1.png",
  "/monsters/45_2.png",
  "/monsters/46_0.png",
  "/monsters/46_1.png",
  "/monsters/46_2.png",
  "/monsters/47_0.png",
  "/monsters/47_1.png",
  "/monsters/47_2.png",
  "/monsters/47_3.png",
  "/monsters/48_0.png",
  "/monsters/49_0.png",
  "/monsters/4_0.png",
  "/monsters/4_1.png",
  "/monsters/4_2.png",
  "/monsters/50_0.png",
  "/monsters/51_0.png",
  "/monsters/51_1.png",
  "/monsters/51_2.png",
  "/monsters/5_0.png",
  "/monsters/6_0.png",
  "/monsters/6_1.png",
  "/monsters/6_2.png",
  "/monsters/7_0.png",
  "/monsters/7_1.png",
  "/monsters/7_2.png",
  "/monsters/8_0.png",
  "/monsters/8_1.png",
  "/monsters/9_0.png",
  "/monsters/9_1.png",
];

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

        await admin
          .firestore()
          .collection("messages")
          .add({
            channelId: req.body.channelId,
            author: {
              id: "",
              displayName: "BOT-SPAWN",
            },
            embedType: "monster:spawn",
            embeds: [
              {
                type: "monster:spawn",
                monster: {
                  url: MONSTER_PATHS[
                    Math.floor(Math.random() * MONSTER_PATHS.length)
                  ],
                },
              },
            ],
            mentions: [
              {
                id: decodedToken.uid,
                displayName: decodedToken["name"] || "",
              },
            ],
            content: `<@${decodedToken.uid}> You spawned: \n`,
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
