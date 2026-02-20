"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Modal } from "@/src/shared/components/modal"
import { useEffect, useState } from "react"
import { ClientForm } from "./form/client-form"
import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/src/shared/components/ui/badge"

import { useClientApi } from "./shared/useClient.api"
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts"
import { Spinner } from "@/src/shared/components/spinner"
import { Client } from "@/src/utils/types/client"
import { toast } from "sonner"

type ClientWithCount = Client & {
  _count?: {
    bases: number
    vehicles: number
  }
}

export default function ClientPage() {
  const { getClients, createClient, updateClient, deleteClient } = useClientApi()

  const [clients, setClients] = useState<Client[]>([])
  const [clientSearch, setClientSearch] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const [clientsLoading, setClientsLoading] = useState(false)
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<Client>>({})
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null)

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    setClientSearch(clients)
  }, [clients])

  const loadClients = async () => {
    setLoading(true)
    try {
      const data = await getClients()
      setClients(data)
    } catch (e: any) {
      toast.error("Erreur", e.message)
    }
    setLoading(false)
  }

  const loadClientsWithoutSpin = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (e: any) {
      toast.error("Erreur", e.message)
    }
  }

  const handleCreate = async () => {
    try {
      setClientsLoading(true)
      await createClient(formData)
      toast.success("Client créé")
      setIsOpen(false)
      setFormData({})
      loadClientsWithoutSpin()
    } catch (e: any) {
      toast.error("Erreur", e.message)
    } finally {
      setClientsLoading(false)
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
      setClientsLoading(true)
      await updateClient(clientToEdit.id, formData)
      toast.success("Client mis à jour")
      setEditOpen(false)
      setClientToEdit(null)
      setFormData({})
      loadClientsWithoutSpin()
    } catch (e: any) {
      toast.error("Erreur", e.message)
    }finally {
      setClientsLoading(false)
    }
  }

  const handleDelete = async (client: Client) => {
    const confirmed = await confirmAlert(
      "Supprimer le client",
      `Supprimer "${client.name}" ?`
    )
    if (!confirmed) return

    try {
      setIdToDelete(client.id);
      await deleteClient(client.id)
      toast.success("Client supprimé")
      setClients((prev) => prev.filter((c) => c.id !== client.id))
    } catch (e: any) {
      toast.error("Suppression impossible", e.message)
    }finally {
      setIdToDelete(null);
    }
  }

  const columns: ColumnDef<ClientWithCount>[] =  [
    {
      accessorKey: "name",
      header: "Nom",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },

    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.email || "—"}
        </span>
      ),
    },

    {
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) => (
        <span>{row.original.phone || "—"}</span>
      ),
    },

    {
      accessorKey: "cli_numClient",
      header: "N° Client",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.cli_numClient || "N/A"}
        </Badge>
      ),
    },

    {
      header: "Agences",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original._count?.bases ?? 0}
        </Badge>
      ),
    },

    {
      header: "Véhicules",
      cell: ({ row }) => (
        <Badge className="bg-green-100 text-green-800">
          {row.original._count?.vehicles ?? 0}
        </Badge>
      ),
    },

    {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            //size="sm"
            variant="outline"
            onClick={() => handleEdit(row.original)}
          >
            Modifier
          </Button>
          <Button
            // size="sm"
            variant="destructive"
            onClick={() => handleDelete(row.original)}
            disabled={idToDelete === row.original.id}
          >
            <span className="flex items-center gap-2">
              {idToDelete === row.original.id ? <Spinner className="size-4" /> : ""}
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
      setClientSearch(clients)
      return
    }
    
    let clientFiltered = clients.filter(c=>
      c.name.toLocaleLowerCase().includes(value)
      || c.email?.toLocaleLowerCase().includes(value)
      ||c.phone?.toLocaleLowerCase().includes(value)
    )
    setClientSearch(clientFiltered);
  }

  return (
    <div className="p-10">
      <div className="flex justify-between mb-2 p-6 items-center">
        <h2 className="font-bold text-2xl">Gestion des clients</h2>
        <Button onClick={() => setIsOpen(true)}>Ajouter un client</Button>
      </div>
      
      {loading && <div className="px-6 flex justify-center mb-4">
        <Spinner className="size-6" />
      </div>}

      {<DataTable data={clientSearch} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)}/>}

      {/* CREATE */}
      <Modal open={isOpen} modalTitle="Nouveau client" onClose={() => setIsOpen(false)}>
        <ClientForm
          mode="create"
          data={formData}
          loading={clientsLoading}
          onChange={setFormData}
          onClose={() => {setIsOpen(false); setFormData({})}}
          onSubmit={handleCreate}
        />
      </Modal>

      {/* EDIT */}
      <Modal open={editOpen} modalTitle="Modifier client" onClose={() => setEditOpen(false)}>
        <ClientForm
          mode="edit"
          data={formData}
          loading={clientsLoading}
          onChange={setFormData}
          onClose={() => {setEditOpen(false); setFormData({})}}
          onSubmit={handleUpdate}
        />
      </Modal>
    </div>
  )
}
