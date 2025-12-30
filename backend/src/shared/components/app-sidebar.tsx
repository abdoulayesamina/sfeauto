import Image from 'next/image'
import Link from 'next/link'
import {
  Users,
  Building2,
  User,
  UserCog,
  Wrench,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/src/shared/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Utilisateurs",
    url: "users",
    icon: Users,
  },
  {
    title: "Agences",
    url: "#",
    icon: Building2,
  },
  {
    title: "Clients",
    url: "#",
    icon: User,
  },
  {
    title: "Gestionnaire yes",
    url: "#",
    icon: UserCog,
  },
  {
    title: "Mécanicien",
    url: "#",
    icon: Wrench,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
        <SidebarContent className="bg-white">
            <SidebarGroup>
                <div className="bg-white h-25 w-full flex items-center px-3 border-b">
                    <Link href="/">
                        <SidebarGroupLabel className="text-xl font-bold flex items-center gap-2">
                            <Image src="/voiture.png" width={30} height={30} alt="voiture"/>
                            Gest-Car
                        </SidebarGroupLabel>
                    </Link>
                </div>
                <div className="px-2 mt-6">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title} className="mb-6">
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url}>
                                            <item.icon className="100 !size-5" />
                                            <span className="ml-2 text-lg">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </div>
            </SidebarGroup>
        </SidebarContent>
    </Sidebar>
  )
}