import { useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import type { Toast } from '../hooks/useToast'

interface ContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ContainerProps) {
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-[9999] pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  const isSuccess = toast.type === 'success'

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl min-w-[260px] animate-in
        ${isSuccess
          ? 'bg-[#161b22] border-emerald-500/40 text-emerald-400'
          : 'bg-[#161b22] border-red-500/40 text-red-400'
        }`}
    >
      {isSuccess
        ? <CheckCircle2 size={17} className="flex-shrink-0" />
        : <XCircle size={17} className="flex-shrink-0" />
      }
      <span className="text-sm text-white flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-gray-500 hover:text-gray-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}
