"use client";

import { AppNotification } from "@/src/utils/types/notification";

export function useNotificationsApi() {
  const getNotifications = async (): Promise<{
    notifications: AppNotification[];
    unreadCount: number;
  }> => {
    const res = await fetch("/api/notifications", { credentials: "include" });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur chargement notifications");
    }

    return res.json();
  };

  const markAsRead = async (notificationId: string): Promise<void> => {
    const res = await fetch(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur mise à jour notification");
    }
  };

  const markAllAsRead = async (): Promise<void> => {
    const res = await fetch("/api/notifications", {
      method: "PATCH",
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur mise à jour notifications");
    }
  };

  return { getNotifications, markAsRead, markAllAsRead };
}
