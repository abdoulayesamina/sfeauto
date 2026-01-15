"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Modal } from "@/src/shared/components/modal"
import { useEffect, useState } from "react"
import { UserForm } from "./form/user-form"
import { ColumnDef } from "@tanstack/react-table"
import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { User } from "@/src/utils/types/user"
import { useUserApi } from "./shared/useUser.api"
import { useClientApi } from "../clients/shared/useClient.api"
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts"
import { useAgenceApi } from "../agence/shared/useAgence.api"
import { Spinner } from "@/src/shared/components/spinner"

export default function UsersPage() {
  const { getUsers, createUser, updateUser, deleteUser } = useUserApi()
  const { getClients } = useClientApi()
  const { getAgences } = useAgenceApi()

  const [users, setUsers] = useState<User[]>([])
  const [userSearch, setUserSearch] = useState<User[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [agences, setAgences] = useState<{ id: string; location: string; clientId: string }[]>([])
  const [loading, setLoading] = useState(true)

  const [isOpen, setIsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<User>>({})
  const [userToEdit, setUserToEdit] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
    loadClients()
    loadAgences()
  }, [])

  useEffect(() => {
    setUserSearch(users)
  }, [users])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
    setLoading(false)
  }

  const loadUsersWithoutSpin = async () => {
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const loadClients = async () => {
    try {
      const data = await getClients()
      setClients(data.map((c) => ({ id: c.id, name: c.name })))
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const loadAgences = async () => {
    try {
      const data = await getAgences()
      setAgences(data.map((a) => ({ id: a.id, location: a.location, clientId: a.clientId })))
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const handleCreate = async () => {
    try {
      await createUser(formData)
      successAlert("Utilisateur créé")
      setIsOpen(false)
      setFormData({})
      loadUsersWithoutSpin()
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const handleEdit = (user: User) => {
    setUserToEdit(user)
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      clientId: user.clientId,
      baseId: user.baseId,
    })
    setEditOpen(true)
  }

  const handleUpdate = async () => {
    if (!userToEdit) return
    const payload = { ...formData }
    if (!payload.password) delete payload.password

    try {
      await updateUser(userToEdit.id, payload)
      successAlert("Utilisateur mis à jour")
      setEditOpen(false)
      setUserToEdit(null)
      setFormData({})
      loadUsersWithoutSpin()
    } catch (e: any) {
      errorAlert("Erreur", e.message)
    }
  }

  const handleDelete = async (user: User) => {
    const confirmed = await confirmAlert(
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer "${user.name}" ?`
    )
    if (!confirmed) return

    try {
      await deleteUser(user.id)
      successAlert("Utilisateur supprimé", `"${user.name}" a été supprimé avec succès.`)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } catch (err: any) {
      errorAlert("Erreur", err.message || "Impossible de supprimer l'utilisateur")
    }
  }

  const columns: ColumnDef<User>[] = [
    { accessorKey: "name", header: "Nom" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "role", header: "Rôle" },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => row.original.client?.name || "N/A",
    },
    {
      accessorKey: "base",
      header: "Agence",
      cell: ({ row }) => row.original.base?.location || "N/A",
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
      setUserSearch(users)
      return
    }
    
    let userFiltered = users.filter(u=>
      u.name.toLocaleLowerCase().includes(value)
      || u.email?.toLocaleLowerCase().includes(value)
      ||u.role?.toLocaleLowerCase().includes(value)
      ||u.client?.name.toLocaleLowerCase().includes(value)
      ||u.base?.location.toLocaleLowerCase().includes(value)
    )
    setUserSearch(userFiltered);
  }

  return (
    <div className="p-10">
      <div className="flex justify-between mb-2 items-center p-6">
        <h2 className="font-bold text-2xl">Gestion des utilisateurs</h2>
        <Button onClick={() => setIsOpen(true)}>Ajouter</Button>
      </div>

      {loading && <div className="px-6 flex justify-center mb-4">
        <Spinner className="size-6" />
      </div>}
      {<DataTable data={userSearch} columnsProps={tableColumns} handleSearch={(e)=>handleSearch(e)}/>}

      {/* CREATE */}
      <Modal open={isOpen} modalTitle="Nouvel utilisateur" onClose={() => setIsOpen(false)}>
        <UserForm
          mode="create"
          value={formData}
          onChange={setFormData}
          onSubmit={handleCreate}
          onClose={() => setIsOpen(false)}
          clients={clients}
          agences={agences}
        />
      </Modal>

      {/* EDIT */}
      <Modal open={editOpen} modalTitle="Modifier utilisateur" onClose={() => setEditOpen(false)}>
        <UserForm
          mode="edit"
          value={formData}
          onChange={setFormData}
          onSubmit={handleUpdate}
          onClose={() => setEditOpen(false)}
          clients={clients}
          agences={agences}
        />
      </Modal>
    </div>
  )
}
