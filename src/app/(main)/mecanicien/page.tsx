"use client"

import { useEffect, useState } from "react"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"
import { Car, Calendar, User, MapPin, Eye, Wrench, Search, AlertTriangle, XCircle, CheckCircle2, Clock } from "lucide-react"
import { useBases } from "./shared/useBases.api"
import { useStatusInt } from "./shared/useStatusInt.api"
import { useInterventions } from "./shared/useinterventions.api"
import { useClients } from "./shared/useClient.api"
import InterventionDetail from "./shared/components/intervention-detail"
import { Modal } from "@/src/shared/components/modal"
import { Spinner } from "@/src/shared/components/spinner"
import { errorAlert } from "@/src/lib/alerts"
import { toast } from "sonner"

export const statusStyles: Record<string, string> = {
    EN_COURS: "bg-blue-100 text-blue-700",
    ATTENTE_PIECES: "bg-orange-100 text-orange-700",
    TERMINEE: "bg-green-100 text-green-700",
}

const STATUS_UI_MAP: Record<string, string> = {
    CONFIRMED_IN_PLANNING: "EN_COURS",
    EN_REPARATION: "EN_COURS",
    FIXING_STARTED: "EN_COURS",
    WAITING_FOR_PARTS: "ATTENTE_PIECES",
    FIXING_FINISHED: "TERMINEE",
    TERMINE: "TERMINEE",
}
export const getStatusMeta = (status?: string) => {
    switch (status) {
        case "FIXING_STARTED":
            return {
                label: "Réparation en cours",
                icon: Wrench,
                color: "text-blue-700",
                bg: "bg-blue-100",
            }
        case "WAITING_FOR_PARTS":
            return {
                label: "En attente de pièces",
                icon: Clock,
                color: "text-orange-700",
                bg: "bg-orange-100",
            }
        case "FIXING_DONE":
            return {
                label: "Réparation terminée",
                icon: CheckCircle2,
                color: "text-green-700",
                bg: "bg-green-100",
            }
        case "CANCELLED":
            return {
                label: "Annulée",
                icon: XCircle,
                color: "text-red-700",
                bg: "bg-red-100",
            }
        default:
            return {
                label: "Statut inconnu",
                icon: AlertTriangle,
                color: "text-gray-600",
                bg: "bg-gray-100",
            }
    }
}
export const translateStatus = (status?: string): string => {
    if (!status) return "Statut inconnu"
    return STATUS_TRANSLATIONS[status] ?? status
}

const STATUS_TRANSLATIONS: Record<string, string> = {
    CONFIRMED_IN_PLANNING: "Confirmée et planifiée",
    FIXING_STARTED: "Réparation en cours",
    WAITING_FOR_PARTS: "En attente de pièces",
    FIXING_DONE: "Réparation terminée",
    CANCELLED: "Annulée",
}

