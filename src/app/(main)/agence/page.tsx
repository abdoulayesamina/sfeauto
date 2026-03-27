"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Modal } from "@/src/shared/components/modal"
import { useEffect, useState } from "react"
import { AgenceForm } from "./form/agence-form"
import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { Agence } from "@/src/utils/types/agence"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/src/shared/components/ui/badge"
import { useAgenceApi } from "./shared/useAgence.api"
import { useClientApi } from "../clients/shared/useClient.api"
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts"
import { Spinner } from "@/src/shared/components/spinner"
import { toast } from "sonner"
import { success } from "zod"

export default function AgencePage() {
  const { getAgences, createAgence, updateAgence, deleteAgence } = useAgenceApi()
  const { getClients } = useClientApi()

  const [agences, setAgences] = useState<Agence[]>([])
  const [agenceSearch, setAgenceSearch] = useState<Agence[]>([])
  const [clients, setClients] = useState<{ cli_id: string; cli_name: string }[]>([])
  const [loading, setLoading] = useState(true)

  const [agencesLoading, setAgencesLoading] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<Agence>>({})
  const [agenceToEdit, setAgenceToEdit] = useState<Agence | null>(null)

  useEffect(() => {
    loadClients()
    loadAgences()
  }, [])

  useEffect(() => {
    setAgenceSearch(agences)
  }, [agences])

  const loadClients = async () => {
    try {
      const data = await getClients()
      setClients(data.map((c) => ({ cli_id: c.cli_id, cli_name: c.cli_name })))
    } catch (e: any) {
      toast.error("Erreur", e.message)
    }
  }

  const loadAgences = async () => {
    setLoading(true)
    try {
      const data = await getAgences()
      setAgences(data)
    } catch (e: any) {
      toast.error("Erreur", e.message)
    }
    setLoading(false)
  }

  const loadAgencesWithoutSpin = async () => {
    try {
      const data = await getAgences()
      setAgences(data)
    } catch (e: any) {
      toast.error("Erreur", e.message)
    }
  }

  const handleCreate = async () => {
    try {
      setAgencesLoading(true)
      await createAgence(formData)
      toast.success("Agence créée")
      setAgencesLoading(false)
      setIsOpen(false)
      setFormData({})
      loadAgencesWithoutSpin()
    } catch (e: any) {
      toast.error("Erreur : "+ e.message)
      setAgencesLoading(false)
    }
  }

  const handleEdit = (agence: Agence) => {
    setAgenceToEdit(agence)
    setFormData(agence)
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!agenceToEdit) return
    try {
      setAgencesLoading(true)
      await updateAgence(agenceToEdit.bas_id, formData)
      toast.success("Agence mise à jour")
      setEditOpen(false)
      setAgenceToEdit(null)
      setAgencesLoading(false)
      setFormData({})
      loadAgencesWithoutSpin()
    } catch (e: any) {
      toast.error("Erreur : "+ e.message)
      setAgencesLoading(false)
    }
  }

  const handleDelete = async (agence: Agence) => {
    const confirmed = await confirmAlert(
      "Supprimer l’agence",
      `Supprimer "${agence.bas_location}" ?`
    )
    if (!confirmed) return

    try {
      setIdToDelete(agence.bas_id);
      await deleteAgence(agence.bas_id)
      toast.success("Agence supprimée")
      setIdToDelete(null);
      setAgences((prev) => prev.filter((a) => a.bas_id !== agence.bas_id))
    } catch (e: any) {
      toast.error("Suppression impossible : "+ e.message)
      setIdToDelete(null);
    }
  }

  const columns: ColumnDef<Agence>[] = [
    { accessorKey: "bas_location", header: "Emplacement" },
    { header: "Client", cell: ({ row }) => row.original.bas_client?.cli_name || "N/A" },
    {
      header: "Véhicules",
      cell: ({ row }) => (
        <Badge className="bg-green-200 text-green-900">{row.original._count?.vehicles || 0}</Badge>
      ),
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleEdit(row.original)}>
            Modifier
          </Button>
          <Button variant="destructive" onClick={() => handleDelete(row.original)} disabled={idToDelete === row.original.bas_id}>
            <span className="flex items-center gap-2">
              {idToDelete === row.original.bas_id ? <Spinner className="size-4" /> : ""}
              Supprimer
            </span>
          </Button>
        </div>
      ),
    },
  ]

  const tableColumns = createColumns({ columns })

  const handleSearch = (e:string)=>{
    let value = e.toLocaleLowerCase().trim()
    if(!value){
      setAgenceSearch(agences)
      return
    }
    
    let agenceFiltered = agences.filter(a=>
      a.bas_location.toLocaleLowerCase().includes(value)
      || a.bas_client?.cli_name?.toLocaleLowerCase().includes(value)
    )
    setAgenceSearch(agenceFiltered);
  }

  return (
    <div className="p-10">
      <div className="flex justify-between mb-2 p-6 items-center">
        <h2 className="font-bold text-2xl">Gestion des agences</h2>
        <Button onClick={() => setIsOpen(true)}>Ajouter une agence</Button>
      </div>
      {loading && <div className="px-6 flex justify-center mb-4">
        <Spinner className="size-6" />
      </div>}

      {<DataTable data={agenceSearch} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)}/>}

      {/* CREATE */}
      <Modal open={isOpen} modalTitle="Nouvelle agence" onClose={() => setIsOpen(false)}>
        <AgenceForm
          mode="create"
          data={formData}
          clients={clients}
          loading={agencesLoading}
          onChange={setFormData}
          onClose={() => {setIsOpen(false); setFormData({})}}
          onSubmit={handleCreate}
        />
      </Modal>

      {/* EDIT */}
      <Modal open={editOpen} modalTitle="Modifier agence" onClose={() => setEditOpen(false)}>
        <AgenceForm
          mode="edit"
          data={formData}
          clients={clients}
          loading={agencesLoading}
          onChange={setFormData}
          onClose={() => {setEditOpen(false); setFormData({})}}
          onSubmit={handleUpdate}
        />
      </Modal>
    </div>
  )
}
