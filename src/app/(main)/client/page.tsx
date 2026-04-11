"use client";

import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react";

import { VehicleStats } from "../gestionnaire/shared/components/vehicule-stats";
import { Modal } from "@/src/shared/components/modal";
import InterventionDetailClient from "./components/detailsInterv";
import { useVehiculesApi } from "./shared/useVehicules.api";
import { Intervention } from "@/src/utils/types/intervention";
import SearchFilters from "./components/SearchFilters";
import InterventionCard from "./components/InterventionCard";
import VehicleInterventionsModal from "./components/VehicleInterventionsModal";
import EmptyState from "./components/EmptyState";
import { toUIStatus } from "@/src/utils/constants/intervention-status";

type UIStatus =
  | "ALL"
  | "CONFIRMEE"
  | "EN_COURS"
  | "TERMINEE"
  | "ATTENTE_PIECES";

export default function ClientPage() {
  const { getVehicules } = useVehiculesApi();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [interventionsVehicule, setInterventionVehicule] = useState<any[]>([]);
  const [vehiculeSelect, setVehiculeSelect] = useState<any>(null);
  const [vehiculeSelectDetails, setVehiculeSelectDetails] = useState<any>(null);

  const [filterStatus, setFilterStatus] = useState<UIStatus>("ALL");
  const [openInterventionModal, setOpenInterventionModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        setIsLoading(true);
        const data = await getVehicules();
        setVehicles(Array.isArray(data?.vehicles) ? data.vehicles : []);
      } catch (err: any) {
        console.error("Erreur récupération véhicules :", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVehicules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewInterventions = (v: any) => {
    setVehiculeSelect(v);
    setInterventionVehicule(
      Array.isArray(v.interventions) ? v.interventions : [],
    );
    setOpenInterventionModal(true);
  };

  const handleViewDetailsFromVehicle = (v: any) => {
    const interventions: Intervention[] = Array.isArray(v.interventions)
      ? v.interventions
      : [];
    if (!interventions.length) return;

    const last = interventions[interventions.length - 1];
    setVehiculeSelect(v);
    setInterventionVehicule([{ ...last, vehicle: v }]);
    setOpenDetailModal(true);
  };

  const filteredVehicles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return (Array.isArray(vehicles) ? vehicles : [])
      .map((v) => {
        if (typeof v.licensePlate === "object" || typeof v.brand?.name === "object") {
          console.warn("Malformed vehicle data detected for:", v.id, v);
        }
        return {
          ...v,
          interventions: Array.isArray(v.interventions) ? v.interventions : [],
        };
      })
      .filter((v) => {
        console.log("Voici le V en Questionnnnn !! : ", v);
        // filtre texte
        const plate = String(v.licensePlate ?? "").toLowerCase();
        const brand = String(v.brand?.name ?? "").toLowerCase();
        const model = String(v.model?.name ?? "").toLowerCase();

        const searchMatch =
          !q || plate.includes(q) || brand.includes(q) || model.includes(q);

        // filtre statut (match si au moins 1 intervention correspond)
        // let statusMatch = true
        // if (filterStatus !== "ALL") {
        //   statusMatch = v.interventions.some((i: Intervention) => toUIStatus(i.status) === filterStatus)
        // }

        let statusMatch = true;

        if (filterStatus === "CONFIRMEE") {
          statusMatch =
            v.interventions.length > 0 &&
            v.interventions.some(
              (i: any) => toUIStatus(i.status) === "CONFIRMEE",
            );
        }
        if (filterStatus === "EN_COURS") {
          statusMatch =
            v.interventions.length > 0 &&
            v.interventions.some(
              (i: any) => toUIStatus(i.status) === "EN_COURS",
            );
        }

        if (filterStatus === "ATTENTE_PIECES") {
          statusMatch =
            v.interventions.length > 0 &&
            v.interventions.some(
              (i: any) => toUIStatus(i.status) === "ATTENTE_PIECES",
            );
        }

        if (filterStatus === "TERMINEE") {
          statusMatch =
            v.interventions.length > 0 &&
            v.interventions.every(
              (i: any) => toUIStatus(i.status) === "TERMINEE",
            );
        }

        return searchMatch && statusMatch;
      });
  }, [vehicles, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = vehicles.length;

    const enCours = vehicles.filter(
      (v) =>
        Array.isArray(v.interventions) &&
        v.interventions.some(
          (i: Intervention) => toUIStatus(i.status) === "EN_COURS",
        ),
    ).length;

    const confirmee = vehicles.filter(
      (v) =>
        Array.isArray(v.interventions) &&
        v.interventions.some(
          (i: Intervention) => toUIStatus(i.status) === "CONFIRMEE",
        ),
    ).length;

    const termine = vehicles.filter(
      (v) =>
        Array.isArray(v.interventions) &&
        v.interventions.length > 0 &&
        v.interventions.every(
          (i: Intervention) => toUIStatus(i.status) === "TERMINEE",
        ),
    ).length;

    const sansIntervention = vehicles.filter(
      (v) => !Array.isArray(v.interventions) || v.interventions.length === 0,
    ).length;

    return { total, enCours, confirmee, termine, sansIntervention };
  }, [vehicles]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600">
                Chargement des interventions...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Espace Client
              </h1>
              <p className="text-gray-600">
                Suivez vos interventions en temps réel
              </p>
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <SearchFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onFilterChange={setFilterStatus}
        />

        {/* Stats */}
        <div className="mb-8">
          <VehicleStats
            total={stats.total}
            enCours={stats.enCours}
            termine={stats.termine}
            sansIntervention={stats.sansIntervention}
          />
        </div>

        {/* Liste : 1 card par véhicule */}
        {!openInterventionModal ? (
          <div className="space-y-4">
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((v) => (
                <InterventionCard
                  key={v.id}
                  intervention={{ vehicle: v }}
                  onViewInterventions={() => handleViewInterventions(v)}
                  onViewDetails={() => handleViewDetailsFromVehicle(v)}
                />
              ))
            ) : (
              <EmptyState searchQuery={searchQuery} />
            )}
          </div>
        ) : (
          <VehicleInterventionsModal
            vehicle={vehiculeSelect}
            interventions={interventionsVehicule}
            filterStatus={filterStatus}
            onClose={() => setOpenInterventionModal(false)}
            // si ton modal appelle onViewDetails(intervention, vehicle)
            onViewDetails={(intervention: any, vehicle?: any) => {
              const v = vehicle ?? vehiculeSelect;
              setVehiculeSelectDetails([{ ...intervention, vehicle: v }]);
              // setInterventionVehicule([{ ...intervention, vehicle: v }])
              setOpenDetailModal(true);
            }}
          />
        )}

        {/* Modal détail intervention */}
        <Modal
          open={openDetailModal}
          onClose={() => setOpenDetailModal(false)}
          modalTitle="Détail complet de l'intervention"
          className="max-w-4xl"
        >
          {vehiculeSelectDetails && (
            <InterventionDetailClient
              selectedIntervention={vehiculeSelectDetails[0]}
              onClose={() => setOpenDetailModal(false)}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}
