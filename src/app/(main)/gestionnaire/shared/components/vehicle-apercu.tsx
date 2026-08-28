"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, PlusCircle, FileText, Pencil, CircleSlash2, CarFront, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";
import { getStatusMeta, computeUIStatus } from "@/src/utils/constants/intervention-status";
import { getInterventionAgeMeta } from "@/src/utils/constants/intervention-age";
import { canCreateDevis } from "@/src/utils/permissions";
import { useManageApi } from "../useManage.api";
import { useInterventionApi } from "../hooks/useInterventionApi.api";
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts";

import IntervDetailGes from "./Intervention";
import { CreateDevisModal } from "./CreateDevisModal";
import { EditInterventionModal } from "./EditInterventionModal";
import { DevisApercu } from "./devisApercu";

type VehiclePreviewProps = {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  client: string;
  agence: string;
  entreeDate: string;
  color: string;
  vehicleId: string;
  isAbsent?: boolean;
  highlightAccord?: string;
  interventions: any[];
  enReparation?: number;
  termine?: number;
  onNewIntervention: () => void;
  reloadInterventionList: () => void;
  onEditVehicle?: () => void;
};

const DEFAULT_META = {
  label: "Inconnu",
  bg: "bg-zinc-100",
  color: "text-zinc-700",
};

