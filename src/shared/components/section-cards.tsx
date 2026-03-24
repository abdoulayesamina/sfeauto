"use client"
import { Building2, CheckCircle2, Clock3, ClipboardList, SearchX, Eye } from "lucide-react"

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
import { Client } from "@/src/utils/types/client";
import { useClientApi } from "../hooks/useClient.api";
import { Button } from "./ui/button";
import { getStatusMeta, STATUS_UI_MAP } from "@/src/utils/constants/intervention-status";
import { Modal } from "./modal";
import IntervDetailGes from "@/src/app/(main)/gestionnaire/shared/components/Intervention";

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
  const { getClients } = useClientApi()

  const [loading, setLoading] = useState(false);
  const [AgenceIntloading, setAgenceIntloading] = useState(false);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [agencesFiltered, setAgencesFiltered] = useState<Agence[]>([]);
  const [clients, setClients] = useState<Client[]>([])
  const [vehicles, setVehicles] = useState<{vehicles : Vehicule[]} | null>(null);
  const [agenceId, setAgenceId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");

  const [nombreTotalInterventions, setNombreTotalInterventions] = useState(0);
  const [nombreInterventionsEnCours, setNombreInterventionsEnCours] = useState(0);
  const [nombreInterventionsTerminees, setNombreInterventionsTerminees] = useState(0);
  const [nombreInterventionsEnAttenteDePiece, setNombreInterventionsEnAttenteDePiece] = useState(0);
  
  const [totalInterventions, setTotalInterventions] = useState<any[]>([]);
  const [interventionsEnCours, setInterventionsEnCours] = useState<any[]>([]);
  const [interventionsTerminees, setInterventionsTerminees] = useState<any[]>([]);
  const [interventionsEnAttenteDePiece, setInterventionsEnAttenteDePiece] = useState<any[]>([]);

  const [selectedStat, setSelectedStat] = useState<"total" | "encours" | "terminees" | "attente" | null>(null);
  const [displayedInvoices, setDisplayedInvoices] = useState<any[]>([]);
  
  // const [interventionsParAgence, setInterventionsParAgence] = useState(0);
  // const [interventionsParAgence, setInterventionsParAgence] = useState<{[key: string]: number}>({});


  const updateInterventionsStats = (interventions: any[] = []) => {
    debugger
    setNombreTotalInterventions(interventions.length)
    setTotalInterventions(interventions)

    setSelectedStat("total")
    setDisplayedInvoices(interventions)

    const enCours = interventions.filter(
      (i) =>
        i.status === "CONFIRMED_IN_PLANNING" ||
        i.status === "FIXING_STARTED"
    )

    const terminees = interventions.filter(
      (i) => i.status === "FIXING_FINISHED"
    )

    const attenteDePiece = interventions.filter(
      (i) => i.status === "WAITING_FOR_PARTS"
    )

    setNombreInterventionsEnCours(enCours.length)
    setNombreInterventionsTerminees(terminees.length)
    setNombreInterventionsEnAttenteDePiece(attenteDePiece.length)

    setInterventionsEnCours(enCours)
    setInterventionsTerminees(terminees)
    setInterventionsEnAttenteDePiece(attenteDePiece)
  }

  const displayGlobalStatistiques = () => {
    
    clientIdChanged("")
    setAgenceId("")
    const interventions = vehicles?.vehicles.flatMap((v : any) => v.invoices) ?? [];
    updateInterventionsStats(interventions)
  }

  const loadAllData = async () => {
    try{
      setLoading(true);
      const agences = await getAgences();
      setAgences(agences);

      const vehicles = await getVehicles();
      setVehicles(vehicles);

      const clients = await getClients();
      setClients(clients)

      const interventions = vehicles?.vehicles.flatMap((v : any) => v.invoices) ?? [];
      updateInterventionsStats(interventions)

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
    setAgencesFiltered(agences)
  }, [agences])

  useEffect(() => {

    console.log("Liste des vehicules : ", vehicles?.vehicles);
    
    if(!clientId && agenceId){
      const ag = agences.find(a=>a.id === agenceId)
      clientIdChanged(ag?.clientId ?? "")
    }
    if(agenceId){
      const interventions = vehicles?.vehicles.
      filter((v : any) => v.base.id === agenceId).
      flatMap((v : any) => v.invoices);
      
      updateInterventionsStats(interventions)
  
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 600)
    }

  },[agenceId])

  const resetStats = () => {
    setSelectedStat("total")
    setDisplayedInvoices([])
    setNombreTotalInterventions(0)
    setNombreInterventionsEnCours(0)
    setNombreInterventionsTerminees(0)
    setNombreInterventionsEnAttenteDePiece(0)

    setTotalInterventions([])
    setInterventionsEnCours([])
    setInterventionsTerminees([])
    setInterventionsEnAttenteDePiece([])
  }

  const clientIdChanged = (id:string)=>{
    
    setClientId(id)
    const agenceFiltered = id ? agences.filter((a)=>a.clientId === id) : agences
    console.log("Les agences : ", agenceFiltered);
    setAgencesFiltered(agenceFiltered)
  }

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>();
  function handleViewDetail(inv: any): void {
    setSelectedInvoice({
      ...inv,
      vehicle: {
        ...inv.vehicle,
        brand: inv.vehicle.brand.name,
        model: inv.vehicle.model.name,
      }
    });
    setOpenDetailModal(true);
  }

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
      <div className="flex px-6 pt-6 gap-2 flex-wrap">
        <div className="w-full max-w-xl">
          <Select
            value={clientId}
            onValueChange={(Id) => {clientIdChanged(Id); setAgenceId("");resetStats()}}
          >
            <SelectTrigger className="h-12">
              <SelectValue
                placeholder={"Sélectionnez un client"}
              />
              {loading && <Spinner className="size-4" />}
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground p-2">
            {clientId ? `(${agencesFiltered.length}) agence`+(agencesFiltered.length>1 ? "s" : "") : ""}
          </p>
        </div>
        <div className="w-full max-w-xl">
          <Select
            value={agenceId}
            onValueChange={(baseId) => setAgenceId(baseId)}
          >
            <SelectTrigger className="h-12">
              <SelectValue
                placeholder={"Sélectionnez une agence"}
              />
              {loading && <Spinner className="size-4" />}
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              {agencesFiltered.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* <p className="text-sm text-muted-foreground">
            Selectionnez une agence 
          </p> */}
        </div>
      </div>
      <div className="px-8 py-1 min-h-[38px]">
        {clientId ? <button className="bg-gray-50 cursor-pointer p-1 rounded text-sm hover:bg-gray-100 " onClick={displayGlobalStatistiques}>Afficher les statistiques globales</button> : ""}
      </div>
      {
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 px-6">
          {[
            {
              key: "total",
              title: "Total",
              value: loading ? <Spinner className="size-4 text-white" /> : nombreTotalInterventions,
              subtitle: "Interventions",
              icon: ClipboardList,
              tone: {
                bg: "bg-gradient-to-br from-violet-50 via-white to-fuchsia-50",
                accent: "text-violet-700",
                iconBg: "bg-violet-600/10 ring-violet-600/20",
              },
            },
            {
              key: "encours",
              title: "En cours",
              value: loading ? <Spinner className="size-4 text-white" /> : nombreInterventionsEnCours,
              subtitle: "Actives",
              icon: Clock3,
              tone: {
                bg: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
                accent: "text-blue-700",
                iconBg: "bg-blue-600/10 ring-blue-600/20",
              },
            },
            {
              key: "terminees",
              title: "Terminées",
              value: loading ? <Spinner className="size-4 text-white" /> : nombreInterventionsTerminees,
              subtitle: "Clôturées",
              icon: CheckCircle2,
              tone: {
                bg: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
                accent: "text-emerald-700",
                iconBg: "bg-emerald-600/10 ring-emerald-600/20",
              },
            },
            {
              key: "attente",
              title: "En attente de pièces",
              value: AgenceIntloading ? <Spinner className="size-4 text-white" /> : nombreInterventionsEnAttenteDePiece,
              subtitle: "Attente de pièce",
              icon: CheckCircle2,
              tone: {
                bg: "bg-gradient-to-br from-amber-50 via-white to-orange-50",
                accent: "text-orange-700",
                iconBg: "bg-orange-600/10 ring-orange-600/20",
              },
            },
          ].map((c) => (
            <Card
              key={c.title}
              onClick={() => {
                setSelectedStat(c.key as any);

                if (c.key === "total") setDisplayedInvoices(totalInterventions);
                if (c.key === "encours") setDisplayedInvoices(interventionsEnCours);
                if (c.key === "terminees") setDisplayedInvoices(interventionsTerminees);
                if (c.key === "attente") setDisplayedInvoices(interventionsEnAttenteDePiece);
              }}
              className={`cursor-pointer transform transition-all hover:-translate-y-1 hover:scale-[1.02]
              @container/card group relative overflow-hidden rounded-3xl border border-gray-200/60
              shadow-[0_12px_34px_rgba(0,0,0,0.08)]
              hover:shadow-[0_18px_52px_rgba(0,0,0,0.10)] ${c.tone.bg}`}
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
                  {!clientId ? "Interventions globales du système" : ""}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>  
      }
      {selectedStat && (
        <div className="mt-8 px-6">
          <div className="rounded-3xl bg-white shadow-xl border border-gray-200/70 overflow-hidden">
            
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedStat === "encours" && "Interventions en cours"}
                {selectedStat === "terminees" && "Interventions terminées"}
                {selectedStat === "attente" && "En attente de pièces"}
                {selectedStat === "total" && "Toutes les interventions"}
              </h2>
            </div>

            {/* Liste */}
            <div className="divide-y min-h-[420px] max-h-[420px] overflow-auto">
              { displayedInvoices.length === 0 ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center">
                    
                    {/* Icône */}
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-br 
                                    from-gray-100 to-gray-200 flex items-center justify-center shadow-sm">
                      <SearchX/>
                    </div>

                    {/* Titre */}
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      Aucune intervention
                    </h3>

                    {/* Description */}
                    <p className="mt-1 text-sm text-gray-500 max-w-sm">
                      Il n’y a actuellement aucune intervention pour ce status.
                    </p>
                  </div>
                ) : (
                  displayedInvoices.map((inv) => {
                    const status = STATUS_UI_MAP[inv.status as "CONFIRMED_IN_PLANNING" | "WAITING_FOR_PARTS" | "FIXING_STARTED" | "FIXING_FINISHED"]
                    const statusMeta = getStatusMeta(status)
                    
                    return(
                      <div
                        key={inv.id}
                        className="group p-5 flex flex-col-reverse lg:flex-row lg:items-center gap-5 hover:bg-gray-50 transition rounded-2xl"
                      >
                        <div className="flex items-center gap-5 flex-1">
                          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 
                                          flex items-center justify-center text-sm font-semibold text-gray-700 shadow-sm">
                            {inv.vehicle.brand.name[0] ?? ""}
                            {inv.vehicle.model.name[0] ?? ""}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap lg:justify-start gap-3">
                              <div className="font-semibold text-gray-900 truncate">
                                {inv.vehicle.brand.name} {inv.vehicle.model.name}
                              </div>
                              <span className="flex items-center gap-3">
                                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md text-gray-600">
                                  {inv.vehicle.year}
                                </span>

                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-md text-gray-600">
                                  {inv.vehicle.color}
                                </span>
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 mt-1">
                              Plaque :{" "}
                              <span className="font-medium text-gray-800">
                                {inv.vehicle.licensePlate}
                              </span>
                            </div>

                            <div className="text-sm mt-1 text-gray-500 truncate">
                              {inv.workDescription}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-start flex-row lg:items-end gap-2">
                          <span
                            className={`${statusMeta.bg} ${statusMeta.color}
                            text-xs font-medium px-3 py-1 rounded-full`}
                          >
                            {statusMeta.label}
                          </span>

                          <div className="text-xs text-gray-400">
                            {new Date(inv.updatedAt).toLocaleDateString("fr-FR")}
                          </div>
                          <button
                            className="flex items-center gap-1 text-blue-600 text-[12px] font-medium hover:underline"
                            onClick={() => handleViewDetail(inv)}
                          >
                            <Eye size={12} />
                            Détails
                          </button>
                        </div>
                      </div>
                    )
                  })
                )
              }
            </div>
          </div>
        </div>
      )}

      <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)} modalTitle="Détail de l'intervention">
        {selectedInvoice && (
          <IntervDetailGes selectedIntervention={selectedInvoice} onClose={() => setOpenDetailModal(false)} />
        )}
      </Modal>
    </div>
  )
}
