"use client";

import React from "react";
import { ClipboardList, Clock3, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import { Spinner } from "@/src/shared/components/spinner";

type InterventionStatsProps = {
  total: number;
  enCours: number;
  terminees: number;
  attente: number;
  loading?: boolean;
};

export function InterventionStats({
  total,
  enCours,
  terminees,
  attente,
  loading,
}: InterventionStatsProps) {
  const cards = [
    {
      key: "total",
      title: "Total",
      value: total,
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
      value: enCours,
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
      value: terminees,
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
      value: attente,
      subtitle: "Attente de pièce",
      icon: CheckCircle2,
      tone: {
        bg: "bg-gradient-to-br from-amber-50 via-white to-orange-50",
        accent: "text-orange-700",
        iconBg: "bg-orange-600/10 ring-orange-600/20",
      },
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-2">
      {cards.map((c) => (
        <Card
          key={c.key}
          className={`@container/card group relative overflow-hidden rounded-3xl border border-gray-200/60
          shadow-[0_12px_34px_rgba(0,0,0,0.08)]
          hover:shadow-[0_18px_52px_rgba(0,0,0,0.10)] transition-all ${c.tone.bg}`}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-white/20 to-white/0" />
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/70 blur-2xl opacity-70 group-hover:opacity-90 transition-opacity" />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/50" />

          <CardHeader className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {c.title}
                </div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {c.subtitle}
                </div>
              </div>
              <div
                className={`grid place-items-center h-10 w-10 rounded-2xl ${c.tone.iconBg} ring-1`}
              >
                <c.icon className={`h-5 w-5 ${c.tone.accent}`} />
              </div>
            </div>

            <CardTitle className="mt-4 @[250px]/card:text-4xl text-3xl font-semibold tabular-nums tracking-tight text-gray-900">
              {loading ? (
                <span className="inline-flex items-center">
                  <Spinner className={`size-4 ${c.tone.accent}`} />
                </span>
              ) : (
                c.value
              )}
            </CardTitle>
          </CardHeader>

          <CardFooter className="relative pt-0" />
        </Card>
      ))}
    </div>
  );
}
