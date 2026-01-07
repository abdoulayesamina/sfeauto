"use client"

import { Modal } from "@/src/shared/components/modal"
import { AddVehiculeForm } from "../form/addVehiculeForm"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: () => void
}

export function CreateVehiculeModal({ open, onClose, onSubmit }: Props) {
  return (
    <Modal open={open} onClose={onClose} modalTitle="Nouveau Véhicule">
      <AddVehiculeForm
        mode="create"
        onClose={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  )
}
