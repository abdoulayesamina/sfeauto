import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Poppins } from "next/font/google"

import { AppSidebar } from "@/src/shared/components/app-sidebar"
import { SiteHeader } from "@/src/shared/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/shared/components/ui/sidebar"

 const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins", 
  })

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
    avatar: "/avatars/default.jpg", 
    role: session.user.role,
  }
  

  return (
    <SidebarProvider>
      <AppSidebar user={user} variant="inset"/>
      <SidebarInset className={poppins.variable}>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
