import { AppSidebar } from "@/src/shared/components/app-sidebar"
import { SiteHeader } from "@/src/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/src/shared/components/ui/sidebar"

export default function MainLayout({
  children,
}: {   
    children: React.ReactNode
}) {
  return (
    <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
            <SiteHeader />
            {children}
        </SidebarInset>
    </SidebarProvider>
  )
}