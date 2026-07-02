"use client";

import { io } from "socket.io-client";

// Connexion au même origine (le serveur custom sert Next + socket.io).
export const socket = io({ autoConnect: true });

// Enregistre le socket dans les rooms de l'utilisateur (user:<id> et role:<role>)
// pour recevoir les notifications ciblées. À rappeler à chaque (re)connexion.
export function registerSocket(userId, role) {
  if (!userId) return () => {};

  const doRegister = () => socket.emit("register", { userId, role });

  if (socket.connected) {
    doRegister();
  }

  // Réenregistre automatiquement à chaque reconnexion.
  socket.on("connect", doRegister);

  return () => {
    socket.off("connect", doRegister);
  };
}
