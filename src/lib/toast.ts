// src/shared/lib/toast.ts
import { toast } from "sonner"

export const successToast = (message: string) => {
  toast.success(message)
}

export const errorToast = (message: string) => {
  toast.error(message)
}

export const infoToast = (message: string) => {
  toast(message)
}

export const loadingToast = (message: string) => {
  return toast.loading(message)
}

export const dismissToast = (id: string | number) => {
  toast.dismiss(id)
}
