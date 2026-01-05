import { AppSidebar } from "@/src/shared/components/app-sidebar"
import { ChartAreaInteractive } from "@/src/shared/components/chart-area-interactive"
import { DataTable } from "@/src/shared/components/data-table"
import { SectionCards } from "@/src/shared/components/section-cards"
import { SiteHeader } from "@/src/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/src/shared/components/ui/sidebar"
import { redirect } from "next/navigation"

import data from "./data.json"
import { auth } from "@/auth"

export default async function Page() {
  const session = await auth()

  if (!session) {
    redirect("/auth/login")
  }

  const user = {
    name: session.user.name,
    email: session.user.email,
    avatar: "/avatars/default.jpg",
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
