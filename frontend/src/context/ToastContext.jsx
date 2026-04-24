import { createContext, useContext, useMemo } from 'react'
import toast from 'react-hot-toast'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const value = useMemo(
    () => ({
      success: (message) =>
        toast.success(message, {
          style: { borderRadius: '12px', background: '#052e16', color: '#dcfce7' },
        }),
      error: (message) =>
        toast.error(message, {
          style: { borderRadius: '12px', background: '#450a0a', color: '#fee2e2' },
        }),
      loading: (message) =>
        toast.loading(message, {
          style: { borderRadius: '12px', background: '#1e293b', color: '#e2e8f0' },
        }),
      dismiss: (id) => toast.dismiss(id),
    }),
    [],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

