'use client'

import { useState } from 'react'
import styles from '../alquilar.module.css'

interface Props {
  onConfirmar: (datos: { titular: string; numero: string; nombreTarjeta: string }) => Promise<void>
  onBack: () => void
  loading: boolean
}

export default function StepPago({ onConfirmar, onBack, loading }: Props) {
  const [titular, setTitular] = useState('')
  const [numero, setNumero] = useState('')
  const [nombreTarjeta, setNombreTarjeta] = useState('')
  const [touched, setTouched] = useState({ titular: false, numero: false, nombreTarjeta: false })
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const errTitular = titular.trim() ? '' : 'Requerido.'
  const errNumero = /^\d{16}$/.test(numero.replace(/\s/g, '')) ? '' : 'Ingresá 16 dígitos.'
  const errNombreTarjeta = nombreTarjeta.trim() ? '' : 'Requerido.'

  const show = (f: keyof typeof touched) => touched[f] || submitAttempted

  function formatNumero(v: string) {
    const digits = v.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  async function handleSubmit() {
    setSubmitAttempted(true)
    if (errTitular || errNumero || errNombreTarjeta) return
    await onConfirmar({ titular, numero: numero.replace(/\s/g, ''), nombreTarjeta })
  }

  return (
    <>
      <div className={styles.stepTitle}>Datos de pago</div>
      <div className={styles.stepSubtitle}>Ingrese los datos de su tarjeta.</div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="pago-titular">Nombre del titular</label>
        <input
          id="pago-titular"
          className={`${styles.input} ${show('titular') && errTitular ? styles.inputInvalid : titular ? styles.inputValid : ''}`}
          placeholder="Juan Pérez"
          value={titular}
          onChange={e => setTitular(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, titular: true }))}
        />
        {show('titular') && errTitular && (
          <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`}>{errTitular}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="pago-numero">Número de tarjeta</label>
        <input
          id="pago-numero"
          inputMode="numeric"
          maxLength={19}
          className={`${styles.input} ${show('numero') && errNumero ? styles.inputInvalid : !errNumero ? styles.inputValid : ''}`}
          placeholder="0000 0000 0000 0000"
          value={numero}
          onChange={e => setNumero(formatNumero(e.target.value))}
          onBlur={() => setTouched(t => ({ ...t, numero: true }))}
        />
        {show('numero') && errNumero && (
          <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`}>{errNumero}</p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="pago-nombre">Nombre de la tarjeta</label>
        <input
          id="pago-nombre"
          className={`${styles.input} ${show('nombreTarjeta') && errNombreTarjeta ? styles.inputInvalid : nombreTarjeta ? styles.inputValid : ''}`}
          placeholder="Ej: Visa Platinum, Tarjeta Naranja"
          value={nombreTarjeta}
          onChange={e => setNombreTarjeta(e.target.value)}
          onBlur={() => setTouched(t => ({ ...t, nombreTarjeta: true }))}
        />
        {show('nombreTarjeta') && errNombreTarjeta && (
          <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`}>{errNombreTarjeta}</p>
        )}
      </div>

      <div className={styles.navButtons}>
        <button type="button" className={styles.btnBack} onClick={onBack} disabled={loading}>
          ← Volver
        </button>
        <button
          type="button"
          className={styles.btnNext}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <span className={styles.spinner} /> : 'CONFIRMAR PAGO'}
        </button>
      </div>
    </>
  )
}
