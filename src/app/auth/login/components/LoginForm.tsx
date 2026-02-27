"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Button } from "@/src/shared/components/ui/button"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import Image from "next/image"

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

type LoginForm = {
  email: string
  password: string
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const router = useRouter()

  const onSubmit = async (data: LoginForm) => {
    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    if (res?.ok) {
      router.push("/dashboard")
    } else {
      alert("Email ou mot de passe incorrect")
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden">

      <div
        className="absolute inset-0 scale-105 bg-center bg-cover"
        style={{ backgroundImage: "url('/2149580561.jpg')" }}
      />


      <div className="absolute inset-0 bg-black/75" />


      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent" />

      <div className="relative z-10 flex items-center justify-center w-full px-4">
        <div
          className="
            w-full max-w-4xl
            grid grid-cols-1 md:grid-cols-2
            rounded-3xl
            overflow-hidden
            bg-white/20
            backdrop-blur-2xl
            shadow-[0_25px_80px_rgba(0,0,0,0.6)]
            animate-in fade-in zoom-in-95 duration-700
          "
        >


          <Card className="bg-transparent border-0 rounded-none">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-center text-white">
                Connexion
              </CardTitle>
              <CardDescription className="text-center text-gray-300">
                Accédez à votre espace SFE AUTO
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <div className="space-y-1">
                  <Label className="text-gray-200">Email</Label>
                  <Input
                    placeholder="admin@gestcars.com"
                    className="text-white bg-white/20 border-white/30 placeholder:text-gray-300 focus:border-white focus:ring-white/40"
                    {...register("email", {
                      required: "Email obligatoire",
                      pattern: {
                        value: /^\S+@\S+$/i,
                        message: "Email invalide",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-200">Mot de passe</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="text-white bg-white/20 border-white/30 placeholder:text-gray-300 focus:border-white focus:ring-white/40"
                    {...register("password", {
                      required: "Mot de passe obligatoire",
                    })}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="
                    w-full mt-2
                    bg-white text-black
                    hover:bg-gray-200
                    transition-all duration-300
                    rounded-xl
                    shadow-lg hover:shadow-2xl
                    active:scale-[0.97]
                  "
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Se connecter
                </Button>

              </form>
            </CardContent>

            <CardFooter className="text-sm text-gray-300">
              © {new Date().getFullYear()} SFE Auto - Tous droits réservés
            </CardFooter>
          </Card>


          <div className="relative hidden bg-white md:block">
            <Image
              src="/sfe-auto-logo.png"
              alt="GestCars logo"
              fill
              priority
              className="object-cover"
            />
          </div>

        </div>
      </div>&
    </div>
  )
}