import http from "http";
import WebSocket from "ws";

import { db } from "./models";

async function getUserInterests(userId: string): Promise<Array<string>> {
  const { Users } = db.getModels();
  const user = await Users.findByPk(userId);

  if (user) {
    const topics = await user.getInterestedTopics();

    return topics.map((t) => {
      return t.id;
    });
  }

  return [];
}

async function setupWebSocketServer(server: http.Server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log("New connection:", ws, req);

    ws.on("message", (data) => {
      console.log("Message:", data);
    });
  });
}

export default setupWebSocketServer;
