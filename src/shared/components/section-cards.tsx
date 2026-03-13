"use client"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/src/shared/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card"
import { useManageApi } from "@/src/app/(main)/gestionnaire/shared/useManage.api";
import { useAgenceApi } from "@/src/app/(main)/agence/shared/useAgence.api";
import { useEffect, useState } from "react";
import { Agence } from "@/src/utils/types/agence";
import { Vehicule } from "@/src/utils/types/vehicule";
import { Input } from "./ui/input";
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
  const [interventionsParAgence, setInterventionsParAgence] = useState(0);
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
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Total Interventions</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {loading ? <Spinner className="size-4" /> : totalInterventions}
              </CardTitle>
              {/* <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                  <TrendingDownIcon className="size-3" />
                  -20%
                </Badge>
              </div> */}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Total des interventions enregistrées
              </div>
              <div className="text-muted-foreground">
                Inclut toutes les interventions liées aux véhicules
              </div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Interventions en cours</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {loading ? <Spinner className="size-4" /> : interventionsEnCours}
              </CardTitle>
              {/* <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                  <TrendingUpIcon className="size-3" />
                  +12.5%
                </Badge>
              </div> */}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Nombre d'interventions actuellement en cours
              </div>
              <div className="text-muted-foreground">Interventions non terminées</div>
            </CardFooter>
          </Card>
          <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Interventions terminées</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {loading ? <Spinner className="size-4" /> : interventionsTerminees}
              </CardTitle>
              {/* <div className="absolute right-4 top-4">
                <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
                  <TrendingUpIcon className="size-3" />
                  +4.5%
                </Badge>
              </div> */}
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Nombre d'interventions qui ont été finalisées
              </div>
              <div className="text-muted-foreground">Interventions terminées et validées</div>
            </CardFooter>
          </Card>
          {/* <Card className="@container/card">
            <CardHeader className="relative">
              <CardDescription>Interventions par agence</CardDescription>
              <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
                {AgenceIntloading ? <Spinner className="size-4" /> : interventionsParAgence}
              </CardTitle>

            </CardHeader>
            <CardFooter className="flex-col items-start gap-1 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                Nombre d'interventions liées à l'agence sélectionnée
              </div>
              <div className="text-muted-foreground">
                Affiché lorsque vous sélectionnez une agence spécifique
              </div>
            </CardFooter>
          </Card> */}
        </div>  
      }
    </div>
  )
}
