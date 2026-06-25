'use client'

import { useState, useCallback, useRef } from 'react'
import styles from './auth.module.css'

type ToastType = 'success' | 'error'

interface ToastState {
  msg: string
  type: ToastType
  visible: boolean
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ msg: '', type: 'success', visible: false })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ msg, type, visible: true })
    timerRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3500)
  }, [])

  return { toast, showToast }
}

export function Toast({ msg, type, visible }: ToastState) {
  return (
    <div
      className={[
        styles.toast,
        type === 'success' ? styles.toastSuccess : styles.toastError,
        visible ? styles.toastShow : '',
      ].join(' ')}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.toastDot} />
      <span>{msg}</span>
    </div>
  )
}