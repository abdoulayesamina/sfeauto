"use client"

import { Button } from "@/src/shared/components/ui/button"
import { Modal } from "@/src/shared/components/modal"
import { useEffect, useState } from "react"
import { UserForm } from "./form/user-form"
import { ColumnDef } from "@tanstack/react-table"
import { createColumns, DataTable } from "@/src/shared/components/data-table"
import { User } from "@/src/utils/types/user"
import { useUserApi } from "./shared/useUser.api"
import { confirmAlert, errorAlert, successAlert } from "@/src/lib/alerts"

export default function UsersPage() {
  const { getUsers, createUser ,updateUser,deleteUser} = useUserApi()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [isOpen, setIsOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  const [formData, setFormData] = useState<Partial<User>>({})
  const [userToEdit, setUserToEdit] = useState<User | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const data = await getUsers()
    setUsers(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    await createUser(formData)
    setIsOpen(false)
    setFormData({})
    loadUsers()
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
  const payload = { ...formData }

  if (!payload.password) {
    delete payload.password
  }

  await updateUser(userToEdit!.id, payload)

  setEditOpen(false)
  setUserToEdit(null)
  setFormData({})
  loadUsers()
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
    loadUsers()
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
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleEdit(row.original)}>
            Modifier
          </Button>
          <Button variant="destructive" onClick={() => handleDelete(row.original)}>Supprimer</Button>
        </div>
      ),
    },
  ]

  const tableColumns = createColumns({ columns })

  return (
    <div className="p-10">
      <div className="flex justify-between mb-6">
        <h2 className="font-bold">Gestion des utilisateurs</h2>
        <Button onClick={() => setIsOpen(true)}>Ajouter</Button>
      </div>

      {!loading && <DataTable data={users} columnsProps={tableColumns} />}

      {/* CREATE */}
      <Modal open={isOpen} modalTitle="Nouvel utilisateur" onClose={() => setIsOpen(false)}>
        <UserForm
          mode="create"
          value={formData}
          onChange={setFormData}
          onSubmit={handleCreate}
          onClose={() => setIsOpen(false)}
        />
      </Modal>


      <Modal open={editOpen} modalTitle="Modifier utilisateur" onClose={() => setEditOpen(false)}>
       <UserForm
        mode="edit"
        value={formData}
        onChange={setFormData}
        onSubmit={handleUpdate}
        onClose={() => setEditOpen(false)}
        />

      </Modal>
    </div>
  )
}