export function VehiclePreview({
  licensePlate,
  brand,
  model,
  year,
  client,
  agence,
  entreeDate,
  color,
  vehicleId,
  isAbsent: isAbsentProp = false,
  highlightAccord = "",
  interventions,
  onNewIntervention,
  reloadInterventionList,
  onEditVehicle,
}: VehiclePreviewProps) {



  const { data: session } = useSession();
  const role = session?.user?.role ?? null;

  const { setVehicleAbsence } = useManageApi();
  const canToggleAbsence = ["MANAGER", "MECHANIC", "ADMIN"].includes(role ?? "");
  const canRestoreIntervention = ["MANAGER", "MECHANIC", "ADMIN"].includes(role ?? "");

  const { restoreIntervention } = useInterventionApi();

  const handleRestoreIntervention = async (inv: any) => {
    const confirmed = await confirmAlert(
      "Réactiver l'intervention",
      "L'intervention va être restaurée dans son état précédent. Continuer ?",
    );
    if (!confirmed) return;

    const result = await restoreIntervention(inv.int_id);
    if (!result.ok) {
      errorAlert("Erreur restauration intervention", result.error);
      return;
    }

    successAlert("Intervention restaurée avec succès");
    reloadInterventionList();
  };

  const [isAbsent, setIsAbsent] = useState<boolean>(isAbsentProp);
  const [absentLoading, setAbsentLoading] = useState(false);

  useEffect(() => {
    setIsAbsent(isAbsentProp);
  }, [isAbsentProp]);

  const handleToggleAbsence = async () => {
    if (!vehicleId || absentLoading) return;

    const next = !isAbsent;
    setAbsentLoading(true);
    setIsAbsent(next); // optimistic

    try {
      await setVehicleAbsence(vehicleId, next);
      toast.success(next ? "Véhicule marqué absent" : "Véhicule marqué présent");
      reloadInterventionList?.();
    } catch (err: any) {
      setIsAbsent(!next); // rollback
      toast.error(err?.message || "Échec de la mise à jour de l'absence");
    } finally {
      setAbsentLoading(false);
    }
  };

  const [filteredStatus, setFilteredStatus] = useState<"EN_COURS" | "TERMINEE">("EN_COURS");
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<any>();

  const [openDevisModal, setOpenDevisModal] = useState(false);
  const [interventionForDevis, setInterventionForDevis] = useState<any>(null);

  const [openApercu, setOpenApercu] = useState(false);
  const [targetDevisIdForApercu, setTargetDevisIdForApercu] = useState<any>(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [interventionForEdit, setInterventionForEdit] = useState<any>(null);

  const [localInterventions, setLocalInterventions] = useState<any[]>(interventions);
  const [filteredInterventions, setFilteredInterventions] = useState<any[]>([]);

  const [detectDevis, setDetectDevis] = useState(false);

  const mappedInterventions = useMemo(() => {
    return (localInterventions ?? []).map((inv) => ({
      ...inv,
      uiStatus: computeUIStatus(inv),
    }));
  }, [localInterventions]);

  useEffect(() => {
    setLocalInterventions(interventions ?? []);
  }, [interventions]);

  useEffect(() => {
    const next = mappedInterventions.filter((inv) =>
      filteredStatus === "EN_COURS" ? inv.uiStatus !== "TERMINEE" : inv.uiStatus === "TERMINEE"
    );
    console.log("Filtered interventions:", next);
    setFilteredInterventions(next);
  }, [mappedInterventions, filteredStatus, detectDevis]);

  useEffect(() => {
    if (detectDevis) setDetectDevis(false);
  }, [detectDevis]);

  const handleViewDetail = (intervention: any) => {
    setSelectedIntervention({
      ...intervention,
      int_vehicle: {
        veh_licensePlate: licensePlate,
        veh_brand: brand,
        veh_model: model,
        veh_year: year,
        veh_color: color,
        veh_entryDate: entreeDate,
        veh_client: { cli_name: client },
        veh_base: { bas_location: agence },
      },
    });
    setOpenDetailModal(true);
  };

  const handleCreateDevis = (intervention: any) => {
    if (isAbsent) return;
    setInterventionForDevis(intervention);
    setOpenDevisModal(true);
  };

  const handleEditIntervention = (intervention: any) => {
    if(computeUIStatus({ int_status: intervention?.int_status }) === "FIXING_FINISHED") return;
    if(computeUIStatus({ int_status: intervention?.int_status }) === "CANCELLED") return;
    if(isAbsent) return;

    setInterventionForEdit(intervention);
    setOpenEditModal(true);
  };

  const countEnCours = useMemo(
    () => (mappedInterventions ?? []).filter((i) => i.uiStatus !== "TERMINEE" && i.uiStatus !== "CANCELLED" && i.uiStatus !== "DELETED").length,
    [mappedInterventions]
  );

  const countTerminee = useMemo(
    () => (mappedInterventions ?? []).filter((i) => i.uiStatus === "TERMINEE").length,
    [mappedInterventions]
  );

  // Surlignage de l'intervention recherchée par numéro d'accord
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const accord = (highlightAccord ?? "").trim().toLowerCase();
    if (!accord) {
      setHighlightId(null);
      return;
    }

    const match = mappedInterventions.find((i) =>
      (i.int_accordNumber ?? "").toLowerCase().includes(accord)
    );

    if (!match) {
      setHighlightId(null);
      return;
    }

    // Bascule sur le bon onglet pour que l'intervention soit visible
    setFilteredStatus(match.uiStatus === "TERMINEE" ? "TERMINEE" : "EN_COURS");
    setHighlightId(match.int_id);
  }, [highlightAccord, mappedInterventions]);

  useEffect(() => {
    if (!highlightId) return;
    const el = itemRefs.current[highlightId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightId, filteredInterventions]);

  return (
    <div className="rounded-lg sm:rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-3 sm:p-4 lg:p-5 shadow-sm flex flex-col gap-3 sm:gap-4">
      <div className="rounded-lg sm:rounded-xl bg-gradient-to-r from-black to-gray-900 p-3 sm:p-5 lg:p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold order-2 sm:order-1">{licensePlate}</h1>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap order-1 sm:order-2">
            {canToggleAbsence && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={absentLoading}
                title={
                  isAbsent
                    ? "Véhicule absent — cliquer pour marquer présent"
                    : "Marquer le véhicule comme absent"
                }
                className={`border hover:text-white text-xs sm:text-sm h-auto px-2 py-1 sm:px-3 sm:py-1.5 ${
                  isAbsent
                    ? "border-red-300/40 bg-red-500/20 text-red-100 hover:bg-red-500/30"
                    : "border-white/20 text-white hover:bg-white/10"
                }`}
                onClick={handleToggleAbsence}
              >
                {isAbsent ? (
                  <CarFront size={14} className="mr-1" />
                ) : (
                  <CircleSlash2 size={14} className="mr-1" />
                )}
                {isAbsent ? "Marquer présent" : "Marquer absent"}
              </Button>
            )}

            {onEditVehicle && ["MANAGER", "ADMIN", "MECHANIC"].includes(role || "") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-white border border-white/20 hover:bg-white/10 hover:text-white text-xs sm:text-sm h-auto px-2 py-1 sm:px-3 sm:py-1.5"
                onClick={onEditVehicle}
              >
                <Pencil size={14} className="mr-1" />
                Modifier A/C
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 sm:gap-4 text-xs sm:text-sm mt-2.5 sm:mt-4">
          <div>
            <p className="text-white/70">Véhicule</p>
            <p className="font-semibold truncate">
              {brand} {model}
            </p>
          </div>
          <div>
            <p className="text-white/70">Année & Couleur</p>
            <p className="font-semibold truncate">
              {year} • {color}
            </p>
          </div>
          <div>
            <p className="text-white/70">Client</p>
            <p className="font-semibold truncate">{client}</p>
          </div>
          <div>
            <p className="text-white/70">Base</p>
            <p className="font-semibold truncate">{agence}</p>
          </div>
          <div>
            <p className="text-white/70">Date d’entrée</p>
            <p className="font-semibold truncate">{entreeDate ? new Date(entreeDate).toLocaleDateString() : "—"}</p>
          </div>
        </div>
      </div>

      {isAbsent && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium text-red-700">
          <CircleSlash2 size={18} className="shrink-0" />
          Véhicule absent : aucune action n’est possible sur ses interventions.
        </div>
      )}

      <div className="flex gap-2 sm:gap-3 mt-2 sm:mt-6">
        <Button
          size="sm"
          className="text-xs sm:text-sm h-auto px-2.5 py-1.5 sm:px-4 sm:py-2"
          variant={filteredStatus === "EN_COURS" ? "default" : "outline"}
          onClick={() => setFilteredStatus("EN_COURS")}
        >
          En cours ({countEnCours})
        </Button>
        <Button
          size="sm"
          className="text-xs sm:text-sm h-auto px-2.5 py-1.5 sm:px-4 sm:py-2"
          variant={filteredStatus === "TERMINEE" ? "default" : "outline"}
          onClick={() => setFilteredStatus("TERMINEE")}
        >
          Terminées ({countTerminee})
        </Button>
      </div>

      <div className="mt-2 sm:mt-6 space-y-2.5 sm:space-y-4 p-1 sm:p-2 min-h-[260px] max-h-[260px] sm:min-h-[350px] sm:max-h-[350px] overflow-auto">
        {filteredInterventions.map((inv) => {
          const meta = getStatusMeta(inv?.uiStatus) ?? DEFAULT_META;
          const hasDevis = Boolean(inv?.devis?.dev_id);
          const devisId = inv?.devis?.dev_id ?? null;
          const isTerminee = inv?.uiStatus === "TERMINEE";
          const isAnnulee = inv?.uiStatus === "CANCELLED" || inv?.uiStatus === "DELETED";

          // Client/agence historiques avec fallback sur le véhicule courant
          const historicalClient = inv?.int_client?.cli_name ?? client;
          const historicalAgence = inv?.int_base?.bas_location ?? agence;
          const isHistorical =
            (inv?.int_client?.cli_name && inv.int_client.cli_name !== client) ||
            (inv?.int_base?.bas_location && inv.int_base.bas_location !== agence);

          const isHighlighted = highlightId === inv.int_id;
          const ageMeta = getInterventionAgeMeta(inv?.int_status, inv?.int_createdAt);

          return (
            <div
              key={inv.int_id}
              ref={(el) => {
                itemRefs.current[inv.int_id] = el;
              }}
              title={ageMeta?.title}
              className={`rounded-lg sm:rounded-xl border bg-white p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-md transition ${
                isHighlighted
                  ? "ring-2 ring-amber-400 border-amber-300 bg-amber-50"
                  : ""
              } ${ageMeta?.className ?? ""}`}
            >
              <div className="flex flex-col-reverse lg:flex-row justify-between items-start gap-2 sm:gap-4">
                <div>
                  <p className="font-semibold text-sm sm:text-base text-zinc-800 max-w-2xl">{inv?.int_workDescription ?? "—"}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-1.5 sm:mt-2 text-xs sm:text-sm text-zinc-500">
                    <span>
                      <strong>N° Accord :</strong> {inv?.int_accordNumber ?? "—"}
                    </span>
                    <span>
                      Confirmé le : {inv?.int_dateOfConfirmation ? new Date(inv.int_dateOfConfirmation).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div
                    className={`flex flex-wrap gap-2 sm:gap-3 mt-1.5 sm:mt-2 text-[11px] sm:text-xs ${
                      isHistorical
                        ? "bg-amber-50 border border-amber-200 rounded-md px-2 py-1 text-amber-800"
                        : "text-zinc-400"
                    }`}
                    title={isHistorical ? "Ce client/agence a changé depuis cette intervention" : undefined}
                  >
                    <span>
                      <strong>Client :</strong> {historicalClient}
                    </span>
                    <span>
                      <strong>Agence :</strong> {historicalAgence}
                    </span>
                    {isHistorical && (
                      <span className="inline-flex items-center rounded-full bg-amber-200 px-2 py-0.5 font-semibold text-amber-900">
                        Historique
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1.5 sm:gap-2 w-full lg:w-auto flex-wrap">
                  {hasDevis && (
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-100 text-emerald-700">
                      Devis créé
                    </span>
                  )}

                  {isAnnulee ? (
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium bg-red-100 text-red-700">
                      Annulée
                    </span>
                  ) : (
                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-sm font-medium ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mt-2.5 sm:mt-4">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
                  <button
                    className="flex items-center gap-1.5 sm:gap-2 text-blue-600 text-xs sm:text-sm font-medium hover:underline"
                    onClick={() => handleViewDetail(inv)}
                  >
                    <Eye size={14} />
                    Voir tous les détails
                  </button>

                  {!isTerminee && !isAnnulee && !isAbsent && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-auto px-2.5 py-1 sm:px-3 sm:py-1.5"
                      onClick={() => handleEditIntervention(inv)}
                    >
                      <Pencil size={14} />
                      Modifier
                    </Button>
                  )}

                  {inv?.uiStatus === "CANCELLED" && canRestoreIntervention && !isAbsent && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-auto px-2.5 py-1 sm:px-3 sm:py-1.5 border-orange-300 text-orange-700 hover:bg-orange-50"
                      onClick={() => handleRestoreIntervention(inv)}
                    >
                      <RotateCcw size={14} />
                      Réactiver l'intervention
                    </Button>
                  )}

                  {canCreateDevis(role) && !isAnnulee && !isAbsent && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-auto px-2.5 py-1 sm:px-3 sm:py-1.5"
                      disabled={hasDevis}
                      title={hasDevis ? "Un devis existe déjà pour cette intervention" : "Créer un devis"}
                      onClick={() => handleCreateDevis(inv)}
                    >
                      <FileText size={14} />
                      {hasDevis ? "Devis existant" : "Créer devis"}
                    </Button>
                  )}
                </div>

                {hasDevis && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm h-auto px-2.5 py-1 sm:px-3 sm:py-1.5"
                    onClick={() => {
                      setOpenApercu(true);
                      setTargetDevisIdForApercu(devisId);
                    }}
                  >
                    <Eye size={14} />
                    Aperçu du devis
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-1 sm:pt-2">
        <Button
          className="flex items-center gap-2 w-full h-[42px] sm:h-[50px] text-sm sm:text-base"
          disabled={isAbsent}
          title={isAbsent ? "Véhicule absent : aucune intervention possible" : undefined}
          onClick={() => {
            if (isAbsent) return;
            onNewIntervention();
          }}
        >
          <PlusCircle size={18} />
          Nouvelle intervention
        </Button>
      </div>

      <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)} modalTitle="Détail de l'intervention">
        {selectedIntervention && (
          <IntervDetailGes selectedIntervention={selectedIntervention} onClose={() => setOpenDetailModal(false)} />
        )}
      </Modal>

      {interventionForEdit && (
        <EditInterventionModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          intervention={interventionForEdit}
          onUpdated={(updated) => {
            const updatedIntervention = updated?.intervention ?? updated;
            // setLocalInterventions((prev) => prev.map((x) => (x.id === updatedIntervention.id ? { ...x, ...updatedIntervention } : x)));
            setLocalInterventions((prev) =>
              prev.map((x) =>
                (x.int_id ?? x.id) === (updatedIntervention.int_id ?? updatedIntervention.id)
                  ? { ...x, ...updatedIntervention }
                  : x
              )
            );
          }}
          reloadInterventionList={reloadInterventionList}
        />
      )}

      {interventionForDevis && (
        <CreateDevisModal
          open={openDevisModal}
          onClose={() => setOpenDevisModal(false)}
          interventionId={interventionForDevis?.int_id ?? interventionForDevis?.id ?? ""}
          onCreated={(devis) => {
            const created = devis?.devis ?? devis
            const dev_id = created?.dev_id
            const dev_numdevis = created?.dev_numdevis

            setDetectDevis(true)

            setLocalInterventions((prev) =>
              prev.map((x) =>
                (x.int_id ?? x.id) === (interventionForDevis?.int_id ?? interventionForDevis?.id)
                  ? {
                    ...x,
                    devis: { dev_id, dev_numdevis },
                  }
                  : x
              )
            )
          }}
        />
      )}

      <Modal open={openApercu} onClose={() => setOpenApercu(false)} modalTitle="">
        <DevisApercu devisId={targetDevisIdForApercu} onClose={() => setOpenApercu(false)} />
      </Modal>
    </div>
  );
}








// return (
//     <div className="rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-5 shadow-sm flex flex-col gap-4">

//       {/* En-tête véhicule */}
//       <div className="flex items-center gap-3">
//         <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
//           <Car size={22} />
//         </div>
//         <div className="flex flex-col">
//           <span className="text-lg font-semibold text-zinc-800">{licensePlate}</span>
//           <span className="text-sm text-zinc-500">{brand} {model} • {year}</span>
//         </div>
//       </div>

//       {/* Infos client / agence / date */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//         <div className="flex items-center gap-3 rounded-lg border p-4">
//           <User className="text-zinc-400" size={18} />
//           <div>
//             <p className="text-xs text-zinc-400">Client</p>
//             <p className="font-medium text-zinc-700">{client}</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 rounded-lg border p-4">
//           <MapPin className="text-zinc-400" size={18} />
//           <div>
//             <p className="text-xs text-zinc-400">Agence</p>
//             <p className="font-medium text-zinc-700">{agence}</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 rounded-lg border p-4">
//           <Calendar className="text-zinc-400" size={18} />
//           <div>
//             <p className="text-xs text-zinc-400">Date d’entrée</p>
//             <p className="font-medium text-zinc-700">{entreeDate}</p>
//           </div>
//         </div>
//       </div>

//       {/* Statuts */}
//       <div className="flex flex-col sm:flex-row gap-3">
//         <div className="flex-1 rounded-lg bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3">
//           <Wrench className="text-yellow-600" />
//           <div>
//             <p className="text-xs text-yellow-700">En réparation</p>
//             <p className="text-xl font-bold text-yellow-800">{enReparation}</p>
//           </div>
//         </div>

//         <div className="flex-1 rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-3">
//           <CheckCircle2 className="text-green-600" />
//           <div>
//             <p className="text-xs text-green-700">Terminé</p>
//             <p className="text-xl font-bold text-green-800">{termine}</p>
//           </div>
//         </div>
//       </div>

//       {/* Bouton nouvelle intervention */}
//       <div className="flex justify-center pt-2">
//         <Button className="flex items-center gap-2" onClick={onNewIntervention}>
//           <PlusCircle size={18} />
//           Nouvelle intervention
//         </Button>
//       </div>

//     </div>
//   )