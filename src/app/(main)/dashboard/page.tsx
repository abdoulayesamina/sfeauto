import { auth } from "@/auth"
import { ChartAreaInteractive } from "@/src/shared/components/chart-area-interactive"
import { DataTable } from "@/src/shared/components/data-table"
import { SectionCards } from "@/src/shared/components/section-cards"
import { redirect } from "next/navigation"

// import data from "./data.json"

export default async function DashboardPage() {
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
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards user={user} />
          {/* <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div> */}
          {/* <DataTable data={data} /> */}
        </div>
      </div>
    </div>
  )
}
