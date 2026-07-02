"use client"; 

import { Separator } from "@/src/shared/components/ui/separator"
import { SidebarTrigger } from "@/src/shared/components/ui/sidebar"
import { socket } from "@/src/socket.js";
import { useEffect} from "react";
import { toast } from "sonner";

export function SiteHeader() {

  useEffect(() => {
    socket.on("new_intervention", (data) => {
      toast(data.not_title, {
        description: data.not_message,
        action: {
          label: "Voir",
          onClick: () => {
            console.log("Voir l'intervention :", data.intervention);
          },
        },
      });
    });
  }, [])

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
      </div>
    </header>
  )
}
