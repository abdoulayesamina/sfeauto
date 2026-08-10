"use client";

import { Card, CardContent } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";
import { Badge } from "@/src/shared/components/ui/badge";
import { Calendar, Clock, Eye, ChevronLeft, FileText } from "lucide-react";
import { getStatusMeta, computeUIStatus, STATUS_UI_MAP } from "@/src/utils/constants/intervention-status";
import InterventionStatusBadge from "./InterventionStatusBadge";
import { getInterventionAgeMeta } from "@/src/utils/constants/intervention-age";

const filterByUIStatus = (interventions: any[], status: string) => {
  if (status === "ALL") return interventions;
  
  return interventions.filter((i) => {
    const dbStatus = i.status as string; // Cast to string
    const uiStatus = STATUS_UI_MAP[dbStatus as keyof typeof STATUS_UI_MAP] || "EN_COURS";
    return uiStatus === status;
  });
};

interface VehicleInterventionsModalProps {
  vehicle: any;
  interventions: any[];
  filterStatus:
    | "ALL"
    | "EN_COURS"
    | "TERMINEE"
    | "ATTENTE_PIECES";
  onClose: () => void;
  onViewDetails: (intervention: any, vehicle: any) => void;
}

const displayValue = (v: any) => {
  if (v === null || v === undefined) return "-";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean")
    return String(v);

  if (typeof v === "object") {
    if ("name" in v && v?.name) return String(v.name);
    if ("label" in v && v?.label) return String(v.label);
    if ("title" in v && v?.title) return String(v.title);
    if ("location" in v && v?.location) return displayValue(v.location);
    return "-";
  }

  return "-";
};

