import { useEffect, useState } from "react";

export interface NotificationData {
  topic: { id: string, title: string },
  post: { id: string, title: string }
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
      const ws = new WebSocket(`ws://${location.host}/`);

      ws.onopen = () => {
        console.log("Websocket connection established");

        ws.send(JSON.stringify({
          command: "subscribe",
          userId
        }));
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        onNotificationReceived(data);
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
