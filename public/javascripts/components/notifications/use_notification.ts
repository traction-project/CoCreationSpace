import { useEffect, useState } from "react";

export interface Notification {
  id: string;
  data: NotificationData;
  seen: boolean;
  createdAt: Date;
}

export type NotificationData = InterestNotificationData | PostReplyNotificationData | PostSubscriberNotificationData;

export interface InterestNotificationData {
  type: "interest-post",
  topic: { id: string, title: string },
  post: { id: string, title: string | null },
  creator: { id: string, username: string, image: string }
}

export interface PostReplyNotificationData {
  type: "post-reply",
  post: { id: string, title: string | null },
  creator: { id: string, username: string, image: string }
}

export interface PostSubscriberNotificationData {
  type: "post-subscriber",
  post: { id: string, title: string | null },
  creator: { id: string, username: string, image: string }
}

function useNotification(userId: string) {
  const [ notifications, setNotifications ] = useState<Array<Notification>>([]);

  const onNotificationReceived = (notification: Notification) => {
    console.log("Notification received:", notification);

    setNotifications(notifications => [
      ...notifications,
      notification
    ]);
  };

  useEffect(() => {
    fetch("/notifications/new").then((res) => {
      return res.json();
    }).then((data) => {
      setNotifications(data);
    }).then(() => {
      console.log("Setting up websocket channel...");

      const protocol = (location.protocol.startsWith("https")) ? "wss" : "ws";
      const ws = new WebSocket(`${protocol}://${location.host}/ws`);

      ws.onopen = () => {
        console.log("Websocket connection established");

        ws.send(JSON.stringify({
          command: "subscribe",
          userId
        }));
      };

      ws.onmessage = (e) => {
        const message = JSON.parse(e.data);

        switch (message.type) {
        case "message":
          onNotificationReceived(message.data);
          break;
        case "refresh":
          setNotifications(message.data);
          break;
        case "ping":
          ws.send(JSON.stringify({ command: "pong" }));
          break;
        default:
          console.log("Unrecognised WebSocket message received:", message);
        }
      };

      return () => {
        console.log("Closing channel...");

        ws.send(JSON.stringify({
          command: "unsubscribe",
          userId
        }));

        ws.close();
      };
    });
  }, [userId]);

  return notifications;
}

export default useNotification;
