"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card"
import { Input } from "@/src/shared/components/ui/input"
import { Label } from "@/src/shared/components/ui/label"
import { Button } from "@/src/shared/components/ui/button"
import Image from 'next/image'
import { useForm } from "react-hook-form";


export default function LoginPage() {

    const { register, handleSubmit , formState: { errors }, } = useForm();

    const onSubmit = (data: any) => {
        console.log("data : ", data);
        alert("data : " + JSON.stringify(data));
    }

    return (
        <div className="w-full max-w-[800px] flex items-center justify-center shadow-xl h-[500px] rounded-lg ">
            <div className="flex-1 h-full flex items-center justify-center">
                <div className="w-[100%]">
                    <CardHeader>
                        <CardTitle className="text-xl">Connection</CardTitle>
                        <CardDescription>
                            Entrez vos informations de connexion pour accéder à votre compte.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                        <form id="loginForm" onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    {...register("email", { required: true , pattern: {value: /^\S+@\S+$/i, message: "Email invalide"}})}
                                />
                            </div>
                            <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Mot de passe</Label>
                            </div>
                                <Input id="password" type="password" {...register("password", { required: "Mot de passe obligatoire" })} />
                            </div>
                        </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex-col gap-2 mt-10">
                        <Button type="submit" className="w-full" form="loginForm">
                            Se connecter
                        </Button>
                    </CardFooter>
                </div>
            </div>
            <div className="w-[50%] h-[100%] hidden md:flex p-2">
                <div className="bg-black  text-white rounded-lg h-[100%] w-[100%] flex items-center justify-center flex-col px-10">
                    {/* <Image src="/voiture.png" width={30} height={30} alt="voiture" className="size-20 mb-4 bg-white rounded-full p-2"/> */}
                    <span className="font-bold text-8xl">LOGO</span>
                    <span className="font-bold text-4xl">GestCars</span>
                    <span className="text-center mt-4 text-sm">
                        Bienvenue sur GestCars, votre solution complète de gestion automobile. 
                        Simplifiez la gestion de vos véhicules, suivez les entretiens, et optimisez vos opérations 
                        avec notre plateforme intuitive et conviviale.
                    </span>
                </div>
            </div>
        </div>
    );
}