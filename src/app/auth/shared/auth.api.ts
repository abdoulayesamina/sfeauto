import { signIn, signOut } from "next-auth/react"

export const login = (email: string, password: string) =>
  signIn("credentials", {
    email,
    password,
    redirect: false,
  })

export const logout = () => signOut({ callbackUrl: "/auth/login" })
