"use client";
import {
  Building2,
  CheckCircle2,
  Clock3,
  ClipboardList,
  SearchX,
  Eye,
  XCircle,
  Ban,
  Hourglass,
  PackageX,
} from "lucide-react";

import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import { useInterventionsStatsApi } from "@/src/shared/hooks/useInterventionsStats.api";
import { useAgenceApi } from "@/src/app/(main)/agence/shared/useAgence.api";
import { useManageApi } from "@/src/app/(main)/gestionnaire/shared/useManage.api";
import { useEffect, useMemo, useState } from "react";
import { Agence } from "@/src/utils/types/agence";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Spinner } from "./spinner";
import { Client } from "@/src/utils/types/client";
import { useClientApi } from "../hooks/useClient.api";
import { Button } from "./ui/button";
import {
  getStatusMeta,
  STATUS_UI_MAP,
  computeUIStatus,
} from "@/src/utils/constants/intervention-status";
import { getInterventionAgeMeta } from "@/src/utils/constants/intervention-age";
import { Modal } from "./modal";
import IntervDetailGes from "@/src/app/(main)/gestionnaire/shared/components/Intervention";
import { Intervention } from "@/src/utils/types/intervention";

export function SectionCards({ user }: { user?: any }) {
  const { getInterventionsStats } = useInterventionsStatsApi();
  const { getAgences } = useAgenceApi();
  const { getClients } = useClientApi();
  const { getVehicles } = useManageApi();

  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [sansInterventionVehicles, setSansInterventionVehicles] = useState<any[]>([]);
  const [sansInterventionLoading, setSansInterventionLoading] = useState(false);
  const [agences, setAgences] = useState<Agence[]>([]);
  const [agencesFiltered, setAgencesFiltered] = useState<Agence[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [agenceId, setAgenceId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");

  const [nombreTotalInterventions, setNombreTotalInterventions] = useState(0);
  const [nombreInterventionsEnCours, setNombreInterventionsEnCours] = useState(0);
  const [nombreInterventionsTerminees, setNombreInterventionsTerminees] = useState(0);
  const [nombreInterventionsEnAttenteDePiece,setNombreInterventionsEnAttenteDePiece,] = useState(0);
  const [nombreInterventionsAnnulees, setNombreInterventionsAnnulees] = useState(0);
  const [nombreInterventionsRefusees, setNombreInterventionsRefusees] = useState(0);
  const [nombreInterventionsAttenteAccord, setNombreInterventionsAttenteAccord] = useState(0);
  const [nombreVehiculesSansIntervention, setNombreVehiculesSansIntervention] = useState(0);

  const [totalInterventions, setTotalInterventions] = useState<any[]>([]);
  const [interventionsEnCours, setInterventionsEnCours] = useState<any[]>([]);
  const [interventionsTerminees, setInterventionsTerminees] = useState<any[]>([]);
  const [interventionsEnAttenteDePiece, setInterventionsEnAttenteDePiece] = useState<any[]>([]);
  const [interventionsAnnulees, setInterventionsAnnulees] = useState<any[]>([]);
  const [interventionsRefusees, setInterventionsRefusees] = useState<any[]>([]);
  const [interventionsAttenteAccord, setInterventionsAttenteAccord] = useState<any[]>([]);

  const [displayedInterventions, setDisplayedInterventions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const [selectedStat, setSelectedStat] = useState<"total" | "encours" | "terminees" | "attente" | "annulees" | "refusees" | "attenteAccord" | "sansIntervention" | null>(null);

  // Compteurs des cards : viennent des stats calculées côté serveur (sur tout
  // le périmètre client/agence, pas juste ce qui a été rapatrié) quand
  // disponibles ; sinon on retombe sur un calcul local.
  const updateInterventionsStats = (
    interventions: any[] = [],
    serverStats?: {
      total: number;
      enCours: number;
      terminees: number;
      attente: number;
      attenteAccord: number;
      annulees: number;
      refusees: number;
      sansIntervention: number;
    },
  ) => {

    const sortedInterventions = [...interventions].sort(
      (a, b) =>
        new Date(b.int_updatedAt).getTime() -
        new Date(a.int_updatedAt).getTime()
    );

    setTotalInterventions(sortedInterventions);

    setSelectedStat("total");
    setDisplayedInterventions(sortedInterventions);

    const enCours = sortedInterventions.filter(
      (i) =>
        i.int_status === "FIXING_STARTED",
    );

    const terminees = sortedInterventions.filter(
      (i) => i.int_status === "FIXING_FINISHED",
    );

    const attenteDePiece = sortedInterventions.filter(
      (i) => i.int_status === "WAITING_FOR_PARTS",
    );

    const annulees = sortedInterventions.filter((i) => i.int_status === "CANCELLED");

    const refusees = sortedInterventions.filter(
      (i) => i.int_status === "REFUSED",
    );

    const attenteAccord = sortedInterventions.filter(
      (i) => i.int_status === "WAITING_FOR_APPROVAL",
    );

    setNombreTotalInterventions(serverStats?.total ?? sortedInterventions.length);
    setNombreInterventionsEnCours(serverStats?.enCours ?? enCours.length);
    setNombreInterventionsTerminees(serverStats?.terminees ?? terminees.length);
    setNombreInterventionsEnAttenteDePiece(serverStats?.attente ?? attenteDePiece.length);
    setNombreInterventionsAnnulees(serverStats?.annulees ?? annulees.length);
    setNombreInterventionsRefusees(serverStats?.refusees ?? refusees.length);
    setNombreInterventionsAttenteAccord(serverStats?.attenteAccord ?? attenteAccord.length);
    setNombreVehiculesSansIntervention(serverStats?.sansIntervention ?? 0);

    setInterventionsEnCours(enCours);
    setInterventionsTerminees(terminees);
    setInterventionsEnAttenteDePiece(attenteDePiece);
    setInterventionsAnnulees(annulees);
    setInterventionsRefusees(refusees);
    setInterventionsAttenteAccord(attenteAccord);
  };

  const fetchStats = async (scope: { clientId?: string; agenceId?: string }) => {
    const result = await getInterventionsStats(scope);
    updateInterventionsStats(result.interventions, result.stats);
  };

  const fetchSansIntervention = async () => {
    setSansInterventionLoading(true);
    try {
      const result = await getVehicles({
        clientId: clientId || undefined,
        agenceId: agenceId || undefined,
        statut: "SANS_INTERVENTION",
      });
      setSansInterventionVehicles(result.vehicles ?? []);
    } catch (error) {
      console.error("Erreur lors du chargement des véhicules sans intervention : ", error);
    } finally {
      setSansInterventionLoading(false);
    }
  };

  const displayGlobalStatistiques = () => {
    clientIdChanged("");
    setAgenceId("");
    setSearch("");
    setSearchDate("");
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [agencesRes, clientsRes] = await Promise.all([
        getAgences(),
        getClients(),
      ]);

      setAgences(agencesRes);
      setClients(clientsRes);
    } catch (error) {
      console.error("Erreur lors du chargement des données : ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setAgencesFiltered(agences);
  }, [agences]);

  // Charge les statistiques dès qu'un client et/ou une agence est
  // sélectionné(e) — un client seul agrège déjà toutes ses agences, sans
  // attendre une deuxième sélection.
  useEffect(() => {
    if (!clientId && agenceId) {
      const ag = agences.find((a) => a.bas_id === agenceId);
      if (ag?.bas_clientId) {
        clientIdChanged(ag.bas_clientId);
        return;
      }
    }

    const scope = agenceId ? { agenceId } : clientId ? { clientId } : {};
    setStatsLoading(true);
    fetchStats(scope)
      .catch((error) =>
        console.error("Erreur lors du chargement des statistiques : ", error),
      )
      .finally(() => setStatsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, agenceId]);

  const clientIdChanged = (id: string) => {
    setClientId(id);
    const agenceFiltered = id
      ? agences.filter((a) => a.bas_clientId === id)
      : agences;
    setAgencesFiltered(agenceFiltered);
  };

  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<any>();
  function handleViewDetail(inv: any): void {
    setSelectedIntervention({
      ...inv,
      int_vehicle: {
        ...inv.int_vehicle,
        veh_brand: inv.int_vehicle?.veh_brand?.bra_name ?? "",
        veh_model: inv.int_vehicle?.veh_model?.mod_name ?? "",
      },
    });
    setOpenDetailModal(true);
  }

  // const baseInterventions = useMemo(() => {
  //   if (agenceId) {
  //     return vehicles?.vehicles
  //       .filter((v: any) => v.veh_base.bas_id === agenceId)
  //       .flatMap((v: any) => v.interventions) ?? [];
  //   }
  //   return vehicles?.vehicles.flatMap((v: any) => v.interventions) ?? [];
  // }, [vehicles, agenceId]);


  // Prédicat de recherche commun (texte + date), réutilisé pour la liste et les stats
  const matchesSearch = (inv: any) => {
    const value = search.toLowerCase().trim();

    const plate = inv.int_vehicle?.veh_licensePlate?.toLowerCase() ?? "";
    const brand = inv.int_vehicle?.veh_brand?.bra_name?.toLowerCase() ?? "";
    const model = inv.int_vehicle?.veh_model?.mod_name?.toLowerCase() ?? "";

    const matchText =
      plate.includes(value) ||
      brand.includes(value) ||
      model.includes(value);

    const interventionDate = new Date(inv.int_updatedAt)
      .toISOString()
      .split("T")[0];

    const matchDate = !searchDate || interventionDate === searchDate;

    return matchText && matchDate;
  };

  // Liste affichée : périmètre du statut sélectionné (card cliquée), filtré par la recherche
  const filteredInterventions = useMemo(
    () => displayedInterventions.filter(matchesSearch),
    [displayedInterventions, search, searchDate],
  );

  // "Sans intervention" liste des véhicules (pas des interventions), filtrée par plaque/marque/modèle uniquement
  const filteredSansInterventionVehicles = useMemo(() => {
    const value = search.toLowerCase().trim();
    return sansInterventionVehicles.filter((v) => {
      const plate = v.veh_licensePlate?.toLowerCase() ?? "";
      const brand = v.veh_brand?.bra_name?.toLowerCase() ?? "";
      const model = v.veh_model?.mod_name?.toLowerCase() ?? "";
      return plate.includes(value) || brand.includes(value) || model.includes(value);
    });
  }, [sansInterventionVehicles, search]);

  // Stats des cards : TOUJOURS calculées sur l'ensemble du périmètre (totalInterventions),
  // filtré par la recherche, indépendamment de la card sélectionnée.
  const filteredStats = useMemo(() => {
    const base = totalInterventions.filter(matchesSearch);

    return {
      total: base.length,
      enCours: base.filter((i) => i.int_status === "FIXING_STARTED").length,
      terminees: base.filter((i) => i.int_status === "FIXING_FINISHED").length,
      attente: base.filter((i) => i.int_status === "WAITING_FOR_PARTS").length,
      annulees: base.filter((i) => i.int_status === "CANCELLED").length,
      refusees: base.filter((i) => i.int_status === "REFUSED").length,
      attenteAccord: base.filter((i) => i.int_status === "WAITING_FOR_APPROVAL").length,
    };
  }, [totalInterventions, search, searchDate]);

  const isFilterMode = search.trim() !== "" || searchDate !== "";


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
  //   .flatMap((v : any) => v.interventions);

  //   console.log("Interventions pour l'agence sélectionnée : ", interventions);
  //   setInterventionsParAgence(interventions.length);
  // }, [agenceId])

  return (
    <div>
      <div className="flex px-3 pt-3 sm:px-6 sm:pt-6 gap-2 flex-wrap">
        <div className="flex-1 min-w-0 max-w-xl">
          <Select
            value={clientId || "all"}
            onValueChange={(Id) => {
              if (Id === "all") {
                displayGlobalStatistiques();
              } else {
                clientIdChanged(Id);
                setAgenceId("");
              }
            }}
          >
            <SelectTrigger className="h-9 sm:h-12">
              <SelectValue placeholder={"Sélectionnez un client"} />
              {loading && <Spinner className="size-4" />}
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              <SelectItem value="all">Tous les clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.cli_id} value={c.cli_id}>
                  {c.cli_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground p-2">
            {clientId
              ? `(${agencesFiltered.length}) agence` +
                (agencesFiltered.length > 1 ? "s" : "")
              : ""}
          </p>
        </div>
        <div className="flex-1 min-w-0 max-w-xl">
          <Select
            value={agenceId || "all"}
            onValueChange={(baseId) => setAgenceId(baseId === "all" ? "" : baseId)}
          >
            <SelectTrigger className="h-9 sm:h-12">
              <SelectValue placeholder={"Sélectionnez une agence"} />
              {loading && <Spinner className="size-4" />}
            </SelectTrigger>
            <SelectContent className="z-[2000]">
              <SelectItem value="all">Toutes les agences</SelectItem>
              {agencesFiltered.map((b) => (
                <SelectItem key={b.bas_id} value={b.bas_id}>
                  {b.bas_location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* <div className="px-8 py-1 min-h-[38px]">
        {clientId ? (
          <button
            className="bg-gray-50 cursor-pointer p-1 rounded text-sm hover:bg-gray-100 "
            onClick={displayGlobalStatistiques}
          >
            Afficher les statistiques globales
          </button>
        ) : (
          ""
        )}
      </div> */}
      {
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 px-3 sm:px-6">
          {[
            {
              key: "total",
              title: "Total",
              value: loading ? (
                <Spinner className="size-4 text-white" />
              ) : (
                isFilterMode ? filteredStats.total : nombreTotalInterventions
              ),
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
              value: loading ? (
                <Spinner className="size-4 text-white" />
              ) : (
                isFilterMode ? filteredStats.enCours : nombreInterventionsEnCours
              ),
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
              value: loading ? (
                <Spinner className="size-4 text-white" />
              ) : (
                isFilterMode ? filteredStats.terminees : nombreInterventionsTerminees
              ),
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
              value: statsLoading ? (
                <Spinner className="size-4 text-white" />
              ) : (
                isFilterMode ? filteredStats.attente : nombreInterventionsEnAttenteDePiece
              ),
              subtitle: "Attente de pièce",
              icon: CheckCircle2,
              tone: {
                bg: "bg-gradient-to-br from-amber-50 via-white to-orange-50",
                accent: "text-orange-700",
                iconBg: "bg-orange-600/10 ring-orange-600/20",
              },
            },
            {
              key: "annulees",
              title: "Annulées",
              value: loading ? (
                <Spinner className="size-4 text-white" />
              ) : (
                isFilterMode ? filteredStats.annulees : nombreInterventionsAnnulees
              ),
              subtitle: "Interventions annulées",
              icon: Ban,
              tone: {
                bg: "bg-gradient-to-br from-red-50 via-white to-rose-50",
                accent: "text-red-700",
                iconBg: "bg-red-600/10 ring-red-600/20",
              },
            },
            {
              key: "refusees",
              title: "Refusées",
              value: loading ? (
                <Spinner className="size-4 text-white" />
              ) : (
                isFilterMode ? filteredStats.refusees : nombreInterventionsRefusees
              ),
              subtitle: "Accord refusé",
              icon: XCircle,
              tone: {
                bg: "bg-gradient-to-br from-red-50 via-white to-pink-50",
                accent: "text-rose-700",
                iconBg: "bg-rose-600/10 ring-rose-600/20",
              },
            },
            {
              key: "attenteAccord",
              title: "En attente d'accord",
              value: loading ? (
                <Spinner className="size-4 text-white" />
              ) : (
                isFilterMode ? filteredStats.attenteAccord : nombreInterventionsAttenteAccord
              ),
              subtitle: "Accord non confirmé",
              icon: Hourglass,
              tone: {
                bg: "bg-gradient-to-br from-purple-50 via-white to-fuchsia-50",
                accent: "text-purple-700",
                iconBg: "bg-purple-600/10 ring-purple-600/20",
              },
            },
            {
              key: "sansIntervention",
              title: "Sans intervention",
              value: loading ? (
                <Spinner className="size-4 text-white" />
              ) : (
                nombreVehiculesSansIntervention
              ),
              subtitle: "Véhicules",
              icon: PackageX,
              tone: {
                bg: "bg-gradient-to-br from-gray-50 via-white to-slate-50",
                accent: "text-gray-700",
                iconBg: "bg-gray-600/10 ring-gray-600/20",
              },
            },
          ].map((c) => (
            <Card
              key={c.title}
              onClick={() => {
                setSelectedStat(c.key as any);

                if (c.key === "total")
                  setDisplayedInterventions(totalInterventions);
                if (c.key === "encours")
                  setDisplayedInterventions(interventionsEnCours);
                if (c.key === "terminees")
                  setDisplayedInterventions(interventionsTerminees);
                if (c.key === "attente")
                  setDisplayedInterventions(interventionsEnAttenteDePiece);
                if (c.key === "annulees")
                  setDisplayedInterventions(interventionsAnnulees);
                if (c.key === "refusees")
                  setDisplayedInterventions(interventionsRefusees);
                if (c.key === "attenteAccord")
                  setDisplayedInterventions(interventionsAttenteAccord);
                // "sansIntervention" compte des véhicules, pas des
                // interventions — liste chargée à part depuis /api/vehicles.
                if (c.key === "sansIntervention") {
                  setDisplayedInterventions([]);
                  fetchSansIntervention();
                }
              }}
              className={`cursor-pointer transform transition-all hover:-translate-y-1 hover:scale-[1.02]
              @container/card group relative overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200/60
              shadow-[0_6px_18px_rgba(0,0,0,0.06)]
              hover:shadow-[0_10px_28px_rgba(0,0,0,0.09)] ${c.tone.bg}`}
            >
              <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-black/0 via-black/0 to-black/0" />
              <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-white/0" />
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/70 blur-2xl opacity-70 group-hover:opacity-90 transition-opacity" />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />

              <CardHeader className="relative p-2 sm:p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[11px] sm:text-sm font-medium text-gray-900 truncate">
                      {c.title}
                    </div>
                    <div className="hidden sm:block text-xs text-gray-600 mt-0.5 truncate">
                      {c.subtitle}
                    </div>
                  </div>
                  <div
                    className={`hidden sm:grid place-items-center h-7 w-7 lg:h-8 lg:w-8 rounded-lg lg:rounded-xl shrink-0 ${c.tone.iconBg} ring-1`}
                  >
                    <c.icon className={`h-3.5 w-3.5 lg:h-4 lg:w-4 ${c.tone.accent}`} />
                  </div>
                </div>

                <CardTitle className="mt-0.5 sm:mt-1 text-lg sm:text-xl lg:text-2xl font-semibold tabular-nums tracking-tight text-gray-900">
                  {loading || statsLoading ? (
                    <span className="inline-flex items-center">
                      <Spinner className={`size-4 ${c.tone.accent}`} />
                    </span>
                  ) : (
                    c.value
                  )}
                </CardTitle>
              </CardHeader>

              <CardFooter className="relative pt-0 pb-2 sm:pb-3 px-2 sm:px-3">
                <div className={`text-[9px] sm:text-[11px] leading-tight truncate w-full ${c.tone.accent}`}>
                  {!clientId ? "Interventions globales" : ""}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      }
      {selectedStat && (
        <div className="mt-4 sm:mt-6 lg:mt-8 px-3 sm:px-6">
          <div className="rounded-xl sm:rounded-2xl lg:rounded-3xl bg-white shadow-xl border border-gray-200/70 overflow-hidden">
            {/* Header */}
            <div className="px-3 py-2.5 sm:px-6 sm:py-4 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center justify-between gap-2 sm:gap-4 flex-wrap">

                  <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900">
                    {selectedStat === "encours" && "Interventions en cours"}
                    {selectedStat === "terminees" && "Interventions terminées"}
                    {selectedStat === "attente" && "En attente de pièces"}
                    {selectedStat === "total" && "Toutes les interventions"}
                    {selectedStat === "annulees" && "Interventions annulées"}
                    {selectedStat === "refusees" && "Interventions refusées"}
                    {selectedStat === "attenteAccord" && "En attente d'accord"}
                    {selectedStat === "sansIntervention" && "Sans intervention"}
                  </h2>

                  <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap">

                    <input
                      type="text"
                      placeholder="Plaque, marque ou modèle..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full sm:w-72 rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm"
                    />

                    <input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm"
                    />

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSearch("");
                        setSearchDate("");
                      }}
                      title={
                        isFilterMode
                          ? "Cliquez ici pour supprimer tous les filtres (recherche et/ou date)."
                          : "Aucun filtre actif."
                      }
                      className={`text-xs sm:text-sm transition-all duration-800 ${
                        isFilterMode
                          ? "border-black text-black animate-pulse hover:bg-black hover:text-white"
                          : ""
                      }`}
                    >
                      Réinitialiser
                    </Button>
                  </div>

              </div>
            </div>

            {/* Liste */}
            <div className="divide-y min-h-[300px] max-h-[300px] sm:min-h-[420px] sm:max-h-[420px] overflow-auto">
              {selectedStat === "sansIntervention" ? (
                sansInterventionLoading ? (
                  <div className="py-8 sm:py-12 lg:py-16 flex items-center justify-center">
                    <Spinner className="size-6 text-gray-400" />
                  </div>
                ) : filteredSansInterventionVehicles.length === 0 ? (
                  <div className="py-8 sm:py-12 lg:py-16 flex flex-col items-center justify-center text-center">
                    <div
                      className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br
                                      from-gray-100 to-gray-200 flex items-center justify-center shadow-sm"
                    >
                      <SearchX />
                    </div>
                    <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">
                      Aucun véhicule
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm">
                      {search ? (
                        <span>Aucun véhicule ne correspond à votre recherche.</span>
                      ) : (
                        <span>Tous les véhicules de ce périmètre ont au moins une intervention.</span>
                      )}
                    </p>
                  </div>
                ) : (
                  filteredSansInterventionVehicles.map((v) => (
                    <div
                      key={v.veh_id}
                      className="group p-2.5 sm:p-3.5 lg:p-5 flex items-center gap-2.5 sm:gap-3.5 lg:gap-5 hover:bg-gray-50 transition rounded-lg sm:rounded-xl lg:rounded-2xl"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 lg:gap-5 flex-1">
                        <div
                          className="h-9 w-9 sm:h-11 sm:w-11 lg:h-14 lg:w-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200
                                          flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-700 shadow-sm shrink-0"
                        >
                          {v.veh_brand?.bra_name?.[0] ?? ""}
                          {v.veh_model?.mod_name?.[0] ?? ""}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap lg:justify-start gap-1.5 sm:gap-3">
                            <div className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 truncate">
                              {v.veh_brand?.bra_name ?? ""} {v.veh_model?.mod_name ?? ""}
                            </div>
                            <span className="flex items-center gap-1.5 sm:gap-3">
                              <span className="text-[10px] sm:text-xs bg-gray-100 px-1.5 py-0.5 sm:px-2 rounded-md text-gray-600">
                                {v.veh_year ?? ""}
                              </span>
                              <span className="text-[10px] sm:text-xs bg-slate-100 px-1.5 py-0.5 sm:px-2 rounded-md text-gray-600">
                                {v.veh_color ?? ""}
                              </span>
                            </span>
                          </div>

                          <div className="mt-0.5 sm:mt-1 flex flex-wrap gap-1 sm:gap-1.5 text-[11px] sm:text-sm text-gray-600">
                            <span>{v.veh_client?.cli_name ?? "—"}</span>
                            <span className="text-gray-400">• {v.veh_base?.bas_location ?? "—"}</span>
                          </div>

                          <div className="text-[11px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                            Plaque :{" "}
                            <span className="font-medium text-gray-800">
                              {v.veh_licensePlate ?? ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : filteredInterventions.length === 0 ? (
                <div className="py-8 sm:py-12 lg:py-16 flex flex-col items-center justify-center text-center">
                  {/* Icône */}
                  <div
                    className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br
                                    from-gray-100 to-gray-200 flex items-center justify-center shadow-sm"
                  >
                    <SearchX />
                  </div>

                  {/* Titre */}
                  <h3 className="mt-3 sm:mt-4 text-sm sm:text-lg font-semibold text-gray-900">
                    Aucune intervention
                  </h3>

                  {/* Description */}
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 max-w-sm">
                    {
                        filteredInterventions.length === 0 && (
                            search ? (
                                <span>Aucune intervention ne correspond à votre recherche.</span>
                            ) : (
                                <span>Aucune intervention disponible pour ce statut.</span>
                            )
                        )
                    }
                  </p>
                </div>
              ) : (
                filteredInterventions.map((inv) => {
                  const uiStatus = computeUIStatus(inv);
                  const statusMeta = getStatusMeta(uiStatus);
                  const ageMeta = getInterventionAgeMeta(
                    inv.int_status,
                    inv.int_createdAt,
                  );

                  return (
                    <div
                      key={inv.int_id}
                      title={ageMeta?.title}
                      className={`group p-2.5 sm:p-3.5 lg:p-5 flex flex-col-reverse lg:flex-row lg:items-center gap-2.5 sm:gap-3.5 lg:gap-5 hover:bg-gray-50 transition rounded-lg sm:rounded-xl lg:rounded-2xl ${ageMeta?.className ?? ""}`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3.5 lg:gap-5 flex-1">
                        <div
                          className="h-9 w-9 sm:h-11 sm:w-11 lg:h-14 lg:w-14 rounded-lg sm:rounded-xl lg:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200
                                          flex items-center justify-center text-xs sm:text-sm font-semibold text-gray-700 shadow-sm shrink-0"
                        >
                          {inv.int_vehicle?.veh_brand?.bra_name[0] ?? ""}
                          {inv.int_vehicle?.veh_model?.mod_name[0] ?? ""}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between flex-wrap lg:justify-start gap-1.5 sm:gap-3">
                            <div className="text-xs sm:text-sm lg:text-base font-semibold text-gray-900 truncate">
                              {inv.int_vehicle?.veh_brand?.bra_name ?? ""}{" "}
                              {inv.int_vehicle?.veh_model?.mod_name ?? ""}
                            </div>
                            <span className="flex items-center gap-1.5 sm:gap-3">
                              <span className="text-[10px] sm:text-xs bg-gray-100 px-1.5 py-0.5 sm:px-2 rounded-md text-gray-600">
                                {inv.int_vehicle?.veh_year ?? ""}
                              </span>

                              <span className="text-[10px] sm:text-xs bg-slate-100 px-1.5 py-0.5 sm:px-2 rounded-md text-gray-600">
                                {inv.int_vehicle?.veh_color ?? ""}
                              </span>
                            </span>
                          </div>

                          <div className="mt-0.5 sm:mt-1 flex flex-wrap gap-1 sm:gap-1.5 text-[11px] sm:text-sm text-gray-600">
                            <span>{inv.int_vehicle?.veh_client?.cli_name ?? "—"}</span>
                            <span className="text-gray-400">
                              • {inv.int_vehicle?.veh_base?.bas_location ?? "—"}
                            </span>
                          </div>

                          <div className="text-[11px] sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                            Plaque :{" "}
                            <span className="font-medium text-gray-800">
                              {inv.int_vehicle?.veh_licensePlate ?? ""}
                            </span>
                          </div>

                          <div className="text-[11px] sm:text-sm mt-0.5 sm:mt-1 text-gray-500 truncate lg:max-w-[300px]">
                            {inv.int_workDescription ?? ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-start flex-row lg:items-end gap-1.5 sm:gap-2">
                        <span
                          className={`${statusMeta.bg} ${statusMeta.color}
                            text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-3 sm:py-1 rounded-full`}
                        >
                          {statusMeta.label}
                        </span>

                        <div className="text-[10px] sm:text-xs text-gray-400">
                          {new Date(inv.int_updatedAt).toLocaleString("fr-FR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <button
                          className="flex items-center gap-1 text-blue-600 text-[10px] sm:text-[12px] font-medium hover:underline"
                          onClick={() => handleViewDetail(inv)}
                        >
                          <Eye size={12} />
                          Détails
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      <Modal
        open={openDetailModal}
        onClose={() => setOpenDetailModal(false)}
        modalTitle="Détail de l'intervention"
      >
        {selectedIntervention && (
          <IntervDetailGes
            selectedIntervention={selectedIntervention}
            onClose={() => setOpenDetailModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}
