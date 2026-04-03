"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Eye, PlusCircle, FileText, Pencil } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/modal";
import { toUIStatus, getStatusMeta } from "@/src/utils/constants/intervention-status";
import { canCreateDevis } from "@/src/utils/permissions";

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
  interventions: any[];
  enReparation?: number;
  termine?: number;
  onNewIntervention: () => void;
  reloadInterventionList: () => void;
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
  interventions,
  onNewIntervention,
  reloadInterventionList,
}: VehiclePreviewProps) {
  const { data: session } = useSession();
  const role = session?.user?.role ?? null;

  const [filteredStatus, setFilteredStatus] = useState<"EN_COURS" | "TERMINEE">("EN_COURS");
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<any>();

  const [openDevisModal, setOpenDevisModal] = useState(false);
  const [invoiceForDevis, setInterventionForDevis] = useState<any>(null);

  const [openApercu, setOpenApercu] = useState(false);
  const [targetDevisIdForApercu, setTargetDevisIdForApercu] = useState<any>(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [invoiceForEdit, setInterventionForEdit] = useState<any>(null);

  const [localInterventions, setLocalInterventions] = useState<any[]>(interventions);
  const [filteredInterventions, setFilteredInterventions] = useState<any[]>([]);

  const [detectDevis, setDetectDevis] = useState(false);

  const mappedInterventions = useMemo(() => {
    return (localInterventions ?? []).map((inv) => ({
      ...inv,
      uiStatus: toUIStatus(inv?.int_status),
    }));
  }, [localInterventions]);

  useEffect(() => {
    setLocalInterventions(interventions ?? []);
  }, [interventions]);

  useEffect(() => {
    const next = mappedInterventions.filter((inv) =>
      filteredStatus === "EN_COURS" ? inv.uiStatus !== "TERMINEE" : inv.uiStatus === "TERMINEE"
    );
    setFilteredInterventions(next);
  }, [mappedInterventions, filteredStatus, detectDevis]);

  useEffect(() => {
    if (detectDevis) setDetectDevis(false);
  }, [detectDevis]);

  const handleViewDetail = (invoice: any) => {
    setSelectedIntervention({
      ...invoice,
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

  const handleCreateDevis = (invoice: any) => {
    setInterventionForDevis(invoice);
    setOpenDevisModal(true);
  };

  const handleEditIntervention = (invoice: any) => {
    setInterventionForEdit(invoice);
    setOpenEditModal(true);
  };

  const countEnCours = useMemo(
    () => (mappedInterventions ?? []).filter((i) => i.uiStatus !== "TERMINEE").length,
    [mappedInterventions]
  );

  const countTerminee = useMemo(
    () => (mappedInterventions ?? []).filter((i) => i.uiStatus === "TERMINEE").length,
    [mappedInterventions]
  );

  return (
    <div className="rounded-xl border bg-gradient-to-r from-zinc-50 to-white p-5 shadow-sm flex flex-col gap-4">
      <div className="rounded-xl bg-gradient-to-r from-black to-gray-900 p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-4">{licensePlate}</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-white/70">Véhicule</p>
            <p className="font-semibold">
              {brand} {model}
            </p>
          </div>
          <div>
            <p className="text-white/70">Année & Couleur</p>
            <p className="font-semibold">
              {year} • {color}
            </p>
          </div>
          <div>
            <p className="text-white/70">Client</p>
            <p className="font-semibold">{client}</p>
          </div>
          <div>
            <p className="text-white/70">Base</p>
            <p className="font-semibold">{agence}</p>
          </div>
          <div>
            <p className="text-white/70">Date d’entrée</p>
            <p className="font-semibold">{entreeDate ? new Date(entreeDate).toLocaleDateString() : "—"}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant={filteredStatus === "EN_COURS" ? "default" : "outline"} onClick={() => setFilteredStatus("EN_COURS")}>
          En cours ({countEnCours})
        </Button>
        <Button variant={filteredStatus === "TERMINEE" ? "default" : "outline"} onClick={() => setFilteredStatus("TERMINEE")}>
          Terminées ({countTerminee})
        </Button>
      </div>

      <div className="mt-6 space-y-4 p-2 min-h-[350px] max-h-[350px] overflow-auto">
        {filteredInterventions.map((inv) => {
          const meta = getStatusMeta(inv?.uiStatus) ?? DEFAULT_META;
          const hasDevis = Boolean(inv?.devis?.dev_id);
          const devisId = inv?.devis?.dev_id ?? null;

          return (
            <div key={inv.int_id} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex flex-col-reverse lg:flex-row justify-between items-start gap-4">
                <div>
                  <p className="font-semibold text-zinc-800">{inv?.int_workDescription ?? "—"}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-zinc-500">
                    <span>
                      <strong>N° Accord :</strong> {inv?.int_accordNumber ?? "—"}
                    </span>
                    <span>
                      Confirmé le : {inv?.int_dateOfConfirmation ? new Date(inv.int_dateOfConfirmation).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 w-full lg:w-auto flex-wrap">
                  {hasDevis && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      Devis créé
                    </span>
                  )}

                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${meta.bg} ${meta.color}`}>
                    {meta.label}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline"
                    onClick={() => handleViewDetail(inv)}
                  >
                    <Eye size={16} />
                    Voir tous les détails
                  </button>

                  <Button variant="outline" className="flex items-center gap-2" onClick={() => handleEditIntervention(inv)}>
                    <Pencil size={16} />
                    Modifier
                  </Button>

                  {canCreateDevis(role) && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      disabled={hasDevis}
                      title={hasDevis ? "Un devis existe déjà pour cette intervention" : "Créer un devis"}
                      onClick={() => handleCreateDevis(inv)}
                    >
                      <FileText size={16} />
                      {hasDevis ? "Devis existant" : "Créer devis"}
                    </Button>
                  )}
                </div>

                {hasDevis && (
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setOpenApercu(true);
                      setTargetDevisIdForApercu(devisId);
                    }}
                  >
                    <Eye size={16} />
                    Aperçu du devis
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-2">
        <Button className="flex items-center gap-2 w-full h-[50px]" onClick={onNewIntervention}>
          <PlusCircle size={18} />
          Nouvelle intervention
        </Button>
      </div>

      <Modal open={openDetailModal} onClose={() => setOpenDetailModal(false)} modalTitle="Détail de l'intervention">
        {selectedIntervention && (
          <IntervDetailGes selectedIntervention={selectedIntervention} onClose={() => setOpenDetailModal(false)} />
        )}
      </Modal>

      {invoiceForEdit && (
        <EditInterventionModal
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          invoice={invoiceForEdit}
          onUpdated={(updated) => {
            const updatedIntervention = updated?.intervention ?? updated;
            setLocalInterventions((prev) => prev.map((x) => (x.id === updatedIntervention.id ? { ...x, ...updatedIntervention } : x)));
          }}
          reloadInvoiceList={reloadInterventionList}
        />
      )}

      {invoiceForDevis && (
        <CreateDevisModal
          open={openDevisModal}
          onClose={() => setOpenDevisModal(false)}
          invoiceId={invoiceForDevis?.int_id ?? invoiceForDevis?.id ?? ""}
          onCreated={(devis) => {
            const created = devis?.devis ?? devis
            const dev_id = created?.dev_id
            const dev_numdevis = created?.dev_numdevis

            setDetectDevis(true)

            setLocalInterventions((prev) =>
              prev.map((x) =>
                (x.int_id ?? x.id) === (invoiceForDevis?.int_id ?? invoiceForDevis?.id)
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