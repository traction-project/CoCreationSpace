import { useEffect, useState } from "react";

export interface NotificationData {
  topic: { id: string, title: string },
  post: { id: string, title: string },
  creator: { id: string, username: string, image: string }
}

function useNotification(userId: string) {
  const [ notifications, setNotifications ] = useState<Array<NotificationData>>([]);

  const onNotificationReceived = (notification: NotificationData) => {
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
