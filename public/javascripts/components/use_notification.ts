import { useEffect } from "react";

interface Notification {
  topic: { id: string, title: string },
  post: { id: string, title: string }
}

function useNotification(userId: string, onNotificationReceived: (notification: Notification) => void) {
  useEffect(() => {
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
      ws.send(JSON.stringify({
        command: "unsubscribe",
        userId
      }));

      ws.close();
    };
  }, [userId]);
}

export default useNotification;
