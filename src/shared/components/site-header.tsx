"use client";

import { Separator } from "@/src/shared/components/ui/separator"
import { SidebarTrigger } from "@/src/shared/components/ui/sidebar"
import { useSession } from "next-auth/react";
import { NotificationBell } from "@/src/shared/components/notification-bell";

export function SiteHeader() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Notifications : réservées à l'admin */}
        {userId && role === "ADMIN" && (
          <div className="ml-auto">
            <NotificationBell userId={userId} role={role} />
          </div>
        )}
      </div>
    </header>
  )
}
