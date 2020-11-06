import http from "http";
import { PostInstance } from "models/post";
import WebSocket from "ws";

import { db } from "./models";

interface InterestSubscription {
  socket: WebSocket;
  userId: string;
  interests: Array<string>;
}

const clients: Array<InterestSubscription> = [];

/**
 * Returns an array of the IDs of the topics that the user given by the ID is
 * interested in. If there is no user with the given ID, an empty array is
 * returned.
 *
 * @param userId ID of user to fetch interests for
 * @returns A promise which resolves to an array of interest IDs
 */
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

/**
 * Broadcasts a notification message to all clients which are subscribed to the
 * topic that the given post belongs to. The message contains topic id and
 * title and the id and title of the post.
 *
 * @param post Post for whose topic a broadcast should be sent
 */
export async function broadcastNotification(post: PostInstance) {
  const thread = await post.getThread();
  const topic = await thread.getTopic();

  clients.forEach(async (client) => {
    const { socket, interests } = client;

    if (interests.find((t) => t == topic.id)) {
      if (post) {
        socket.send(JSON.stringify({
          topic: { id: topic.id, title: topic.title },
          post: { id: post.id, title: post.title }
        }));
      }
    }
  });
}

/**
 * Sets up a new websocket server and attaches it to the given HTTP server. It
 * also listens for new connections and adds clients to a client list along
 * with their interests. This function also ensures that broken or closed
 * connections are removed from the client list.
 *
 * @param server HTTP server to attach this websocket server to
 */
async function setupWebSocketServer(server: http.Server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    console.log("New ws connection accepted");

    ws.on("message", async (msg: string) => {
      const data = JSON.parse(msg);

      switch (data.command) {
      case "subscribe": {
        const interests = await getUserInterests(data.userId);

        if (interests.length > 0) {
          console.log("Adding subscription to topics", interests, "for", data.userId);

          clients.push({
            socket: ws,
            userId: data.userId,
            interests
          });
        }

        break;
      }
      case "unsubscribe": {
        const clientIndex = clients.findIndex((c) => {
          return c.userId == data.userId;
        });

        if (clientIndex > -1) {
          clients.splice(clientIndex, 1);
        }

        break;
      }
      default:
        console.log("Unrecognised message");
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
