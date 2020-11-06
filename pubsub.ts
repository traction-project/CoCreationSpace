import http from "http";
import WebSocket from "ws";

import { db } from "./models";

interface InterestSubscription {
  socket: WebSocket;
  interests: Array<string>;
}

const clients: Array<InterestSubscription> = [];

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

export async function broadcastNotification(topicId: string, postId: string) {
  const { Topics, Posts } = db.getModels();
  const topic = await Topics.findByPk(topicId);

  if (!topic) {
    return;
  }

  clients.forEach(async (client) => {
    const { socket, interests } = client;

    if (interests.find((t) => t == topicId)) {
      const post = await Posts.findByPk(postId);

      if (post) {
        socket.send(JSON.stringify({
          topic: { id: topic.id, title: topic.title },
          poast: { id: post.id, title: post.title }
        }));
      }
    }
  });
}

async function setupWebSocketServer(server: http.Server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("New ws connection accepted");

    ws.on("message", async (msg: string) => {
      const data = JSON.parse(msg);

      if (data.command && data.command == "subscribe") {
        const interests = await getUserInterests(data.userId);

        if (interests.length > 0) {
          console.log("Adding subscription to topics", interests, "for", data.userId);

          clients.push({
            socket: ws,
            interests
          });
        }
      }
    });

    const removeClient = () => {
      const clientIndex = clients.findIndex((c) => {
        return c.socket == ws;
      });

      if (clientIndex > -1) {
        clients.splice(clientIndex, 1);
      }
    };

    ws.on("error", removeClient);
    ws.on("close", removeClient);
  });
}

export default setupWebSocketServer;
