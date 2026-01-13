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

export default function AgencePage() {
  const { getAgences, createAgence, updateAgence, deleteAgence } = useAgenceApi()
  const { getClients } = useClientApi()

  const [agences, setAgences] = useState<Agence[]>([])
  const [agenceSearch, setAgenceSearch] = useState<Agence[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

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
      setClients(data.map((c) => ({ id: c.id, name: c.name })))
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const loadAgences = async () => {
    setLoading(true)
    try {
      const data = await getAgences()
      setAgences(data)
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    try {
      await createAgence(formData)
      successAlert("Agence créée")
      setIsOpen(false)
      setFormData({})
      loadAgences()
    } catch (e: any) {
      errorAlert("Erreur", e.message)
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
      await updateAgence(agenceToEdit.id, formData)
      successAlert("Agence mise à jour")
      setEditOpen(false)
      setAgenceToEdit(null)
      setFormData({})
      loadAgences()
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const handleDelete = async (agence: Agence) => {
    const confirmed = await confirmAlert(
      "Supprimer l’agence",
      `Supprimer "${agence.location}" ?`
    )
    if (!confirmed) return

    try {
      await deleteAgence(agence.id)
      successAlert("Agence supprimée")
      loadAgences()
    } catch (e: any) {
      errorAlert("Suppression impossible", e.message)
    }
  }

  const columns: ColumnDef<Agence>[] = [
    { accessorKey: "location", header: "Emplacement" },
    { header: "Client", cell: ({ row }) => row.original.client?.name || "N/A" },
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
          <Button variant="destructive" onClick={() => handleDelete(row.original)}>
            Supprimer
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
      a.location.toLocaleLowerCase().includes(value)
      || a.client?.name?.toLocaleLowerCase().includes(value)
    )
    setAgenceSearch(agenceFiltered);
  }

  return (
    <div className="p-10">
      <div className="flex justify-between mb-2 p-6 items-center">
        <h2 className="font-bold text-2xl">Gestion des agences</h2>
        <Button onClick={() => setIsOpen(true)}>Ajouter une agence</Button>
      </div>

      {!loading && <DataTable data={agenceSearch} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)}/>}

      {/* CREATE */}
      <Modal open={isOpen} modalTitle="Nouvelle agence" onClose={() => setIsOpen(false)}>
        <AgenceForm
          mode="create"
          data={formData}
          clients={clients}
          onChange={setFormData}
          onClose={() => setIsOpen(false)}
          onSubmit={handleCreate}
        />
      </Modal>

      {/* EDIT */}
      <Modal open={editOpen} modalTitle="Modifier agence" onClose={() => setEditOpen(false)}>
        <AgenceForm
          mode="edit"
          data={formData}
          clients={clients}
          onChange={setFormData}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
        />
      </Modal>
    </div>
  )
}