export default function VehicleInterventionsModal({
  vehicle,
  interventions,
  filterStatus,
  onClose,
  onViewDetails,
}: VehicleInterventionsModalProps) {
  const filteredInterventions = filterByUIStatus(interventions, filterStatus);

  const stats = {
    total: interventions.length,
    enCours: interventions.filter((i) => STATUS_UI_MAP[i.status as keyof typeof STATUS_UI_MAP] === "EN_COURS" || STATUS_UI_MAP[i.status as keyof typeof STATUS_UI_MAP] === "FIXING_STARTED")
      .length,
    attentePieces: interventions.filter(
      (i) => STATUS_UI_MAP[i.status as keyof typeof STATUS_UI_MAP] === "ATTENTE_PIECES" || STATUS_UI_MAP[i.status as keyof typeof STATUS_UI_MAP] === "WAITING_FOR_PARTS",
    ).length,
    terminee: interventions.filter((i) => STATUS_UI_MAP[i.status as keyof typeof STATUS_UI_MAP] === "TERMINEE" || STATUS_UI_MAP[i.status as keyof typeof STATUS_UI_MAP] === "FIXING_FINISHED")
      .length,
  };

  // Affichage sécurisé des champs véhicule
  const plate = displayValue(vehicle?.licensePlate);
  const brand = displayValue(vehicle?.brand);
  const model = displayValue(vehicle?.model);
  const year = displayValue(vehicle?.year);

  const agenceLocation = displayValue(vehicle?.base?.location);

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-900"
            >
              <ChevronLeft size={20} />
              Retour
            </Button>
            <h1 className="text-xl font-semibold text-zinc-900 tracking-tight">
              Interventions du véhicule
            </h1>
          </div>

          <div className="text-sm p-4 sm:p-0 text-zinc-500 font-medium">
            {filteredInterventions.length} intervention
            {filteredInterventions.length > 1 ? "s" : ""} affichée
            {filteredInterventions.length > 1 ? "s" : ""}
          </div>
        </div>

        {/* Vehicle Info - Style très doux */}
        <div className="bg-white rounded-3xl shadow-sm border border-zinc-100 p-8 mb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <p className="uppercase text-xs tracking-widest text-zinc-500 mb-1">
                Plaque
              </p>
              <p className="text-xl font-semibold text-zinc-900">{plate}</p>
            </div>
            <div>
              <p className="uppercase text-xs tracking-widest text-zinc-500 mb-1">
                Marque & Modèle
              </p>
              <p className="text-xl font-semibold text-zinc-900">
                {brand} {model}
              </p>
            </div>
            <div>
              <p className="uppercase text-xs tracking-widest text-zinc-500 mb-1">
                Année
              </p>
              <p className="text-xl font-semibold text-zinc-900">{year}</p>
            </div>
            <div>
              <p className="uppercase text-xs tracking-widest text-zinc-500 mb-1">
                Agence
              </p>
              <p className="text-xl font-semibold text-zinc-900">
                {agenceLocation}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mt-8">
            <Badge
              variant="outline"
              className="px-5 py-2 text-sm border-zinc-200 text-zinc-700 bg-white"
            >
              <FileText size={16} className="mr-2" />
              Total : {stats.total}
            </Badge>

            {stats.enCours > 0 && (
              <Badge className="px-5 py-2 text-sm bg-blue-100 text-blue-700 border-blue-200">
                En cours : {stats.enCours}
              </Badge>
            )}
            {stats.attentePieces > 0 && (
              <Badge className="px-5 py-2 text-sm bg-amber-100 text-amber-700 border-amber-200">
                Attente pièces : {stats.attentePieces}
              </Badge>
            )}
            {stats.terminee > 0 && (
              <Badge className="px-5 py-2 text-sm bg-emerald-100 text-emerald-700 border-emerald-200">
                Terminées : {stats.terminee}
              </Badge>
            )}
          </div>
        </div>

        {/* Liste des interventions */}
        <div className="space-y-3 p-3 max-h-[500px] overflow-y-auto">
          {filteredInterventions.length > 0 ? (
            filteredInterventions.map((intervention) => {
              const ageMeta = getInterventionAgeMeta(
                intervention.status,
                intervention.createdAt,
              );

              return (
              <div
                key={intervention.id}
                title={ageMeta?.title}
                className={`bg-white rounded-3xl shadow-sm border border-zinc-100 p-7 hover:shadow-md transition-shadow duration-200 group ${ageMeta?.className ?? ""}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                      <h3 className="font-semibold text-zinc-900">
                        Intervention
                      </h3>
                      <InterventionStatusBadge 
                        status={intervention.status} 
                        accordNumber={intervention.accordNumber} 
                      />
                    </div>

                    <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-zinc-600">
                      {intervention.accordNumber && (
                        <div>
                          <span className="text-zinc-500">Accord :</span>{" "}
                          <span className="font-medium">
                            {displayValue(intervention.accordNumber)}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-zinc-400" />
                        Début :{" "}
                        {intervention.createdAt
                          ? new Date(intervention.createdAt).toLocaleDateString(
                              "fr-FR",
                            )
                          : "-"}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-zinc-400" />
                        Mis à jour :{" "}
                        {intervention.statusUpdatedAt || intervention.createdAt
                          ? new Date(
                              intervention.statusUpdatedAt ||
                                intervention.createdAt,
                            ).toLocaleDateString("fr-FR")
                          : "-"}
                      </div>
                    </div>

                    {intervention.workDescription && (
                      <div className="mt-6">
                        <p className="text-zinc-500 text-sm mb-2">
                          Description des travaux
                        </p>
                        <p className="text-zinc-700 leading-relaxed line-clamp-3 text-[15px]">
                          {displayValue(intervention.workDescription)}
                        </p>
                      </div>
                    )}
                   
                    {intervention.comments && (
                      <div className="mt-6">
                        <p className="font-bold text-sm mb-2 underline">
                          Commentaires
                        </p>
                        <p className="text-zinc-700 leading-relaxed line-clamp-3 text-[13px]">
                          {displayValue(intervention.comments)}
                        </p>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 whitespace-nowrap mt-4 lg:mt-0"
                    onClick={() => onViewDetails(intervention, vehicle)}
                  >
                    <Eye size={17} className="mr-2" />
                    Voir les détails
                  </Button>
                </div>
              </div>
              );
            })
          ) : (
            <div className="bg-white rounded-3xl p-16 text-center border border-zinc-100">
              <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-5">
                <FileText size={32} className="text-zinc-400" />
              </div>
              <p className="text-zinc-500 text-lg">
                Aucune intervention ne correspond au filtre sélectionné
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
