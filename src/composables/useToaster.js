import { useToast } from 'primevue/usetoast'

export function useToaster() {
  const toast = useToast()

  return {
    success: (message) => {
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: message,
        life: 3000
      })
    },
    error: (message) => {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 5000
      })
    },
    warn: (message) => {
      toast.add({
        severity: 'warn',
        summary: 'Warning',
        detail: message,
        life: 4000
      })
    },
    info: (message) => {
      toast.add({
        severity: 'info',
        summary: 'Info',
        detail: message,
        life: 3000
      })
    }
  }
}