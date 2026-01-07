import { redirect } from "next/navigation"
import { auth } from "@/auth"

import { AppSidebar } from "@/src/shared/components/app-sidebar"
import { SiteHeader } from "@/src/shared/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/shared/components/ui/sidebar"

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const user = {
    name: session.user?.name ?? "Invité",
    email: session.user?.email ?? "",
    avatar: session.user?.image ?? "/avatars/default.jpg",
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} variant="inset"/>
      <SidebarInset>
        <SiteHeader />
            {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
