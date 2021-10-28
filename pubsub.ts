import http from "http";
import { PostInstance } from "models/post";
import WebSocket from "ws";
import crypto from "crypto";

import { getFromEnvironment } from "./util";
import { db } from "./models";
import { UserInstance } from "models/users";

const [ CLOUDFRONT_URL ] = getFromEnvironment("CLOUDFRONT_URL");

type NotificationSender = (recipient: UserInstance, sockets: Array<WebSocket>) => Promise<boolean>;

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
 * Prepares notifications for interest topics for the given post. This function
 * takes a newly created post and prepares a notification for it. It returns a
 * function, which when called with a user instance and a list of websocket
 * connections, decides whether that user should receive the created
 * notification. This function returns true if the notification was created and
 * false otherwise.
 *
 * @param post Post for notifications should be prepared
 * @returns Function which takes a recipient and creates a notification if that user should receive one
 */
async function prepareInterestNotification(post: PostInstance): Promise<NotificationSender> {
  const { Notification } = db.getModels();

  const author = await post.getUser();
  const thread = await post.getThread();

  if (!thread || !author) {
    return async () => false;
  }

  // Get associated topic
  const topic = await thread.getTopic();

  if (!topic) {
    return async () => false;
  }

  // Compile notification data and hash for interests
  const data = {
    type: "interest-post",
    topic: { id: topic.id, title: topic.title },
    post: { id: post.id, title: post.title },
    creator: { id: author.id, username: author.username, image: `${CLOUDFRONT_URL}/${author.image}` }
  };
  const notificationDataHash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");

  return async (recipient, sockets) => {
    const interests = await getUserInterests(recipient);

    // Check whether the user is subscribed to the interest topic that the post
    // is associated to
    if (interests.find((t) => t == topic.id)) {
      // Don't send notification if client is creator of post
      if (author.id == recipient.id) {
        return false;
      }

      console.log("Creating topic notification with hash", notificationDataHash, "for", recipient.id);

      // Create notification in database
      const notification = await Notification.create({
        data,
        user_id: recipient.id,
        hash: notificationDataHash
      } as any);

      console.log("Sending topic notification to", sockets.length, "connections...");

      // Send notification data over each socket connection
      sockets.forEach((socket) => {
        console.log("Sending topic notification to connection for", recipient.id);

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

      return true;
    }

    return false;
  };
}

async function preparePostNotification(post: PostInstance): Promise<NotificationSender> {
  const { Notification } = db.getModels();

  const parentPost = await post.getParentPost();
  const author = await post.getUser();

  if (!parentPost) {
    return async () => false;
  }

  const parentPostAuthor = await parentPost.getUser();

  // Compile notification data and hash for interests
  const data = {
    type: "post-reply",
    post: { id: post.id, title: post.title },
    creator: { id: author.id, username: author.username, image: `${CLOUDFRONT_URL}/${author.image}` }
  };
  const notificationDataHash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");

  return async (recipient, sockets) => {
    if (recipient.id == parentPostAuthor.id) {
      // Don't send notification if client is creator of post
      if (author.id == recipient.id) {
        return false;
      }

      console.log("Creating post reply notification with hash", notificationDataHash, "for", recipient.id);

      // Create notification in database
      const notification = await Notification.create({
        data,
        user_id: recipient.id,
        hash: notificationDataHash
      } as any);

      console.log("Sending post reply notification to", sockets.length, "connections...");

      // Send notification data over each socket connection
      sockets.forEach((socket) => {
        console.log("Sending post reply notification to connection for", recipient.id);

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

      return true;
    }

    return false;
  };
}

/**
 * Broadcasts a notification message to all clients which are subscribed to the
 * topic that the given post belongs to. The message contains topic id and
 * title and the id and title of the post.
 *
 * @param post Post for whose topic a broadcast should be sent
 */
export async function broadcastNotification(post: PostInstance) {
  // Get group associated to post
  const group = await post.getUserGroup();

  if (!group) {
    return;
  }

  // Get members of group that the post was posted in
  const recipients = await group.getUsers();
  // Group socket connections by user ID
  const userSocketConnections = groupConnectionsByUserId(clients);

  const sendPostNotification = await preparePostNotification(post);
  const sendInterestNotification = await prepareInterestNotification(post);

  // Iterate over all members of the post's group
  recipients.forEach(async (recipient) => {
    const sockets = userSocketConnections.get(recipient.id) || [];

    const notificationSent = await sendPostNotification(recipient, sockets);
    if (!notificationSent) {
      await sendInterestNotification(recipient, sockets);
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

  const { Post, Notification } = db.getModels();

  Post.afterCreate(async (post) => {
    console.log("Post created, sending broadcast...");
    await broadcastNotification(post);
  });

  Notification.afterUpdate(async (notification) => {
    if (!notification.isNewRecord) {
      const user = await notification.getUser();
      console.log("Notification updated, sending refresh to user", user.id);

      await sendRefreshToClient(user.id);
    }
  });

  Notification.afterDestroy(async (notification) => {
    const user = await notification.getUser();
    console.log("Notification deleted, sending refresh to user", user.id);

    await sendRefreshToClient(user.id);
  });
}

export default setupWebSocketServer;
