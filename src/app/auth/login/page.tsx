import { auth } from "@/auth"
import { redirect } from "next/navigation"
import LoginForm from "./components/LoginForm"

export default async function Page() {
  const session = await auth()

  if (session) {
    redirect("/dashboard")
  }

  return <LoginForm/>
}
