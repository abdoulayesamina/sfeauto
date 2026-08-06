"use client";

import React from "react";
import { ClipboardList, Clock3, CheckCircle2, Ban, XCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import { Spinner } from "@/src/shared/components/spinner";

type InterventionStatsProps = {
  total: number;
  enCours: number;
  terminees: number;
  attente: number;
  annulees: number;
  refusees: number;
  loading?: boolean;
  activeStatut?: string;
  onStatutClick?: (statut: string | undefined) => void;
};

export function InterventionStats({
  total,
  enCours,
  terminees,
  attente,
  annulees,
  refusees,
  loading,
  activeStatut,
  onStatutClick,
}: InterventionStatsProps) {
  const cards = [
    {
      key: "total",
      title: "Total",
      value: total,
      subtitle: "Interventions",
      icon: ClipboardList,
      // statut: undefined,
      tone: {
        bg: "bg-gradient-to-br from-violet-50 via-white to-fuchsia-50",
        accent: "text-violet-700",
        iconBg: "bg-violet-600/10 ring-violet-600/20",
      },
      statut: "all",
    },
    {
      key: "encours",
      title: "En cours",
      value: enCours,
      subtitle: "Actives",
      icon: Clock3,
      // statut: "FIXING_STARTED",
      tone: {
        bg: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
        accent: "text-blue-700",
        iconBg: "bg-blue-600/10 ring-blue-600/20",
      },
      statut: "FIXING_STARTED",
    },
    {
      key: "terminees",
      title: "Terminées",
      value: terminees,
      subtitle: "Clôturées",
      icon: CheckCircle2,
      // statut: "FIXING_FINISHED",
      tone: {
        bg: "bg-gradient-to-br from-emerald-50 via-white to-teal-50",
        accent: "text-emerald-700",
        iconBg: "bg-emerald-600/10 ring-emerald-600/20",
      },
      statut: "FIXING_FINISHED",
    },
    {
      key: "attente",
      title: "En attente de pièces",
      value: attente,
      subtitle: "Attente de pièce",
      icon: CheckCircle2,
      // statut: "WAITING_FOR_PARTS",
      tone: {
        bg: "bg-gradient-to-br from-amber-50 via-white to-orange-50",
        accent: "text-orange-700",
        iconBg: "bg-orange-600/10 ring-orange-600/20",
      },
      statut: "WAITING_FOR_PARTS",
    },
    {
      key: "annulees",
      title: "Annulées",
      value: annulees,
      subtitle: "Interventions annulées",
      icon: Ban,
      tone: {
        bg: "bg-gradient-to-br from-red-50 via-white to-rose-50",
        accent: "text-red-700",
        iconBg: "bg-red-600/10 ring-red-600/20",
      },
      statut: "ANNULEE",
    },
    {
      key: "refusees",
      title: "Refusées",
      value: refusees,
      subtitle: "Accord refusé",
      icon: XCircle,
      tone: {
        bg: "bg-gradient-to-br from-red-50 via-white to-pink-50",
        accent: "text-rose-700",
        iconBg: "bg-rose-600/10 ring-rose-600/20",
      },
      statut: "REFUSE",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-1 sm:mt-2">
      {cards.map((c) => {
        const isActive =
          c.statut === undefined
            ? !activeStatut || activeStatut === "all"
            : activeStatut === c.statut;

        return (
        <Card
          key={c.key}
          onClick={() =>
            onStatutClick?.(isActive ? undefined : c.statut)
          }
          className={`@container/card group relative overflow-hidden rounded-xl sm:rounded-2xl border
          shadow-[0_6px_18px_rgba(0,0,0,0.06)]
          hover:shadow-[0_10px_28px_rgba(0,0,0,0.09)] transition-all cursor-pointer ${c.tone.bg} ${
            isActive
              ? "border-gray-900/70 ring-2 ring-gray-900/20"
              : "border-gray-200/60"
          }`}
        >

          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-white/0" />
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/70 blur-2xl opacity-70 group-hover:opacity-90 transition-opacity" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />

          <CardHeader className="relative p-2 sm:p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[11px] sm:text-sm font-medium text-gray-900 truncate">
                  {c.title}
                </div>
              </div>
              <div
                className={`hidden sm:grid place-items-center h-8 w-8 rounded-xl shrink-0 ${c.tone.iconBg} ring-1`}
              >
                <c.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${c.tone.accent}`} />
              </div>
            </div>

            <CardTitle className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-semibold tabular-nums tracking-tight text-gray-900">
              {loading ? (
                <span className="inline-flex items-center">
                  <Spinner className={`size-4 ${c.tone.accent}`} />
                </span>
              ) : (
                c.value
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        );
      })}
    </div>
  );
}
