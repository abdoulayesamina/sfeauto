"use client"
import { Building2, CheckCircle2, Clock3, ClipboardList } from "lucide-react"

import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card"
import { useManageApi } from "@/src/app/(main)/gestionnaire/shared/useManage.api";
import { useAgenceApi } from "@/src/app/(main)/agence/shared/useAgence.api";
import { useEffect, useState } from "react";
import { Agence } from "@/src/utils/types/agence";
import { Vehicule } from "@/src/utils/types/vehicule";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Spinner } from "./spinner";

export function SectionCards({user} : {user?: any} ) {
  //recup la liste des agences 
  //rzcuperer les liste des interventions 
  //  afficher : 
  // - le nombre total d'interventions
  // - le nombre d'interventions en cours
  // - le nombre d'interventions terminées
  // - le nombre d'interventions par agence

  const {getVehicles} = useManageApi();
  const {getAgences} = useAgenceApi();

  const [loading, setLoading] = useState(false);
  const [AgenceIntloading, setAgenceIntloading] = useState(false);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [vehicles, setVehicles] = useState<{vehicles : Vehicule[]} | null>(null);
  const [agenceId, setAgenceId] = useState<string>("");

  const [totalInterventions, setTotalInterventions] = useState(0);
  const [interventionsEnCours, setInterventionsEnCours] = useState(0);
  const [interventionsTerminees, setInterventionsTerminees] = useState(0);
  // const [interventionsParAgence, setInterventionsParAgence] = useState(0);
  // const [interventionsParAgence, setInterventionsParAgence] = useState<{[key: string]: number}>({});

  const loadAllData = async () => {
    try{
      setLoading(true);
      const agences = await getAgences();
      setAgences(agences);

      const vehicles = await getVehicles();
      setVehicles(vehicles);
    } catch (error) {
      console.error("Erreur lors du chargement des données : ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllData();
  }, [])

  useEffect(() => {

    console.log("Liste des vehicules : ", vehicles?.vehicles);
    
    const interventions = vehicles?.vehicles.
    filter((v : any) => v.base.id === agenceId).
    flatMap((v : any) => v.invoices);
    
    setTotalInterventions(interventions?.length || 0);

    const enCours = interventions?.filter(i => i.status === "FIXING_STARTED");
    setInterventionsEnCours(enCours?.length || 0);

    const terminees = interventions?.filter(i => i.status === "FIXING_FINISHED");
    setInterventionsTerminees(terminees?.length || 0);

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 600)

  },[agenceId])


  // useEffect(() => {
  //   if(!agenceId || !vehicles) {
  //     setInterventionsParAgence(0);
  //     return;
  //   }

  //   setAgenceIntloading(true);
  //   setTimeout(() => {
  //     setAgenceIntloading(false);
  //   }, 600)

  //   const interventions = vehicles.vehicles
  //   .filter((v : any) => v.base.id === agenceId)
  //   .flatMap((v : any) => v.invoices);

  //   console.log("Interventions pour l'agence sélectionnée : ", interventions);
  //   setInterventionsParAgence(interventions.length);
  // }, [agenceId])

  return (
    <div>
      <div className="p-6 w-full max-w-xl flex flex-col gap-2 items-start">
        {/* <Label>
          Agence 
        </Label> */}
        <Select
          // value={vehicule.baseId || ""}
          onValueChange={(baseId) => setAgenceId(baseId)}
        >
          <SelectTrigger className="h-12">
            <SelectValue
              placeholder={"Sélectionnez une agence"}
            />
            {loading && <Spinner className="size-4" />}
          </SelectTrigger>
          <SelectContent className="z-[2000]">
            {agences.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Selectionnez une agence pour afficher les statistiques
        </p>
      </div>
      {
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 px-6">
          {[
            {
              title: "Total",
              value: loading ? <Spinner className="size-4 text-white" /> : totalInterventions,
              subtitle: "Interventions",
              icon: ClipboardList,
              tone: {
                bg: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
                accent: "text-blue-700",
                iconBg: "bg-blue-600/10 ring-blue-600/20",
              },
            },
            {
              title: "En cours",
              value: loading ? <Spinner className="size-4 text-white" /> : interventionsEnCours,
              subtitle: "Actives",
              icon: Clock3,
              tone: {
                bg: "bg-gradient-to-br from-amber-50 via-white to-orange-50",
                accent: "text-orange-700",
                iconBg: "bg-orange-600/10 ring-orange-600/20",
              },
            },
            {
              title: "Terminées",
              value: loading ? <Spinner className="size-4 text-white" /> : interventionsTerminees,
              subtitle: "Clôturées",
              icon: CheckCircle2,
              tone: {
                bg: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
                accent: "text-emerald-700",
                iconBg: "bg-emerald-600/10 ring-emerald-600/20",
              },
            },
            // {
            //   title: "Par agence",
            //   value: AgenceIntloading ? <Spinner className="size-4 text-white" /> : interventionsParAgence,
            //   subtitle: agenceId ? "Sélectionnée" : "Choisir une agence",
            //   icon: Building2,
            //   tone: {
            //     bg: "bg-gradient-to-br from-violet-50 via-white to-fuchsia-50",
            //     accent: "text-violet-700",
            //     iconBg: "bg-violet-600/10 ring-violet-600/20",
            //   },
            // },
          ].map((c) => (
            <Card
              key={c.title}
              className={`@container/card group relative overflow-hidden rounded-3xl border border-gray-200/60 shadow-[0_12px_34px_rgba(0,0,0,0.08)] hover:shadow-[0_18px_52px_rgba(0,0,0,0.10)] transition-shadow ${c.tone.bg}`}
            >
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-black/0 via-black/0 to-black/0" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-white/0" />
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/70 blur-2xl opacity-70 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />

              <CardHeader className="relative">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900">{c.title}</div>
                    <div className="text-xs text-gray-600 mt-0.5">{c.subtitle}</div>
                  </div>
                  <div
                    className={`grid place-items-center h-10 w-10 rounded-2xl ${c.tone.iconBg} ring-1`}
                  >
                    <c.icon className={`h-5 w-5 ${c.tone.accent}`} />
                  </div>
                </div>

                <CardTitle className="mt-4 @[250px]/card:text-4xl text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
                  {loading || AgenceIntloading ? (
                    <span className="inline-flex items-center">
                      <Spinner className={`size-4 ${c.tone.accent}`} />
                    </span>
                  ) : (
                    c.value
                  )}
                </CardTitle>
              </CardHeader>

              <CardFooter className="relative pt-0">
                <div className={`text-xs ${c.tone.accent}`}>
                  {c.title === "Par agence"
                    ? "Filtré par agence"
                    : "Vue d’ensemble"}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>  
      }
    </div>
  )
}
