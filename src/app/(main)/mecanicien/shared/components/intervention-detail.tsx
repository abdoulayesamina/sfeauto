"use client"

import React, { useEffect, useState } from "react"
import { Car, User, MapPin, Wrench, Images, X, CheckCircle, Sparkles, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import { getStatusMeta, HISTORY_LABELS, UIStatus, computeUIStatus } from "@/src/utils/constants/intervention-status"
import { errorAlert, successAlert } from "@/src/lib/alerts"
import { useInterventionPhotos } from "../../../gestionnaire/shared/hooks/useInterventionPhotos.api"
import { useAiReport, AiReportStyle } from "../../../gestionnaire/shared/hooks/useAiReport.api"
import { useInterventionApi } from "../../../gestionnaire/shared/hooks/useInterventionApi.api"

const REPORT_STYLE_LABELS: Record<AiReportStyle, string> = {
  technique: "Technique",
  client: "Client",
  assurance: "Assurance",
}

type Props = {
  selectedIntervention: any
  onClose: () => void
  getStatusMeta?: (status: UIStatus) => {
    label: string
    color: string
    bg: string
    icon: any
  }
  translateStatus?: (status: string) => string
}

export default function InterventionDetail({
  selectedIntervention,
  onClose,
  translateStatus,
}: Props) {

  const uiStatus: UIStatus = computeUIStatus({ int_status: selectedIntervention?.dbStatus || selectedIntervention?.status as any })

  const history = selectedIntervention?.statusHistory ?? []

  const {
    photos,
    loading: photosLoading,
    error: photosError,
  } = useInterventionPhotos(selectedIntervention?.id)

  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (photosError) errorAlert("Photos", photosError)
  }, [photosError])

  const { generateReport, loading: generating, error: generateError } = useAiReport()
  const { patchIntervention, loading: saving } = useInterventionApi()

  const [aiReport, setAiReport] = useState<Record<AiReportStyle, string> | null>(null)
  const [reportStyle, setReportStyle] = useState<AiReportStyle>("technique")
  const [draftText, setDraftText] = useState("")
  const [savedDescription, setSavedDescription] = useState<string | null>(null)

  useEffect(() => {
    if (generateError) errorAlert("Compte-rendu IA", generateError)
  }, [generateError])

  const handleGenerate = async () => {
    const report = await generateReport(selectedIntervention?.id)
    if (!report) return

    setAiReport(report)
    setReportStyle("technique")
    setDraftText(report.technique)
  }

  const handleStyleChange = (style: AiReportStyle) => {
    setReportStyle(style)
    if (aiReport) setDraftText(aiReport[style])
  }

  const handleSaveReport = async () => {
    try {
      await patchIntervention(selectedIntervention?.id, { workDescription: draftText })
      setSavedDescription(draftText)
    } catch {
      // erreur déjà notifiée par patchIntervention
    }
  }

  const openViewer = (idx: number) => {
    setActiveIndex(idx)
    setViewerOpen(true)
  }

  const activePhoto = photos?.[activeIndex]?.sasUrl

  return (
    <div className="space-y-6 md:w-[600px]">

      <div className="border-b bg-black/90 rounded-xl p-6 text-white">
        <h2 className="text-xl font-bold">
          Intervention – {selectedIntervention?.vehicle?.licensePlate}
        </h2>
        <p className="text-sm text-gray-400">
          Accord N° {selectedIntervention?.accordNumber}
        </p>
      </div>

      <div className="rounded-xl border p-4 bg-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-3 rounded-lg bg-blue-100 text-blue-700">
            <Car />
          </div>
          <p className="font-semibold">Véhicule</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <p><span className="font-medium">Immatriculation :</span> {selectedIntervention?.vehicle?.licensePlate}</p>
          <p><span className="font-medium">Modèle :</span> {selectedIntervention?.vehicle?.brand} {selectedIntervention?.vehicle?.model}</p>
          <p><span className="font-medium">Année :</span> {selectedIntervention?.vehicle?.year}</p>
          <p><span className="font-medium">Couleur :</span> {selectedIntervention?.vehicle?.color}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <User />
          </div>
          <div>
            <p className="font-semibold">{selectedIntervention?.vehicle?.client?.name}</p>
            <p className="text-sm text-gray-500">Client</p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border p-4">
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <MapPin />
          </div>
          <div>
            <p className="font-semibold">{selectedIntervention?.vehicle?.base?.location}</p>
            <p className="text-sm text-gray-500">Base</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <div className={`rounded-xl border p-4 ${selectedIntervention?.accordNumber !== 'REFUSE' ? 'bg-zinc-50' : 'bg-red-100'}`}>
          <div className="mb-1 flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-100 text-orange-700">
              <CheckCircle />
            </div>
            <p className="font-semibold">Accord client</p>
          </div>

          <p className="text-sm">{selectedIntervention?.accordNumber}</p>

          <p className="text-xs text-gray-500 mt-1">
            Confirmé le{" "}
            {selectedIntervention?.dateOfConfirmation
              ? new Date(selectedIntervention.dateOfConfirmation).toLocaleDateString("fr-FR")
              : "-"}
          </p>
        </div>

        <div className={`rounded-xl border p-4 ${getStatusMeta(uiStatus).bg}`}>
          <div className="flex items-center gap-3 mb-1">
            <div className={`p-2 rounded-lg bg-white ${getStatusMeta(uiStatus).color}`}>
              {React.createElement(getStatusMeta(uiStatus).icon, { size: 20 })}
            </div>
            <p className="text-sm text-gray-500">Statut actuel</p>
          </div>

          <p className={`text-lg font-semibold ${getStatusMeta(uiStatus).color}`}>
            {getStatusMeta(uiStatus).label}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Mis à jour le{" "}
            {new Date(selectedIntervention?.statusUpdatedAt).toLocaleDateString("fr-FR") + " à " + new Date(selectedIntervention?.statusUpdatedAt).toLocaleTimeString("fr-FR")}
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Description du travail</p>
        <p className="text-gray-600 text-sm">
          {savedDescription ?? selectedIntervention?.workDescription ?? "Aucune description fournie"}
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 p-4 bg-blue-50">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <p className="font-semibold">Compte-rendu d'intervention</p>
          </div>
          {aiReport && (
            <span className="text-xs font-medium text-blue-700 bg-blue-100 border border-blue-200 px-2 py-1 rounded-full">
              Généré par IA
            </span>
          )}
        </div>

        {!aiReport ? (
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-sm text-gray-600">
              Générer automatiquement un compte-rendu à partir des notes, pièces et photos de cette intervention.
            </p>
            <Button type="button" onClick={handleGenerate} disabled={generating} className="shrink-0">
              {generating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Générer
            </Button>
          </div>
        ) : (
          <>
            <div className="inline-flex bg-white border rounded-lg p-1 mb-3 gap-1">
              {(Object.keys(REPORT_STYLE_LABELS) as AiReportStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleStyleChange(style)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition ${
                    reportStyle === style
                      ? "bg-zinc-900 text-white"
                      : "text-gray-600 hover:bg-zinc-100"
                  }`}
                >
                  {REPORT_STYLE_LABELS[style]}
                </button>
              ))}
            </div>

            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              rows={4}
              className="w-full text-sm text-gray-700 bg-white border rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            />

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Button type="button" variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${generating ? "animate-spin" : ""}`} />
                Régénérer
              </Button>
              <div className="flex-1" />
              <Button
                type="button"
                size="sm"
                onClick={handleSaveReport}
                disabled={saving || draftText === (savedDescription ?? "")}
              >
                {saving && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Enregistrer comme description
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="rounded-xl border-[4px] border-red-300 p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Commentaires</p>
        <p className="text-gray-600 text-sm">
          {selectedIntervention?.comments || "Aucun commentaire fourni"}
        </p>
      </div>

      <div className="rounded-xl border p-4 bg-zinc-50">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold flex items-center gap-2">
            <Images className="w-5 h-5" />
            Photos
          </p>
          <p className="text-xs text-gray-500">
            {photosLoading ? "Chargement..." : `${photos.length} photo(s)`}
          </p>
        </div>

        {photosLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <p className="text-sm text-gray-500">
            Aucune photo liée à cette intervention.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((p: any, idx: number) => (
              <button
                key={p.id}
                type="button"
                onClick={() => openViewer(idx)}
                className="group relative aspect-square overflow-hidden rounded-lg border bg-white"
                title="Cliquer pour agrandir"
              >
                <img
                  src={p.sasUrl}
                  alt={`Photo ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {viewerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setViewerOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-black rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white rounded-full p-2"
              onClick={() => setViewerOpen(false)}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between px-4 py-3 text-white text-sm">
              <button
                type="button"
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40"
                disabled={activeIndex === 0}
                onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
              >
                ←
              </button>

              <span>
                {activeIndex + 1} / {photos.length}
              </span>

              <button
                type="button"
                className="px-3 py-2 mr-20 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-40"
                disabled={activeIndex === photos.length - 1}
                onClick={() =>
                  setActiveIndex((i) => Math.min(photos.length - 1, i + 1))
                }
              >
                →
              </button>
            </div>

            <div className="bg-black flex items-center justify-center">
              <img
                src={activePhoto}
                alt="Photo intervention"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border p-4">
        <p className="font-semibold mb-4">Historique des statuts</p>

        {history.length === 0 && (
          <p className="text-sm text-gray-400">Aucun historique disponible</p>
        )}

        <div className="space-y-4">
          {history.map((h: any) => (
            <div key={h.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mt-1" />
                {h !== history[history.length - 1] && (
                  <div className="flex-1 w-px bg-gray-300" />
                )}
              </div>

              <div className="flex-1 pb-4">
                <p className="text-sm font-medium">
                  {HISTORY_LABELS[h.previousStatus] ?? h.previousStatus} →{" "}
                  <span className="text-blue-600">
                    {HISTORY_LABELS[h.newStatus] ?? h.newStatus}
                  </span>
                </p>

                <p className="text-xs text-gray-500">
                  {new Date(h.changedAt).toLocaleDateString("fr-FR")+" à "+new Date(h.changedAt).toLocaleTimeString("fr-FR")}
                </p>

                <p className="text-xs text-gray-500">
                  Modifié par{" "}
                  <span className="font-medium">
                    {h.changedBy?.name || "Système"}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-4 bg-zinc-50">
        <p className="font-semibold mb-2">Informations</p>

        <p className="text-sm">
          Créé le{" "}
          {new Date(selectedIntervention?.createdAt).toLocaleDateString("fr-FR")}
        </p>

        <p className="text-sm mt-1">
          Géré par{" "}
          <span className="font-medium">
            {selectedIntervention?.handledBy?.name}
          </span>{" "}
          <span className="text-gray-500">
            ({selectedIntervention?.handledBy?.email})
          </span>
        </p>
      </div>

      <Button onClick={onClose} className="w-full p-8">
        Fermer
      </Button>
    </div>
  )
}
