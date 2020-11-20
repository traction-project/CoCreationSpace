import http from "http";
import { PostInstance } from "models/post";
import WebSocket from "ws";

import { getFromEnvironment } from "./util";
import { db } from "./models";

const [ CLOUDFRONT_URL ] = getFromEnvironment("CLOUDFRONT_URL");

interface InterestSubscription {
  socket: WebSocket;
  userId: string;
  interval: NodeJS.Timer;
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
 * Checks whether a notification with the given data content already exists for
 * the user with the given ID.
 *
 * @param data Data in the notification
 * @param userId ID of the user that the notification belongs to
 * @returns true if the notification already exists, false otherwise
 */
async function isDuplicateNotification(data: any, userId: string) {
  const { Notifications, Users } = db.getModels();

  const isDuplicate = await Notifications.findOne({
    where: {
      data
    },
    include: {
      model: Users,
      as: "user",
      where: { id: userId }
    }
  });

  return isDuplicate != null;
}

/**
 * Sends a refreshed list of notifications to the user with the given ID. If no
 * such user is connected, nothing happens.
 *
 * @param userId ID of user to send refreshed notifications to
 */
export async function sendRefreshToClient(userId: string) {
  const { Users } = db.getModels();

  const user = await Users.findByPk(userId);

  if (user) {
    const userNotifications = await user.getNotifications({
      order: [["createdAt", "DESC"]]
    });

    clients.forEach((client) => {
      if (client.userId == user.id) {
        client.socket.send({
          type: "refresh",
          data: userNotifications.map((notification) => notification.data)
        });
      }
    });
  }
}

/**
 * Broadcasts a notification message to all clients which are subscribed to the
 * topic that the given post belongs to. The message contains topic id and
 * title and the id and title of the post.
 *
 * @param post Post for whose topic a broadcast should be sent
 */
export async function broadcastNotification(post: PostInstance) {
  const { Notifications } = db.getModels();

  const user = await post.getUser();
  const thread = await post.getThread();

  if (!thread || !user) {
    return;
  }

  const topic = await thread.getTopic();

  if (!topic) {
    return;
  }

  clients.forEach(async (client) => {
    const { socket, userId } = client;
    const interests = await getUserInterests(userId);

    if (interests.find((t) => t == topic.id)) {
      console.log("Sending broadcast for", post.id, post.title, topic.id, topic.title, "to", userId);

      const data = {
        topic: { id: topic.id, title: topic.title },
        post: { id: post.id, title: post.title },
        creator: { id: user.id, username: user.username, image: `${CLOUDFRONT_URL}/${user.image}` }
      };

      if (!await isDuplicateNotification(data, userId)) {
        const notification = await Notifications.create({ data });
        await notification.setUser(userId);
      }

      socket.send(JSON.stringify({
        type: "message",
        data
      }));
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
  const wss = new WebSocket.Server({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("New ws connection accepted");

    ws.on("message", async (msg: string) => {
      const data = JSON.parse(msg);

      switch (data.command) {
      case "subscribe": {
        console.log("Adding subscription to topics for", data.userId);

        const interval = setInterval(() => {
          ws.send(JSON.stringify({
            type: "ping"
          }));
        }, 5000);

        clients.push({
          socket: ws,
          userId: data.userId,
          interval
        });

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
      case "pong":
        break;
      default:
        console.log("Unrecognised message");
      }
    });

    const removeClient = () => {
      console.log("Removing dead client...");

      const clientIndex = clients.findIndex((c) => {
        return c.socket == ws;
      });

      if (clientIndex > -1) {
        clearInterval(clients[clientIndex].interval);
        clients.splice(clientIndex, 1);
      }
    };

    ws.on("error", removeClient);
    ws.on("close", removeClient);

  });

  const { Posts } = db.getModels();

  Posts.afterCreate(async (post) => {
    console.log("Post created, sending broadcast...");
    broadcastNotification(post);
  });
}

export default setupWebSocketServer;
