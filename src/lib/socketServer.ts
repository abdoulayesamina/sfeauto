// Accès à l'instance socket.io partagée par le serveur custom (server.js),
// exposée via globalThis pour être utilisable depuis les routes API (même process).
import type { Server } from "socket.io";

export function getIO(): Server | null {
  return (globalThis as any).__io ?? null;
}
