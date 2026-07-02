"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Check, CheckCheck, Eye, X } from "lucide-react";
import { toast } from "sonner";

import { socket, registerSocket } from "@/src/socket.js";
import { useNotificationsApi } from "@/src/shared/hooks/useNotifications.api";
import { AppNotification } from "@/src/utils/types/notification";
import { Modal } from "@/src/shared/components/modal";

const TYPE_LABELS: Record<AppNotification["not_type"], string> = {
  INTERVENTION_CREATED: "Intervention créée",
  INTERVENTION_UPDATED: "Intervention modifiée",
  INTERVENTION_CANCELLED: "Intervention annulée",
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Props = {
  userId: string;
  role: string;
};

export function NotificationBell({ userId, role }: Props) {
  const { getNotifications, markAsRead, markAllAsRead } = useNotificationsApi();

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selected, setSelected] = useState<AppNotification | null>(null);

  const panelRef = useRef<HTMLDivElement | null>(null);

  // Chargement initial
  useEffect(() => {
    getNotifications()
      .then(({ notifications, unreadCount }) => {
        setNotifications(notifications);
        setUnreadCount(unreadCount);
      })
      .catch(() => {
        /* silencieux : la cloche reste utilisable */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enregistrement socket + écoute temps réel
  useEffect(() => {
    const cleanup = registerSocket(userId, role);

    const onNotification = (notif: AppNotification) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnreadCount((c) => c + 1);
      toast(notif.not_title, {
        description: notif.not_message,
        action: {
          label: "Voir",
          onClick: () => {
            setSelected(notif);
            void handleMarkRead(notif);
          },
        },
      });
    };

    socket.on("notification", onNotification);

    return () => {
      socket.off("notification", onNotification);
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, role]);

  // Fermer le panneau au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleMarkRead = async (notif: AppNotification) => {
    if (notif.not_isRead) return;
    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.not_id === notif.not_id ? { ...n, not_isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markAsRead(notif.not_id);
    } catch {
      /* rollback léger ignoré */
    }
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, not_isRead: true })));
    setUnreadCount(0);
    try {
      await markAllAsRead();
    } catch {
      /* ignoré */
    }
  };

  const handleViewDetail = (notif: AppNotification) => {
    setSelected(notif);
    setOpen(false);
    void handleMarkRead(notif);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 transition"
        title="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] rounded-xl border bg-white shadow-xl z-[1000] overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-semibold text-gray-900">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Tout marquer lu
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[420px] overflow-auto divide-y">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">
                Aucune notification
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.not_id}
                  className={`px-4 py-3 flex gap-3 ${n.not_isRead ? "bg-white" : "bg-blue-50/60"}`}
                >
                  <div className="mt-1">
                    <span
                      className={`block h-2 w-2 rounded-full ${n.not_isRead ? "bg-gray-300" : "bg-blue-600"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{n.not_title}</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{n.not_message}</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-400">{formatDate(n.not_createdAt)}</span>
                      <button
                        type="button"
                        onClick={() => handleViewDetail(n)}
                        className="flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline"
                      >
                        <Eye className="h-3 w-3" />
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        modalTitle="Détail de la notification"
      >
        {selected && (
          <div className="space-y-4 p-2 md:w-[480px]">
            <div>
              <p className="text-xs text-gray-500">Type</p>
              <p className="font-medium text-gray-900">{TYPE_LABELS[selected.not_type]}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Titre</p>
              <p className="font-medium text-gray-900">{selected.not_title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Message</p>
              <p className="text-gray-800">{selected.not_message}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Date</p>
              <p className="text-gray-800">{formatDate(selected.not_createdAt)}</p>
            </div>

            {selected.intervention && (
              <div className="rounded-lg border bg-gray-50 p-3 space-y-1">
                <p className="text-xs font-semibold text-gray-700">Intervention liée</p>
                <p className="text-sm text-gray-800">
                  <span className="text-gray-500">N° accord :</span>{" "}
                  {selected.intervention.int_accordNumber ?? "—"}
                </p>
                <p className="text-sm text-gray-800">
                  <span className="text-gray-500">Statut :</span>{" "}
                  {selected.intervention.int_status ?? "—"}
                </p>
                <p className="text-sm text-gray-800">
                  <span className="text-gray-500">Travaux :</span>{" "}
                  {selected.intervention.int_workDescription ?? "—"}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Check className="h-3.5 w-3.5" />
              {selected.not_isRead ? "Lue" : "Non lue"}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
