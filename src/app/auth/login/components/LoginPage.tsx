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

type LoginForm = {
  email: string
  password: string
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    console.log(data)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: "url('/2149580561.jpg')" }}
      />

      <div className="absolute inset-0 bg-black/75" />

      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 w-full flex items-center justify-center px-4">
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

          <Card className="border-0 rounded-none bg-transparent">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white text-center">
                Connexion
              </CardTitle>
              <CardDescription className="text-gray-300 text-center">
                Accédez à votre espace GestCars
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                <div className="space-y-1">
                  <Label className="text-gray-200">Email</Label>
                  <Input
                    placeholder="admin@gestcars.com"
                    className="
                      bg-white/20
                      border-white/30
                      text-white
                      placeholder:text-gray-300
                      focus:border-white
                      focus:ring-white/40
                    "
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
                    className="
                      bg-white/20
                      border-white/30
                      text-white
                      placeholder:text-gray-300
                      focus:border-white
                      focus:ring-white/40
                    "
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
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Se connecter
                </Button>

              </form>
            </CardContent>

            <CardFooter className="text-sm text-gray-300">
              © {new Date().getFullYear()} GestCars
            </CardFooter>
          </Card>

          <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-black/60 to-black/90 p-10">
            <Image
              src="/cars.png"
              alt="GestCars logo"
              width={220}
              height={140}
              className="
                drop-shadow-2xl
                animate-in fade-in zoom-in-95 duration-700
              "
            />
            <h1 className="text-4xl font-bold text-white mt-4">
              GestCars
            </h1>
          </div>

        </div>
      </div>
    </div>
  )
}
