"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Modal } from "@/src/shared/components/modal"
import { useEffect, useState } from "react"
import { ClientForm } from "./form/client-form"
import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Client } from "@/generated/prisma"
import { Badge } from "@/src/shared/components/ui/badge"

import { useClientApi } from "./shared/useClient.api"
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts"

export default function ClientPage() {
  const { getClients, createClient, updateClient, deleteClient } = useClientApi()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const [isOpen, setIsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<Client>>({})
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    try {
      const data = await getClients()
      setClients(data)
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    try {
      await createClient(formData)
      successAlert("Client créé")
      setIsOpen(false)
      setFormData({})
      loadClients()
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const handleEdit = (client: Client) => {
    setClientToEdit(client)
    setFormData(client)
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!clientToEdit) return

    try {
      await updateClient(clientToEdit.id, formData)
      successAlert("Client mis à jour")
      setEditOpen(false)
      setClientToEdit(null)
      setFormData({})
      loadClients()
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const handleDelete = async (client: Client) => {
    const confirmed = await confirmAlert(
      "Supprimer le client",
      `Supprimer "${client.name}" ?`
    )
    if (!confirmed) return

    try {
      await deleteClient(client.id)
      successAlert("Client supprimé")
      loadClients()
    } catch (e: any) {
      errorAlert("Suppression impossible", e.message)
    }
  }

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      header: "Agences",
      cell: ({ row }) => (
        <Badge variant="secondary">{row.original._count?.bases || 0}</Badge>
      ),
    },
    {
      header: "Véhicules",
      cell: ({ row }) => (
        <Badge className="bg-green-200 text-green-900">
          {row.original._count?.vehicles || 0}
        </Badge>
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

  return (
    <div className="p-10">
      <div className="flex justify-between mb-6">
        <h2 className="font-bold">Gestion des clients</h2>
        <Button onClick={() => setIsOpen(true)}>Ajouter un client</Button>
      </div>

      {!loading && <DataTable data={clients} columnsProps={tableColumns} />}

      {/* CREATE */}
      <Modal open={isOpen} modalTitle="Nouveau client" onClose={() => setIsOpen(false)}>
        <ClientForm
          mode="create"
          data={formData}
          onChange={setFormData}
          onClose={() => setIsOpen(false)}
          onSubmit={handleCreate}
        />
      </Modal>

      {/* EDIT */}
      <Modal open={editOpen} modalTitle="Modifier client" onClose={() => setEditOpen(false)}>
        <ClientForm
          mode="edit"
          data={formData}
          onChange={setFormData}
          onClose={() => setEditOpen(false)}
          onSubmit={handleUpdate}
        />
      </Modal>
    </div>
  )
}
