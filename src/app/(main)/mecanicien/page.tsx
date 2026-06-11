"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/shared/components/ui/select";
import {
  Car,
  Calendar,
  User,
  MapPin,
  Eye,
  Wrench,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Clock,
  SearchX,
} from "lucide-react";
import { useBases } from "./shared/useBases.api";
import { useStatusInt } from "./shared/useStatusInt.api";
import { useInterventions } from "./shared/useinterventions.api";
import { useClients } from "./shared/useClient.api";
import InterventionDetail from "./shared/components/intervention-detail";
import { Modal } from "@/src/shared/components/modal";
import { Spinner } from "@/src/shared/components/spinner";
import { errorAlert } from "@/src/lib/alerts";
import { toast } from "sonner";

export const statusStyles: Record<string, string> = {
  EN_COURS: "bg-blue-100 text-blue-700",
  ATTENTE_PIECES: "bg-orange-100 text-orange-700",
  TERMINEE: "bg-green-100 text-green-700",
};

const STATUS_UI_MAP: Record<string, string> = {
  EN_REPARATION: "EN_COURS",
  FIXING_STARTED: "EN_COURS",
  WAITING_FOR_PARTS: "ATTENTE_PIECES",
  FIXING_FINISHED: "TERMINEE",
  TERMINE: "TERMINEE",
};
export const getStatusMeta = (status?: string) => {
  switch (status) {
    case "FIXING_STARTED":
      return {
        label: "Réparation en cours",
        icon: Wrench,
        color: "text-blue-700",
        bg: "bg-blue-100",
      };
    case "WAITING_FOR_PARTS":
      return {
        label: "En attente de pièces",
        icon: Clock,
        color: "text-orange-700",
        bg: "bg-orange-100",
      };
    case "FIXING_DONE":
      return {
        label: "Réparation terminée",
        icon: CheckCircle2,
        color: "text-green-700",
        bg: "bg-green-100",
      };
    case "CANCELLED":
      return {
        label: "Annulée",
        icon: XCircle,
        color: "text-red-700",
        bg: "bg-red-100",
      };
    default:
      return {
        label: "Statut inconnu",
        icon: AlertTriangle,
        color: "text-gray-600",
        bg: "bg-gray-100",
      };
  }
};
export const translateStatus = (status?: string): string => {
  if (!status) return "Statut inconnu";
  return STATUS_TRANSLATIONS[status] ?? status;
};

const STATUS_TRANSLATIONS: Record<string, string> = {
  FIXING_STARTED: "Réparation en cours",
  WAITING_FOR_PARTS: "En attente de pièces",
  FIXING_DONE: "Réparation terminée",
  CANCELLED: "Annulée",
};

