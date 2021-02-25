import http from "http";
import { PostInstance } from "models/post";
import WebSocket from "ws";
import crypto from "crypto";

import { getFromEnvironment } from "./util";
import { db } from "./models";
import { UserInstance } from "models/users";

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
 * @param user User object to fetch interests for
 * @returns A promise which resolves to an array of interest IDs
 */
async function getUserInterests(user: UserInstance): Promise<Array<string>> {
  const topics = await user.getInterestedTopics();

  return topics.map((t) => {
    return t.id;
  });
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
        console.log("Sending refresh to", user.id, userNotifications.length);

        client.socket.send(JSON.stringify({
          type: "refresh",
          data: userNotifications.map((notification) => {
            const { id, seen, createdAt, data } = notification;

            return {
              id, seen, createdAt, data
            };
          })
        }));
      }
    });
  }
}

/**
 * Groups a list of clients into a map object, containing user IDs as keys,
 * mapping them to all socket connections for that user ID.
 *
 * @param clients Array of clients with user ID and socket connections
 * @returns A map object, mapping user IDs to lists of socket connections
 */
function groupConnectionsByUserId(clients: Array<InterestSubscription>): Map<string, Array<WebSocket>> {
  return clients.reduce((userConnections, client) => {
    if (userConnections.has(client.userId)) {
      const connections = userConnections.get(client.userId)!;

      return userConnections.set(
        client.userId,
        connections.concat([client.socket])
      );
    }

    return userConnections.set(
      client.userId, [client.socket]
    );
  }, new Map<string, Array<WebSocket>>());
}

/**
 * Checks whether two given users have groups in common. Returns if they are
 * both members of some group together and returns true, or false otherwise.
 *
 * @param author Author of the post
 * @param recipient Recipient of the notification
 */
async function haveCommonGroups(author: UserInstance, recipient: UserInstance): Promise<boolean> {
  const authorGroups = (await author.getUserGroups()).map((g) => g.id);
  const recipientGroups = new Set((await recipient.getUserGroups()).map((g) => g.id));

  return authorGroups.some((g) => recipientGroups.has(g));
}

/**
 * Broadcasts a notification message to all clients which are subscribed to the
 * topic that the given post belongs to. The message contains topic id and
 * title and the id and title of the post.
 *
 * @param post Post for whose topic a broadcast should be sent
 */
export async function broadcastNotification(post: PostInstance) {
  const { Notifications, Users } = db.getModels();

  const author = await post.getUser();
  const thread = await post.getThread();

  if (!thread || !author) {
    return;
  }

  const topic = await thread.getTopic();

  if (!topic) {
    return;
  }

  const data = {
    topic: { id: topic.id, title: topic.title },
    post: { id: post.id, title: post.title },
    creator: { id: author.id, username: author.username, image: `${CLOUDFRONT_URL}/${author.image}` }
  };
  const notificationDataHash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");

  groupConnectionsByUserId(clients).forEach(async (sockets, userId) => {
    const recipient = await Users.findByPk(userId);

    if (!recipient) {
      return;
    }

    // Check if author and recipient share a group
    if (!await haveCommonGroups(author, recipient)) {
      return;
    }

    const interests = await getUserInterests(recipient);
    if (interests.find((t) => t == topic.id)) {
      // Don't send notification if client is creator of post
      if (author.id == recipient.id) {
        return;
      }

      console.log("Creating notification with hash", notificationDataHash, "for", recipient.id);

      const notification = await Notifications.create({
        data,
        user_id: recipient.id,
        hash: notificationDataHash
      } as any);

      console.log("Sending notification to", sockets.length, "connections...");

      sockets.forEach((socket) => {
        console.log("Sending notification to connection for", recipient.id);

        socket.send(JSON.stringify({
          type: "message",
          data: {
            id: notification.id,
            seen: notification.seen,
            createdAt: notification.createdAt,
            data
          }
        }));
      });
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

  const { Posts, Notifications } = db.getModels();

  Posts.afterCreate(async (post) => {
    console.log("Post created, sending broadcast...");
    await broadcastNotification(post);
  });

  Notifications.afterUpdate(async (notification) => {
    if (!notification.isNewRecord) {
      const user = await notification.getUser();
      console.log("Notification updated, sending refresh to user", user.id);

      await sendRefreshToClient(user.id);
    }
  });

  Notifications.afterDestroy(async (notification) => {
    const user = await notification.getUser();
    console.log("Notification deleted, sending refresh to user", user.id);

    await sendRefreshToClient(user.id);
  });
}

export default setupWebSocketServer;
