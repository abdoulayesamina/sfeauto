"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/src/shared/components/modal";
import { Button } from "@/src/shared/components/ui/button";
import { Vehicule } from "@/src/utils/types/vehicule";
import { useManageApi } from "./shared/useManage.api";
import { useClientApi } from "@/src/shared/hooks/useClient.api";
import { useAgenceApi } from "@/src/shared/hooks/useAgence.api";
import { AddVehiculeForm } from "./form/add-vehicule-form";
import { VehicleSearchBar } from "./shared/components/vehicle-search-bar";
import { VehicleListCard } from "./shared/components/vehicle-list-card";
import { VehicleFilters } from "./shared/components/vehicle-filters";
import { VehicleStats } from "./shared/components/vehicule-stats";
import { VehicleNotFound } from "./vehicle-not-found";
import { VehiclePreview } from "./shared/components/vehicle-apercu";
import { errorAlert, successAlert } from "@/src/lib/alerts";
import { useInterventionApi } from "./shared/useIntervention.api";
import { InterventionForm } from "./form/intervention-form";
import { toast } from "sonner";
import {
  getBrandNameById,
  getModelNameById,
} from "../brands/shared/hooks/GetBrandOrModelName";
import { formatLicensePlate } from "@/src/utils/formatters";
import { searchSmart } from "@/src/utils/searchSmart";
import { VehiclePagination } from "./shared/components/pagination";

