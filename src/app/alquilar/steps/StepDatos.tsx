'use client'

import { useState } from 'react'
import styles from '../alquilar.module.css'

interface Props {
  direccion: string
  fechaEnvio: string
  fechaDevolucion: string
  onChange: (field: 'direccion' | 'fechaEnvio' | 'fechaDevolucion', value: string) => void
  submitAttempted: boolean
}

function validateDireccion(v: string) {
  if (!v.trim()) return 'La dirección es requerida.'
  if (v.length > 100) return 'Máximo 100 caracteres.'
  return ''
}

function validateFechaEnvio(v: string) {
  if (!v) return 'La fecha de envío es requerida.'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (new Date(v + 'T00:00:00') < today) return 'La fecha de envío no puede ser en el pasado.'
  return ''
}

function validateFechaDevolucion(v: string, envio: string) {
  if (!v) return 'La fecha de devolución es requerida.'
  if (envio && new Date(v + 'T00:00:00') <= new Date(envio + 'T00:00:00'))
    return 'La devolución debe ser posterior al envío.'
  return ''
}

export { validateDireccion, validateFechaEnvio, validateFechaDevolucion }

export default function StepDatos({ direccion, fechaEnvio, fechaDevolucion, onChange, submitAttempted }: Props) {
  const [touched, setTouched] = useState({ direccion: false, fechaEnvio: false, fechaDevolucion: false })

  const show = (f: keyof typeof touched) => touched[f] || submitAttempted

  const errDireccion = validateDireccion(direccion)
  const errEnvio = validateFechaEnvio(fechaEnvio)
  const errDevolucion = validateFechaDevolucion(fechaDevolucion, fechaEnvio)

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <div className={styles.stepTitle}>Datos de entrega</div>
      <div className={styles.stepSubtitle}>
        Ingrese la dirección y las fechas de su alquiler.
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="alq-direccion">Dirección de entrega</label>
        <input
          id="alq-direccion"
          className={`${styles.input} ${show('direccion') && errDireccion ? styles.inputInvalid : direccion ? styles.inputValid : ''}`}
          placeholder="Ej: Av. Corrientes 1234, CABA"
          value={direccion}
          maxLength={100}
          onChange={e => onChange('direccion', e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, direccion: true }))}
        />
        {show('direccion') && errDireccion && (
          <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`}>{errDireccion}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="alq-envio">Fecha de envío</label>
        <input
          id="alq-envio"
          type="date"
          className={`${styles.input} ${show('fechaEnvio') && errEnvio ? styles.inputInvalid : fechaEnvio ? styles.inputValid : ''}`}
          value={fechaEnvio}
          min={today}
          onChange={e => onChange('fechaEnvio', e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, fechaEnvio: true }))}
        />
        {show('fechaEnvio') && errEnvio && (
          <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`}>{errEnvio}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="alq-devolucion">Fecha de devolución</label>
        <input
          id="alq-devolucion"
          type="date"
          className={`${styles.input} ${show('fechaDevolucion') && errDevolucion ? styles.inputInvalid : fechaDevolucion ? styles.inputValid : ''}`}
          value={fechaDevolucion}
          min={fechaEnvio || today}
          onChange={e => onChange('fechaDevolucion', e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, fechaDevolucion: true }))}
        />
        {show('fechaDevolucion') && errDevolucion && (
          <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`}>{errDevolucion}</p>
        )}
      </div>
    </>
  )
}
