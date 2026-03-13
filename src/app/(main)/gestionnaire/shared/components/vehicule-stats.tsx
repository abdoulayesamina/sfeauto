"use client"

import React from "react"

type StatsCardProps = {
  title: string
  value: number | string
  description?: string
  accentClass: string
}

type VehicleStatsProps = {
  total: number
  enCours: number
  termine: number
  sansIntervention: number
  test?: number
}

function StatsCard({ title, value, description, accentClass }: StatsCardProps) {
  return (
    <div
      className={`
        group relative overflow-hidden
        rounded-3xl
        bg-white/70 backdrop-blur
        border border-white/60
        shadow-[0_10px_30px_rgba(0,0,0,0.06)]
        hover:shadow-[0_14px_44px_rgba(0,0,0,0.09)]
        transition-all duration-300
        p-5
        min-h-[112px]
        flex flex-col justify-between
      `}
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/40 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <span className={`h-2.5 w-2.5 rounded-full ${accentClass}`} />
      </div>

      <div>
        <div className="text-3xl sm:text-4xl font-semibold text-gray-900 tracking-tight leading-none">
          {value}
        </div>
        {description ? (
          <p className="text-xs text-gray-500 mt-2 line-clamp-1">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

export function VehicleStats({
  total,
  enCours,
  termine,
  sansIntervention,
  test,
}: VehicleStatsProps) {
  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total véhicules"
          value={total}
          description="Véhicules enregistrés"
          accentClass="bg-gradient-to-r from-blue-500 to-indigo-500"
        />

        <StatsCard
          title="En cours"
          value={enCours}
          description="En intervention"
          accentClass="bg-gradient-to-r from-amber-500 to-orange-500"
        />

        <StatsCard
          title="Terminés"
          value={termine}
          description="Interventions finalisées"
          accentClass="bg-gradient-to-r from-emerald-500 to-green-500"
        />

        <StatsCard
          title="Sans intervention"
          value={sansIntervention}
          description="Aucune intervention"
          accentClass="bg-gradient-to-r from-rose-500 to-red-500"
        />

        {test !== undefined ? (
          <StatsCard
            title="Test"
            value={test}
            description="Valeur de test"
            accentClass="bg-gradient-to-r from-violet-500 to-purple-500"
          />
        ) : null}

      </div>
    </section>
  )
}
