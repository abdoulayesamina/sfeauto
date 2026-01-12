// src/shared/lib/alerts.ts
import Swal from "sweetalert2"
import withReactContent from "sweetalert2-react-content"

const MySwal = withReactContent(Swal)

export const confirmAlert = async (title: string, text?: string) => {
  const result = await MySwal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Oui",
    cancelButtonText: "Non",
    customClass: {
      confirmButton: "bg-blue-600 text-white",
      cancelButton: "bg-gray-200 text-gray-800",
      container: "z-[9999]",
      popup: "z-[10000]",
    },
  })
  return result.isConfirmed
}

export const successAlert = (title: string, text?: string) => {
  MySwal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "OK",
    customClass: {
      confirmButton: "bg-blue-600 text-white",
      container: "z-[9999]",
      popup: "z-[10000]",
    },
  })
}

export const errorAlert = (title: string, text?: string) => {
  MySwal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "OK",
    customClass: {
      confirmButton: "bg-red-600 text-white",
      container: "z-[9999]",
      popup: "z-[10000]",
    },
  })
}
