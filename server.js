import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { socket } from "./src/socket.js";

export let io;

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT) || 3000;;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("Socket is connected backend");
  });
  
  // socket.on("new_intervention", (data) => {
  //   io.emit("new_intervention", data);
  // });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});