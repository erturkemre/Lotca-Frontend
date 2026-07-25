import { toast } from 'react-toastify'

export function notifySuccess(message) {
  toast.success(message)
}

export function notifyError(error, fallback) {
  const message = error?.response?.data?.message || fallback || 'Bir hata oluştu'
  toast.error(message)
}
