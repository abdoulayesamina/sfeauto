"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Wrench,
  UserCog
} from "lucide-react"

import { NavDocuments } from "@/src/shared/components/nav-documents"
import { NavMain } from "@/src/shared/components/nav-main"
import { NavSecondary } from "@/src/shared/components/nav-secondary"
import { NavUser } from "@/src/shared/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/shared/components/ui/sidebar"

type AppSidebarProps = {
  user: {
    name: string
    email: string
    avatar: string
    role:"ADMIN" |"MANAGER"|"MECHANIC"|"CLIENT"
  },
    variant?: "inset" | "sidebar"

} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  
  const navMain = [
    {
      title: "Tableau de bord",
      url: "/dashboard",
      icon: LayoutDashboard,
      roles:["ADMIN"],
    },
    {
      title: "Utilisateurs",
      url: "/users",
      icon: Users,
      roles:["ADMIN"],

    },
    {
      title: "Agences",
      url: "/agence",
      icon: Building2,
      roles:["ADMIN"],
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Briefcase,
            roles:["ADMIN"],

    },
    {
      title: "Gestionnaire",
      url: "/gestionnaire",
      icon: UserCog,
            roles:["MANAGER"],

    },
    {
      title: "Mécanicien",
      url: "/mecanicien",
      icon: Wrench,
            roles:["MECHANIC"],

    },
  ]

  // const documents = [
  //   { name: "Data Library", url: "#", icon: DatabaseIcon },
  //   { name: "Reports", url: "#", icon: ClipboardListIcon },
  //   { name: "Word Assistant", url: "#", icon: FileIcon },
  // ]

  // const navSecondary = [
  //   { title: "Paramètres", url: "#", icon: SettingsIcon },
  //   { title: "Aide", url: "#", icon: HelpCircleIcon },
  //   { title: "Recherche", url: "#", icon: SearchIcon },
  // ]
const filteredNav = navMain.filter(item =>
    item.roles.includes(user.role)
  )
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">SFE Auto</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={filteredNav} />
        {/* <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" /> */}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
