import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT) || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  // Partage l'instance io via globalThis pour que les routes API (même process)
  // puissent émettre sans importer ce fichier serveur.
  globalThis.__io = io;

  io.on("connection", (socket) => {
    console.log("Socket connecté", socket.id);

    // Le client s'enregistre pour rejoindre ses "rooms" (user + role),
    // ce qui permet de cibler les notifications.
    socket.on("register", ({ userId, role } = {}) => {
      if (userId) socket.join(`user:${userId}`);
      if (role) socket.join(`role:${role}`);
      console.log(`Socket ${socket.id} enregistré (user:${userId}, role:${role})`);
    });

    socket.on("disconnect", () => {
      console.log("Socket déconnecté", socket.id);
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