export default function MecanicienPage() {
  const [filterStatus, setFilterStatus] = useState<
    "EN_COURS" | "TERMINEE" | "ATTENTE_PIECES" | "EN_ATTENTE-ACCORD" | ""
  >("EN_COURS");
  const [clientId, setClientId] = useState<string>();
  const [baseId, setBaseId] = useState<string>();
  const [searchValue, setSearchValue] = useState("");
  const [interventionId, setInterventionId] = useState<number | null>(0);

  const { clients } = useClients();
  const { bases } = useBases(clientId);
  const [filteredBases, setFilteredBases] = useState<any[]>([]);

  useEffect(() => {
    setFilteredBases(bases);
  }, [bases]);

  const { interventions, setInterventions, loading } = useInterventions(
    filterStatus,
    clientId,
    baseId,
    searchValue,
  );

  const {
    updateStatus,
    loading: statusLoading,
    error: statusError,
  } = useStatusInt();

  const openModal = (intervention: any) => {
    setSelectedIntervention(intervention);
    setOpen(true);
  };
  const [open, setOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null);
  const [filteredInterventions, setFilteredInterventions] = useState<any[]>([]);


  // const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = String(e.target.value).toLowerCase().trim();
  //   if (value === "") {
  //     const filtered = interventions.filter(
  //       (inv: any) => STATUS_UI_MAP[inv.status] === filterStatus,
  //     );
  //     setFilteredInterventions(filtered);
  //     return;
  //   }
  //   const filtered = interventions.filter((inv: any) => {
  //     const plate = String(inv.vehicle.licensePlate ?? "").toLowerCase();
  //     const accord = String(inv.accordNumber ?? "").toLowerCase();
  //     return plate.includes(value) || accord.includes(value);
  //   });
  //   const filteredAfterTrim = filtered.filter(
  //     (inv: any) => STATUS_UI_MAP[inv.status] === filterStatus,
  //   );
  //   setFilteredInterventions(filteredAfterTrim);
  // };


  const applyFilters = useCallback(() => {
    if (!Array.isArray(interventions)) {
      setFilteredInterventions([]);
      return;
    }

    let result = [...interventions];

    // Note: Status, search, client, and base are now filtered server-side.
    // We only need to handle special client-side cases here if any.
    // For "EN_ATTENTE-ACCORD", it's currently a client-side filter.
    if (filterStatus === "EN_ATTENTE-ACCORD") {
      result = result.filter(
        (inv: any) => !inv.accordNumber
      );
    }

    setFilteredInterventions(result);
  }, [interventions, filterStatus]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  return (
    <div className="bg-zinc-50 min-h-screen p-4 sm:p-8">
      <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <Wrench />
          </div>
          <h1 className="text-2xl font-bold">Espace Mécanicien</h1>
        </div>

        {/* Filtres */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select
              value={clientId || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setClientId("");
                  setBaseId("");
                  setFilteredBases(bases);
                } else {
                  setClientId(value);
                  setBaseId("");
                  const clientBases = bases.filter(
                    (b) => b.client.id === value,
                  );
                  setFilteredBases(clientBases);
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les clients</SelectItem>{" "}
                {Array.isArray(clients) && clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={baseId || "all"}
              onValueChange={(value) => {
                if (value === "all") {
                  setBaseId("");
                } else {
                  setBaseId(value);
                  const selectedBase = bases.find((b) => b.id === value);

                  if (selectedBase && selectedBase.client.id !== clientId) {
                    setClientId(selectedBase.client.id);
                    const clientBases = bases.filter(
                      (b) => b.client.id === selectedBase.client.id,
                    );
                    setFilteredBases(clientBases);
                  }
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Agence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les agences</SelectItem>
                {filteredBases.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Rechercher plaque ou accord..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                if (e.target.value === "") {
                  setFilterStatus("EN_COURS");
                  return;
                } else {
                  setFilterStatus("");
                }
              }}
            // value={search}
            />
            <Button size="icon" variant="outline">
              <Search size={18} />
            </Button>
          </div>
        </div>

        {/* Statut filter */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setFilterStatus("EN_ATTENTE-ACCORD")}
            variant={filterStatus === "EN_ATTENTE-ACCORD" ? "default" : "outline"}
          >
            En attente d'accord
          </Button>
          <Button
            onClick={() => setFilterStatus("EN_COURS")}
            variant={filterStatus === "EN_COURS" ? "default" : "outline"}
          >
            En cours
          </Button>

          <Button
            onClick={() => setFilterStatus("ATTENTE_PIECES")}
            variant={filterStatus === "ATTENTE_PIECES" ? "default" : "outline"}
          >
            En attente de pièces
          </Button>

          <Button
            onClick={() => setFilterStatus("TERMINEE")}
            variant={filterStatus === "TERMINEE" ? "default" : "outline"}
          >
            Terminées
          </Button>
        </div>

        {/* Liste */}
        <div className="space-y-4 max-h-[700px] overflow-y-auto">
          {loading && <p>Chargement...</p>}
          {!loading && filteredInterventions.length === 0 && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              {/* Icône */}
              <div
                className="h-16 w-16 rounded-2xl bg-gradient-to-br 
                              from-gray-100 to-gray-200 flex items-center justify-center shadow-sm"
              >
                <SearchX />
              </div>

              {/* Titre */}
              <h3 className="mt-4 text-sm text-gray-900">
                Aucune intervention
              </h3>
            </div>
          )}
          {!loading &&
            filteredInterventions.map((inv) => {
              const uiStatus = STATUS_UI_MAP[inv.status];

              return (
                <div
                  key={inv.id}
                  className="border rounded-xl p-5 flex flex-col gap-4 lg:flex-row lg:items-center hover:shadow-md transition"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* <Car className="text-gray-400 mt-1" /> */}
                    <Car size={18} className="text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-bold">{inv.vehicle.licensePlate}</p>
                      <p className="text-sm text-gray-500">
                        {inv.vehicle.brand} {inv.vehicle.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 flex-1">
                    {/* <Calendar className="text-gray-400 mt-1" /> */}
                    <Calendar
                      size={18}
                      className="text-gray-400 mt-1 shrink-0"
                    />
                    <div>
                      <p className="font-medium">{inv.accordNumber || "—"}</p>
                      <p className="text-sm text-gray-500">
                        {inv.createdAt.slice(0, 10)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 flex-1">
                    <User size={18} className="text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="font-medium">{inv.vehicle.client.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} />
                        {inv.vehicle.base.location}
                      </p>
                    </div>
                  </div>

                  <Select
                    onValueChange={async (val) => {
                      setInterventionId(inv.id);
                      const result = await updateStatus(inv.id, val as any);

                      if (!result.success) {
                        setInterventionId(null);
                        return errorAlert("Erreur", result.message);
                      }

                      setInterventionId(null);
                      setInterventions((prev: any) =>
                        prev.map((item: any) =>
                          item.id === inv.id
                            ? { ...item, status: result.data.status }
                            : item,
                        ),
                      );

                      setInterventions((prev: any) =>
                        prev.map((item: any) =>
                          item.id === inv.id
                            ? {
                              ...item,
                              status:
                                Object.keys(STATUS_UI_MAP).find(
                                  (key) => STATUS_UI_MAP[key] === val,
                                ) || item.status,
                            }
                            : item,
                        ),
                      );
                    }}
                    value={uiStatus}
                  >
                    <SelectTrigger
                      className={`w-[180px] ${statusStyles[uiStatus]}`}
                      disabled={inv.id == interventionId}
                    >
                      {inv.id == interventionId ? <Spinner /> : ""}
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EN_COURS">En cours</SelectItem>
                      <SelectItem value="ATTENTE_PIECES">
                        Attente pièces
                      </SelectItem>
                      <SelectItem value="TERMINEE">Terminée</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => openModal(inv)}
                  >
                    <Eye size={16} />
                    Détails
                  </Button>
                </div>
              );
            })}
        </div>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        modalTitle="Détail de l'intervention"
      >
        <InterventionDetail
          selectedIntervention={selectedIntervention}
          onClose={() => setOpen(false)}
          getStatusMeta={getStatusMeta}
          translateStatus={translateStatus}
        />
      </Modal>
    </div>
  );
}
