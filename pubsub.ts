import http from "http";
import WebSocket from "ws";

export default async function setupWebSocketServer(server: http.Server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws, req) => {
    console.log("New connection:", ws, req);

    ws.on("message", (data) => {
      console.log("Message:", data);
    });
  });
}
