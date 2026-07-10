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
import { InterventionStats } from "./shared/components/intervention-stats";
import { VehicleNotFound } from "./vehicle-not-found";
import { VehiclePreview } from "./shared/components/vehicle-apercu";
import { PhotoInterventionWizard } from "./shared/components/photo-intervention-wizard";
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
  const [accordSearch, setAccordSearch] = useState("");
  const [preFillLicensePlate, setPreFillLicensePlate] = useState("");
  const [clientId, setClientId] = useState<string>();
  const [agenceId, setAgenceId] = useState<string>();
  const [statut, setStatut] = useState<string>();

  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  const [interventionInitialPhotos, setInterventionInitialPhotos] = useState<File[]>([]);
  const [interventionInitialDescription, setInterventionInitialDescription] = useState("");

  const [pendingPhotoIntervention, setPendingPhotoIntervention] = useState<{
    photos: File[];
    description: string;
  } | null>(null);

  const [postCreateDialogOpen, setPostCreateDialogOpen] = useState(false);
  const [lastCreatedVehicle, setLastCreatedVehicle] = useState<any | null>(null);

  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  const createVehicleData = useMemo(
    () => ({ veh_licensePlate: preFillLicensePlate } as Vehicule),
    [preFillLicensePlate]
  );

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

  // Fusionne la réponse de l'API (champs persistés) avec les infos d'affichage
  // (marque, modèle, client, agence) déjà connues du formulaire, pour insérer
  // le véhicule dans la liste sans devoir tout recharger depuis le serveur.
  const buildLocalVehicle = (
    data: Partial<Vehicule>,
    created: Partial<Vehicule>,
  ): Vehicule => ({
    ...data,
    ...created,
    veh_brand: data.veh_brand,
    veh_model: data.veh_model,
    veh_client: data.veh_client,
    veh_base: data.veh_base,
    interventions: [],
  } as Vehicule);

  const handleCreateVehicle = async (data: Partial<Vehicule>) => {
    try {
      setLoading(true);
      const created = await createVehicle(data);
      const newVehicle = buildLocalVehicle(data, created);

      setVehicles((prev) => [newVehicle, ...prev]);
      toast.success("Véhicule créé");
      setOpenCreateVehiculeModal(false);
      setVehiculeNotFound(false);
      await loadAll();

      if (pendingPhotoIntervention) {
        setSelectedVehicle(created);
        setInterventionInitialPhotos(pendingPhotoIntervention.photos);
        setInterventionInitialDescription(pendingPhotoIntervention.description);
        setPendingPhotoIntervention(null);
        setInterventionModalOpen(true);
      } else {
        setLastCreatedVehicle(created);
        setPostCreateDialogOpen(true);
      }
    } catch (e: any) {
      toast.error("Erreur: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicleAndAddIntervention = async (
    data: Partial<Vehicule>,
  ) => {
    try {
      setLoading(true);
      const created = await createVehicle(data);
      const newVehicle = buildLocalVehicle(data, created);

      setVehicles((prev) => [newVehicle, ...prev]);
      toast.success("Véhicule créé");
      setOpenCreateVehiculeModal(false);
      setVehiculeNotFound(false);

      setSelectedVehicle(newVehicle);

      if (pendingPhotoIntervention) {
        setInterventionInitialPhotos(pendingPhotoIntervention.photos);
        setInterventionInitialDescription(pendingPhotoIntervention.description);
        setPendingPhotoIntervention(null);
      }

      setInterventionModalOpen(true);
    } catch (e: any) {
      toast.error("Erreur: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreateNewIntervention = () => {
    setSelectedVehicle(lastCreatedVehicle);
    setPostCreateDialogOpen(false);
    setInterventionModalOpen(true);
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

    // Recherche par numéro d'accord : mode exclusif.
    // Si l'utilisateur cherche un accord, on ignore tous les autres filtres
    // et on ne garde que les véhicules ayant une intervention avec cet accord.
    const accord = accordSearch.trim().toLowerCase();
    if (accord) {
      const byAccord = list.filter((v) =>
        v.interventions?.some((i) =>
          (i.int_accordNumber ?? "").toLowerCase().includes(accord)
        )
      );
      setFilteredVehicles(byAccord);
      return;
    }

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
  }, [vehicles, clientId, agenceId, statut, accordSearch]);

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

  const interventionStats = useMemo(() => {
    const interventions = filteredVehicles.flatMap(
      (v) => v.interventions ?? [],
    );

    return {
      total: interventions.length,
      enCours: interventions.filter((i) => i.int_status === "FIXING_STARTED")
        .length,
      terminees: interventions.filter(
        (i) => i.int_status === "FIXING_FINISHED",
      ).length,
      attente: interventions.filter(
        (i) => i.int_status === "WAITING_FOR_PARTS",
      ).length,
    };
  }, [filteredVehicles]);

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
      setInterventionInitialPhotos([]);
      setInterventionInitialDescription("");
      toast.success("Intervention créée");
    } catch (e: any) {
      toast.error("Intervention : " + e.message);
      setLoading(false);
    }
  };

  const handleNewInterventionFromVehiculePreview = () => {
    setInterventionModalOpen(true);
  };

  // useEffect(() => {
  //   socket.on("connect", () => {
  //     console.log("Socket is connected frontend");
  //     console.log(socket.id);
  //   });

  //   return () => {
  //     socket.off("connect");
  //   };
  // }, [socket.active]);

  // const session = getSession();
  return (
    <div className="h-full py-4 px-12 bg-zinc-50">
      <div className="bg-white min-h-full rounded-lg p-4">
        <h1 className="font-bold text-2xl">Page Gestionnaire</h1>

        {/* Barre de recherche */}
        <div className="flex gap-2 items-center">
          <PhotoInterventionWizard
            onVehicleMatched={(vehicle, photos, description) => {
              setSelectedVehicle(vehicle);
              setInterventionInitialPhotos(photos);
              setInterventionInitialDescription(description);
              setInterventionModalOpen(true);
            }}
            onVehicleNeedsCreation={(plate, photos, description) => {
              setPreFillLicensePlate(plate ?? "");
              setPendingPhotoIntervention({ photos, description });
              setOpenCreateVehiculeModal(true);
            }}
          />
          <div className="flex-1">
            <VehicleSearchBar
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
            />
          </div>
        </div>

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
            <InterventionStats
              total={interventionStats.total}
              enCours={interventionStats.enCours}
              terminees={interventionStats.terminees}
              attente={interventionStats.attente}
              loading={loading}
            />

            {/* LISTE VEHICULES */}
            <VehicleListCard
              filterByAllVehicule={filterByAllVehicule}
              vehicles={paginatedVehicles}
              clients={clients}
              agences={filteredAgences}
              accordSearch={accordSearch}
              onAccordSearchChange={setAccordSearch}
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
        onClose={() => {
          setOpenCreateVehiculeModal(false);
          setPendingPhotoIntervention(null);
        }}
        modalTitle="Créer un nouveau véhicule"
      >
        <AddVehiculeForm
          mode="create"
          data={createVehicleData}
          autoLookup={pendingPhotoIntervention !== null}
          onSubmit={handleCreateVehicle}
          onSubmitAndCreateIntervention={handleCreateVehicleAndAddIntervention}
          onClose={() => {
            setOpenCreateVehiculeModal(false);
            setPendingPhotoIntervention(null);
          }}
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
            vehicleId={selectedVehicle.veh_id ?? ""}
            isAbsent={Boolean(selectedVehicle.veh_absent)}
            highlightAccord={accordSearch}
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
        onClose={() => {
          setInterventionModalOpen(false);
          setInterventionInitialPhotos([]);
          setInterventionInitialDescription("");
        }}
        modalTitle="Créer une intervention"
      >
        <InterventionForm
          vehicleId={selectedVehicle?.veh_id ?? ""}
          kilometrage={selectedVehicle?.veh_kilometrage ?? ""}
          // vehicleDisplayText={`${selectedVehicle?.licensePlate} - ${selectedVehicle?.brand?.name ?? ""} ${selectedVehicle?.model?.name ?? ""}`}
          vehicleDisplayText={`${formatLicensePlate(selectedVehicle?.veh_licensePlate || "")} - ${selectedVehicle?.veh_brand?.bra_name ?? ""} ${selectedVehicle?.veh_model?.mod_name ?? ""}`}
          defaultAccordNumber="ACC-2026-001"
          initialPhotos={interventionInitialPhotos}
          initialDescription={interventionInitialDescription}
          onSubmit={handleSubmitIntervention}
          onClose={() => {
            setInterventionModalOpen(false);
            setInterventionInitialPhotos([]);
            setInterventionInitialDescription("");
          }}
          loading={loading}
        />
      </Modal>

      {/* MODAL VEHICULE CREE : SUITE LOGIQUE */}
      <Modal
        open={postCreateDialogOpen}
        onClose={() => setPostCreateDialogOpen(false)}
        modalTitle="Véhicule créé avec succès"
        modalDescription="Que souhaitez-vous faire ?"
      >
        <div className="grid grid-cols-2 gap-2 p-2">
          <Button variant="outline" onClick={() => setPostCreateDialogOpen(false)}>
            Retour à la liste
          </Button>
          <Button onClick={handlePostCreateNewIntervention}>
            Créer une intervention
          </Button>
        </div>
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