export default function MecanicienPage() {
    const [filterStatus, setFilterStatus] = useState<"EN_COURS" | "TERMINEE" | "ATTENTE_PIECES">("EN_COURS")
    const [clientId, setClientId] = useState<string>()
    const [baseId, setBaseId] = useState<string>()
    const [search, setSearch] = useState("")
    const [interventionId, setInterventionId] = useState<number | null>(0);

    const { clients } = useClients()
    const { bases } = useBases(clientId)
    const { interventions, setInterventions, loading } = useInterventions(undefined, clientId, baseId, search)
    const { updateStatus, loading: statusLoading, error: statusError } = useStatusInt()

    const openModal = (intervention: any) => {
        setSelectedIntervention(intervention)
        setOpen(true)
    }
    const [open, setOpen] = useState(false)
    const [selectedIntervention, setSelectedIntervention] = useState<any>(null)
    const [filteredInterventions, setFilteredInterventions] = useState<any[]>([])

    useEffect(() => {
        console.log("Intervention : ", interventions);
        if(interventions.error){
            toast.error("Erreur : "+interventions.error)
            return 
        }
        const filtered = interventions.filter((inv:any) => STATUS_UI_MAP[inv.status] === filterStatus)
        setFilteredInterventions(filtered)
    }, [interventions, filterStatus])

    return (
        <div className="bg-zinc-50 min-h-screen p-4 sm:p-8">
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-6">

                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Wrench />
                    </div>
                    <h1 className="text-2xl font-bold">Espace Mécanicien</h1>
                </div>

                {/* Filtres */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Select onValueChange={setClientId}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Client" />
                            </SelectTrigger>
                            <SelectContent>
                                {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>

                        <Select onValueChange={setBaseId}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Agence" />
                            </SelectTrigger>
                            <SelectContent>
                                {bases.map(b => <SelectItem key={b.id} value={b.id}>{b.location}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Input placeholder="Rechercher plaque ou accord..." value={search} onChange={e => setSearch(e.target.value)} />
                        <Button size="icon" variant="outline"><Search size={18} /></Button>
                    </div>
                </div>

                {/* Statut filter */}
                <div className="flex gap-2">
                    <Button onClick={() => setFilterStatus("EN_COURS")} variant={filterStatus === "EN_COURS" ? "default" : "outline"}>En cours</Button>
                    <Button onClick={() => setFilterStatus("TERMINEE")} variant={filterStatus === "TERMINEE" ? "default" : "outline"}>Terminées</Button>
                    <Button onClick={() => setFilterStatus("ATTENTE_PIECES")} variant={filterStatus === "ATTENTE_PIECES" ? "default" : "outline"}>En attente de pièce</Button>
                </div>

                {/* Liste */}
                <div className="space-y-4">
                    {loading && <p>Chargement...</p>}
                    {!loading && filteredInterventions.map(inv => {
                        const uiStatus = STATUS_UI_MAP[inv.status]

                        return (
                            <div key={inv.id} className="border rounded-xl p-5 flex flex-col gap-4 lg:flex-row lg:items-center hover:shadow-md transition">
                                <div className="flex items-start gap-3 flex-1">
                                    {/* <Car className="text-gray-400 mt-1" /> */}
                                    <Car size={18} className="text-gray-400 mt-1 shrink-0" />
                                    <div>
                                        <p className="font-bold">{inv.vehicle.licensePlate}</p>
                                        <p className="text-sm text-gray-500">{inv.vehicle.brand} {inv.vehicle.model}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 flex-1">
                                    {/* <Calendar className="text-gray-400 mt-1" /> */}
                                    <Calendar size={18} className="text-gray-400 mt-1 shrink-0" />
                                    <div>
                                        <p className="font-medium">{inv.accordNumber || "—"}</p>
                                        <p className="text-sm text-gray-500">{inv.createdAt.slice(0, 10)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 flex-1">
                                    {/* <User className="text-gray-400 mt-1" /> */}
                                    <User size={18} className="text-gray-400 mt-1 shrink-0" />
                                    <div>
                                        <p className="font-medium">{inv.vehicle.client.name}</p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            <MapPin size={14} />
                                            {inv.vehicle.base.location}
                                        </p>
                                    </div>
                                </div>

                                <Select
                                    onValueChange={async (val) => {
                                       const result = await updateStatus(inv.id, val as any)

                                            if (!result.success) {
                                            return errorAlert("Erreur", result.message)
                                            }

                                            setInterventions((prev : any) =>
                                            prev.map((item : any) =>
                                                item.id === inv.id
                                                ? { ...item, status: result.data.status }
                                                : item
                                            )
                                            )

                                        setInterventions((prev : any) =>
                                            prev.map((item : any) =>
                                                item.id === inv.id ? { ...item, status: Object.keys(STATUS_UI_MAP).find(key => STATUS_UI_MAP[key] === val) || item.status } : item
                                            )
                                        )
                                    }}
                                    value={uiStatus}
                                >
                                    <SelectTrigger className={`w-[180px] ${statusStyles[uiStatus]}`} disabled={inv.id == interventionId}>
                                        {inv.id == interventionId ? <Spinner /> : ""}
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EN_COURS">En cours</SelectItem>
                                        <SelectItem value="ATTENTE_PIECES">Attente pièces</SelectItem>
                                        <SelectItem value="TERMINEE">Terminée</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button variant="outline" className="gap-2" onClick={() => openModal(inv)} >
                                    <Eye size={16} />
                                    Détails
                                </Button>
                            </div>
                        )
                    })}
                </div>
            </div>
            <Modal open={open} onClose={() => setOpen(false)} modalTitle="Détail de l'intervention">
                <InterventionDetail
                    selectedIntervention={selectedIntervention}
                    onClose={() => setOpen(false)}
                    getStatusMeta={getStatusMeta}
                    translateStatus={translateStatus}
                />
            </Modal>
        </div>
    )
}