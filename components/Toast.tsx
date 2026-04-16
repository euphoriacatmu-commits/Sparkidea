'use client'
import { useEffect, useState } from 'react'

export interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

let toastCounter = 0
const listeners: Array<(msg: ToastMessage) => void> = []

export function showToast(message: string, type: ToastMessage['type'] = 'success') {
  const msg: ToastMessage = { id: ++toastCounter, message, type }
  listeners.forEach(fn => fn(msg))
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const handler = (msg: ToastMessage) => {
      setToasts(prev => [...prev, msg])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== msg.id)), 2500)
    }
    listeners.push(handler)
    return () => {
      const i = listeners.indexOf(handler)
      if (i >= 0) listeners.splice(i, 1)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg animate-fade-in
            ${t.type === 'success' ? 'bg-gray-900 text-white' : t.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}
        >
          <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}</span>
          {t.message}
        </div>
      ))}
    </div>
  )
}
