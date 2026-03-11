"use client"

import React from "react"

/* ---------------------------------- */
/* 🔹 TYPES */
/* ---------------------------------- */
type StatsCardProps = {
  title: string
  value: number | string
  description: string
  accentClass: string
}

type VehicleStatsProps = {
  total: number
  enCours: number
  termine: number
  sansIntervention: number
  test?: number
}

/* ---------------------------------- */
/* 🔹 STATS CARD COMPACTE */
/* ---------------------------------- */
function StatsCard({ title, value, description, accentClass }: StatsCardProps) {
  return (
    <div
      className={`
        relative
        bg-white
        rounded-2xl
        p-4
        min-h-[120px]
        border border-gray-100
        shadow-sm
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all duration-200
        flex flex-col justify-between
      `}
    >
      {/* Accent top bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${accentClass}`}
      />

      {/* Title */}
      <span className="text-sm font-medium text-gray-500">{title}</span>

      {/* Value */}
      <div className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
        {value}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  )
}

/* ---------------------------------- */
/* 🔹 VEHICLE STATS GRID COMPACTE */
/* ---------------------------------- */
export function VehicleStats({
  total,
  enCours,
  termine,
  sansIntervention,
  // test,
}: VehicleStatsProps) {
  return (
    <section className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Total véhicules"
          value={total}
          description="Véhicules enregistrés"
          accentClass="bg-blue-500"
        />

        <StatsCard
          title="En cours"
          value={enCours}
          description="Véhicules en intervention"
          accentClass="bg-orange-500"
        />

        <StatsCard
          title="Terminés"
          value={termine}
          description="Interventions finalisées"
          accentClass="bg-green-500"
        />

        <StatsCard
          title="Sans intervention"
          value={sansIntervention}
          description="Aucune intervention"
          accentClass="bg-red-500"
        />

        {/* <StatsCard
          title="Test"
          value={test ?? 0}
          description="Valeur de test"
          accentClass="bg-purple-500"
        /> */}

      </div>
    </section>
  )
}