export default function GestionnairePage() {
  const { getVehicles, searchVehicles, createVehicle } = useManageApi();
  const { getClients } = useClientApi();
  const { getAgences } = useAgenceApi();
  const { createIntervention } = useInterventionApi();

  const [vehicles, setVehicles] = useState<Vehicule[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [agences, setAgences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [vehiculeNotFound, setVehiculeNotFound] = useState(false);
  const [openCreateVehiculeModal, setOpenCreateVehiculeModal] = useState(false);
  const [openEditVehiculeModal, setOpenEditVehiculeModal] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState<any | null>(null);
  const [apercuVehiculeOpen, setApercuVehiculeOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null);

  const [filterByAllVehicule, setFilterByAllVehicule] = useState(true);
  const [search, setSearch] = useState("");
  const [preFillLicensePlate, setPreFillLicensePlate] = useState("");
  const [clientId, setClientId] = useState<string>();
  const [agenceId, setAgenceId] = useState<string>();
  const [statut, setStatut] = useState<string>();

  const [interventionModalOpen, setInterventionModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const normalizeVehicles = (v: any): Vehicule[] => {
    if (Array.isArray(v)) return v;
    if (Array.isArray(v?.vehicles)) return v.vehicles;
    return [];
  };

  const normalizeArray = <T,>(x: any): T[] => {
    return Array.isArray(x) ? x : [];
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [v, c, a] = await Promise.all([
        getVehicles({ includeInterventions: true }),
        getClients(),
        getAgences(),
      ]);

      setVehicles(normalizeVehicles(v));
      setClients(normalizeArray(c));
      setAgences(normalizeArray(a));
    } catch (e: any) {
      toast.error("Erreur", e.message);
    } finally {
      setLoading(false);
    }
  };

  // Recherche
  // const handleSearch = async () => {

  //   if (!search.trim()) {
  //     await loadAll()
  //     setVehiculeNotFound(false)
  //     return
  //   }

  //   try {
  //     const data = await searchVehicles(search)
  //     const vv = normalizeVehicles(data)

  //     setVehicles(vv)
  //     setVehiculeNotFound(vv.length === 0)
  //     if (vv.length === 0) setPreFillLicensePlate(search)
  //   } catch (e: any) {
  //     toast.error("Recherche", e.message)
  //   }
  // }

  const handleSearch = async () => {
    if (!search.trim()) {
      toast.info(
        "Vous devez entrer une plaque d'immatriculation pour lancer la recherche.",
      );
      await loadAll();
      setVehiculeNotFound(false);
      return;
    }

    try {
      const { normalized } = searchSmart(search);
      const data = await searchVehicles(normalized);
      const vv = normalizeVehicles(data);

      setVehicles(vv);
      setVehiculeNotFound(vv.length === 0);

      if (vv.length === 0) setPreFillLicensePlate(search);
    } catch (e: any) {
      toast.error("Recherche", e.message);
    }
  };

  const handleCreateVehicle = async (data: Partial<Vehicule>) => {
    try {
      setLoading(true);
      await createVehicle(data);
      toast.success("Véhicule créé");
      setLoading(false);
      setOpenCreateVehiculeModal(false);
      setVehiculeNotFound(false);
      await loadAll();
    } catch (e: any) {
      toast.error("Erreur: " + e.message);

      setLoading(false);
    }
  };

  const handleEditVehicleClick = () => {
    setVehicleToEdit(selectedVehicle);
    setOpenEditVehiculeModal(true);
  };

  const handleUpdateVehicle = async (veh: Vehicule) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/vehicles/${veh.veh_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          veh_clientId: veh.veh_clientId,
          veh_baseId: veh.veh_baseId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Échec de la modification du véhicule");
      }

      toast.success("Véhicule modifié avec succès");
      setOpenEditVehiculeModal(false);
      setApercuVehiculeOpen(false);
      await loadAll();
    } catch (e: any) {
      toast.error(e.message || "Erreur de modification");
    } finally {
      setLoading(false);
    }
  };

  const [filteredVehicles, setFilteredVehicles] = useState<Vehicule[]>([]);

  useEffect(() => {
    const list = Array.isArray(vehicles) ? vehicles : [];

    const filtered = list.filter((v) => {
      if (clientId && v.veh_client?.cli_id !== clientId) return false;
      if (agenceId && v.veh_base?.bas_id !== agenceId) return false;

      if (statut && statut !== "all") {
        if (statut === "SANS_INTERVENTION") {
          if (v.interventions && v.interventions.length > 0) return false;
        } else {
          // const lastIntervention =
          // v.interventions?.[v.interventions.length - 1];

          // if (!lastIntervention) return false;
          // if (lastIntervention.int_status !== statut) return false;
          const hasStatus = v.interventions?.some(
            (intervention) => intervention.int_status === statut
          );
          
          if (!hasStatus) return false;
        }
      }

      return true;
    });
    setFilteredVehicles(filtered);
  }, [vehicles, clientId, agenceId, statut]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredVehicles.slice(startIndex, endIndex);
  }, [filteredVehicles, currentPage, ITEMS_PER_PAGE]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  }, [filteredVehicles.length, ITEMS_PER_PAGE]);

  useEffect(() => {
    setCurrentPage(1); // On revient à la première page dès qu'on change de filtre/recherche
  }, [filteredVehicles]);

  useEffect(() => {
    if (!selectedVehicle) return;

    const updatedVehicle = vehicles.find(
      (v) => v.veh_id === selectedVehicle.veh_id,
    );
    if (updatedVehicle) {
      setSelectedVehicle(updatedVehicle);
    }
  }, [vehicles]);

  const filteredAgences = useMemo(() => {
    const list = Array.isArray(agences) ? agences : [];
    if (clientId) return list.filter((a) => a.bas_clientId === clientId);
    return list;
  }, [agences, clientId]);

  const handleSubmitIntervention = async (data: any) => {
    setLoading(true);
    try {
      console.log("Creating intervention with data:", data);
      await createIntervention({
        veh_vehicleId: selectedVehicle?.veh_id ?? "",
        veh_accordNumber: data.numeroAccord,
        veh_dateOfConfirmation: data.dateConfirmation,
        veh_workDescription: data.descriptionTravaux,
        veh_didOrderParts: data.piecesCommande === "oui",
        veh_ordersDetails: data.detailsCommande || null,
        veh_comments: data.commentaires || null,
        veh_images: data.images || [],
        veh_kilometrage: data.kilometrage || "",
      });

      await loadAll();
      // if(selectedVehicle) {
      //   const updatedVehicle = vehicles.find(v => v.id === selectedVehicle.id)
      //   setSelectedVehicle(updatedVehicle ?? null)
      // }
      setLoading(false);
      setInterventionModalOpen(false);
      toast.success("Intervention créée");
    } catch (e: any) {
      toast.error("Intervention : " + e.message);
      setLoading(false);
    }
  };

  const handleNewInterventionFromVehiculePreview = () => {
    setInterventionModalOpen(true);
  };

  // const session = getSession();
  return (
    <div className="h-full py-4 px-12 bg-zinc-50">
      <div className="bg-white min-h-full rounded-lg p-4">
        <h1 className="font-bold text-2xl">Page Gestionnaire</h1>

        {/* Barre de recherche */}
        <VehicleSearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
        />

        {!vehiculeNotFound ? (
          <>
            {/* Toggle tous / par agence */}
            <div className="flex items-center gap-2 py-3">
              <Button
                variant={filterByAllVehicule ? "default" : "outline"}
                onClick={() => setFilterByAllVehicule(true)}
              >
                Tous les véhicules
              </Button>
              <Button
                variant={!filterByAllVehicule ? "default" : "outline"}
                onClick={() => setFilterByAllVehicule(false)}
              >
                Par agence
              </Button>
            </div>

            {/* FILTRES */}
            <VehicleFilters
              clients={clients}
              agences={filteredAgences}
              clientId={clientId}
              agenceId={agenceId}
              statut={statut}
              onChange={(filters) => {
                if ("clientId" in filters) {
                  setClientId(filters.clientId);
                  setAgenceId(undefined);
                }
                if ("agenceId" in filters) setAgenceId(filters.agenceId);
                if ("statut" in filters) setStatut(filters.statut);
              }}
            />

            {/* STATS */}
            <VehicleStats
              total={filteredVehicles.length}
              // enCours={
              //   filteredVehicles.filter((v) => v.intervention?.some((i) => i.status !== "FIXING_FINISHED")).length
              // }
              enCours={
                filteredVehicles.filter((v) => {
                  const intervention = v.interventions || [];
                  return (
                    intervention.length > 0 &&
                    intervention.some((i) => i.int_status !== "FIXING_FINISHED")
                  );
                }).length
              }
              // termine={filteredVehicles.filter((v) => v.interventions?.some((i) => i.status === "FIXING_FINISHED")).length}
              termine={
                filteredVehicles.filter((v) => {
                  const interventions = v.interventions || [];
                  return (
                    interventions.length > 0 &&
                    interventions.every(
                      (i) => i.int_status === "FIXING_FINISHED",
                    )
                  );
                }).length
              }
              sansIntervention={
                filteredVehicles.filter(
                  (v) => !v.interventions || v.interventions.length === 0,
                ).length
              }
              // Somme de tout les Intervention de tous les véhicules dont le base.location est "Paris Test Agency"
              // test={filteredVehicles.filter((v) => v.base?.location === "Paris Test Agency").reduce((sum, v) => {
              //   const interventions = Array.isArray(v.interventions) ? v.interventions : []
              //   return sum + interventions.reduce((invSum, i) => invSum , 0)
              // }, 0) }
            />

            {/* LISTE VEHICULES */}
            <VehicleListCard
              filterByAllVehicule={filterByAllVehicule}
              vehicles={paginatedVehicles}
              clients={clients}
              agences={filteredAgences}
              onSelect={(v) => {
                console.log("Selected vehicle:", v);
                setSelectedVehicle(v);
                setApercuVehiculeOpen(true);
              }}
              reloadVehicles={loadAll}
            />
            <VehiclePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <VehicleNotFound
            onBack={() => {
              setVehiculeNotFound(false);
              loadAll();
            }}
            onCreate={() => setOpenCreateVehiculeModal(true)}
          />
        )}
      </div>

      {/* MODAL CREATION VEHICULE */}
      <Modal
        open={openCreateVehiculeModal}
        onClose={() => setOpenCreateVehiculeModal(false)}
        modalTitle="Créer un nouveau véhicule"
      >
        <AddVehiculeForm
          mode="create"
          data={{ veh_licensePlate: preFillLicensePlate } as Vehicule}
          onSubmit={handleCreateVehicle}
          onClose={() => setOpenCreateVehiculeModal(false)}
          loading={loading}
        />
      </Modal>

      {/* MODAL APERCU VEHICULE */}
      <Modal
        open={apercuVehiculeOpen}
        onClose={() => setApercuVehiculeOpen(false)}
        modalTitle="Aperçu véhicule"
      >
        {selectedVehicle && (
          <VehiclePreview
            // licensePlate={selectedVehicle.licensePlate}
            licensePlate={formatLicensePlate(
              selectedVehicle.veh_licensePlate || "",
            )}
            brand={selectedVehicle.veh_brand?.bra_name ?? ""}
            model={selectedVehicle.veh_model?.mod_name ?? ""}
            year={selectedVehicle.veh_year ?? 0}
            client={selectedVehicle.veh_client?.cli_name ?? ""}
            agence={selectedVehicle.veh_base?.bas_location ?? ""}
            entreeDate={selectedVehicle.veh_entryDate ?? ""}
            color={selectedVehicle.veh_color ?? ""}
            isAbsent={Boolean(selectedVehicle.veh_absent)}
            interventions={selectedVehicle.interventions ?? []}
            enReparation={1}
            termine={0}
            onNewIntervention={handleNewInterventionFromVehiculePreview}
            reloadInterventionList={loadAll}
            onEditVehicle={handleEditVehicleClick}
          />
        )}
      </Modal>

      {/* MODAL CREATION INTERVENTION */}
      <Modal
        open={interventionModalOpen}
        onClose={() => setInterventionModalOpen(false)}
        modalTitle="Créer une intervention"
      >
        <InterventionForm
          vehicleId={selectedVehicle?.veh_id ?? ""}
          kilometrage={selectedVehicle?.veh_kilometrage ?? ""}
          // vehicleDisplayText={`${selectedVehicle?.licensePlate} - ${selectedVehicle?.brand?.name ?? ""} ${selectedVehicle?.model?.name ?? ""}`}
          vehicleDisplayText={`${formatLicensePlate(selectedVehicle?.veh_licensePlate || "")} - ${selectedVehicle?.veh_brand?.bra_name ?? ""} ${selectedVehicle?.veh_model?.mod_name ?? ""}`}
          defaultAccordNumber="ACC-2026-001"
          onSubmit={handleSubmitIntervention}
          onClose={() => setInterventionModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* MODAL EDITION VEHICULE */}
      <Modal
        open={openEditVehiculeModal}
        onClose={() => setOpenEditVehiculeModal(false)}
        modalTitle="Modifier le véhicule"
      >
        {vehicleToEdit && (
          <AddVehiculeForm
            mode="edit"
            data={vehicleToEdit}
            onSubmit={handleUpdateVehicle}
            onClose={() => setOpenEditVehiculeModal(false)}
            loading={loading}
          />
        )}
      </Modal>
    </div>
  );
}
