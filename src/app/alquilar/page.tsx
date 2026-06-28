'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './alquilar.module.css'
import StepPeliculas, { type Pelicula } from './steps/StepPeliculas'
import StepSnacks, { type Snack, type SnackItem } from './steps/StepSnacks'
import StepDatos, {
  validateDireccion,
  validateFechaEnvio,
  validateFechaDevolucion,
} from './steps/StepDatos'
import StepResumen, { calcTotal } from './steps/StepResumen'
import StepPago from './steps/StepPago'
import StepConfirmacion from './steps/StepConfirmacion'

// ── Film strip ──
const STRIP_LABELS = ['MIPELÍCULA', 'ALQUILER', 'CINE FÍSICO', 'FORMATO ORIGINAL']

function FilmStrip({ reverse = false }: { reverse?: boolean }) {
  const items = Array.from({ length: 12 }, (_, i) => i)
  return (
    <div className={`${styles.filmstrip} ${reverse ? styles.filmstripBottom : ''}`} aria-hidden="true">
      <div className={`${styles.filmTrack} ${reverse ? styles.filmTrackReverse : ''}`}>
        {[...items, ...items].map((_, i) => (
          <span key={i} className={styles.filmUnit}>
            <span className={styles.filmHole} />
            <span className={styles.filmLabel}>{STRIP_LABELS[i % STRIP_LABELS.length]}</span>
            <span className={styles.filmHole} />
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Step bar ──
const STEP_LABELS = ['Películas', 'Snacks', 'Datos', 'Resumen', 'Pago', 'Listo']

function StepBar({ current }: { current: number }) {
  return (
    <div className={styles.stepBar}>
      {STEP_LABELS.map((label, i) => {
        const num = i + 1
        const isActive = num === current
        const isCompleted = num < current
        return (
          <div
            key={num}
            className={`${styles.stepItem} ${isCompleted ? styles.completed : ''}`}
          >
            <div
              className={`${styles.stepCircle} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
            >
              {isCompleted ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  width="12"
                  height="12"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                num
              )}
            </div>
            <span className={`${styles.stepLabel} ${isActive ? styles.active : ''}`}>
              {label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ──
export default function AlquilarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])
  const [snacks, setSnacks] = useState<Snack[]>([])

  const [step, setStep] = useState(1)

  // Wizard data
  const [selPeliculas, setSelPeliculas] = useState<Pelicula[]>([])
  const [selSnacks, setSelSnacks] = useState<SnackItem[]>([])
  const [direccion, setDireccion] = useState('')
  const [fechaEnvio, setFechaEnvio] = useState('')
  const [fechaDevolucion, setFechaDevolucion] = useState('')

  // UI state
  const [step1Error, setStep1Error] = useState('')
  const [datosSubmitAttempted, setDatosSubmitAttempted] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [payError, setPayError] = useState('')

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/auth'); return }

      const authId = session.user.id
      const [clienteRes, peliculasRes, snacksRes] = await Promise.all([
        supabase.from('Cliente').select('idCliente').eq('auth_id', authId).single(),
        supabase.from('pelicula').select('*'),
        supabase.from('snack').select('*'),
      ])

      if (clienteRes.data) setClienteId(clienteRes.data.idCliente)
      if (peliculasRes.data) setPeliculas(peliculasRes.data)
      if (snacksRes.data) {
        setSnacks(snacksRes.data)
        setSelSnacks(snacksRes.data.map((s: Snack) => ({ snack: s, cantidad: 0 })))
      }
      setLoading(false)
    }
    init()
  }, [router])

  function togglePelicula(p: Pelicula) {
    setSelPeliculas(prev =>
      prev.some(x => x.id === p.id)
        ? prev.filter(x => x.id !== p.id)
        : [...prev, p]
    )
  }

  function cambiarCantidadSnack(snackId: number, delta: number) {
    setSelSnacks(prev =>
      prev.map(s =>
        s.snack.id === snackId
          ? { ...s, cantidad: Math.max(0, s.cantidad + delta) }
          : s
      )
    )
  }

  function handleDatosChange(field: 'direccion' | 'fechaEnvio' | 'fechaDevolucion', value: string) {
    if (field === 'direccion') setDireccion(value)
    else if (field === 'fechaEnvio') setFechaEnvio(value)
    else setFechaDevolucion(value)
  }

  function isDatosValido() {
    return (
      !validateDireccion(direccion) &&
      !validateFechaEnvio(fechaEnvio) &&
      !validateFechaDevolucion(fechaDevolucion, fechaEnvio)
    )
  }

  function handleNext() {
    if (step === 1) {
      if (selPeliculas.length === 0) {
        setStep1Error('Seleccioná al menos una película para continuar.')
        return
      }
      setStep1Error('')
    }
    if (step === 3) {
      setDatosSubmitAttempted(true)
      if (!isDatosValido()) return
    }
    setStep(s => s + 1)
  }

  function handleBack() {
    setStep(s => s - 1)
  }

  async function handlePago(datos: { titular: string; numero: string; nombreTarjeta: string }) {
    if (!clienteId) return
    setPayLoading(true)
    setPayError('')
    try {
      const { total } = calcTotal(selPeliculas, selSnacks, fechaEnvio, fechaDevolucion)
      const snacksActivos = selSnacks.filter(s => s.cantidad > 0)

      const { data: alquilerData, error: alquilerError } = await supabase
        .from('alquiler')
        .insert({
          cliente_id: clienteId,
          direccion_entrega: direccion,
          fecha_envio: fechaEnvio,
          fecha_devolucion: fechaDevolucion,
          precio_total: parseFloat(total.toFixed(2)),
          pelicula_ids: selPeliculas.map(p => p.id),
        })
        .select('id')
        .single()

      if (alquilerError || !alquilerData) throw alquilerError ?? new Error('No se creó el alquiler')

      const aid = alquilerData.id

      if (snacksActivos.length > 0) {
        const { error: snackError } = await supabase.from('linea_snack').insert(
          snacksActivos.map(s => ({
            alquiler_id: aid,
            snack_id: s.snack.id,
            cantidad: s.cantidad,
          }))
        )
        if (snackError) throw snackError
      }

      const { error: pagoError } = await supabase.from('pago').insert({
        alquiler_id: aid,
        monto: parseFloat(total.toFixed(2)),
      })
      if (pagoError) throw pagoError

      setStep(6)
    } catch (err) {
      console.error('Error al confirmar pago:', err)
      setPayError('Hubo un error al procesar el pago. Intentá de nuevo.')
    } finally {
      setPayLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <FilmStrip />
        <FilmStrip reverse />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.loadingWrap}>
          <div className={styles.loadingSpinner} />
          <span>Cargando catálogo...</span>
        </div>
      </>
    )
  }

  return (
    <>
      <FilmStrip />
      <FilmStrip reverse />
      <div className={styles.grain} aria-hidden="true" />

      <main className={styles.page}>
        <div className={styles.wizardWrap}>
          <div className={styles.header}>
            <button type="button" className={styles.backBtn} onClick={() => router.push('/menu')}>
              ← Menú
            </button>
            <span className={styles.pageTitle}>ALQUILAR PELÍCULA</span>
          </div>

          <StepBar current={step} />

          <div className={styles.stepCard}>
            {step === 1 && (
              <>
                <StepPeliculas
                  peliculas={peliculas}
                  selected={selPeliculas}
                  onToggle={togglePelicula}
                />
                {step1Error && <p className={styles.errorMsg}>{step1Error}</p>}
                <div className={styles.navButtons}>
                  <button type="button" className={styles.btnNext} onClick={handleNext}>
                    CONTINUAR →
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <StepSnacks
                  snacks={snacks}
                  snacksConCantidad={selSnacks}
                  onCambiarCantidad={cambiarCantidadSnack}
                />
                <div className={styles.navButtons}>
                  <button type="button" className={styles.btnBack} onClick={handleBack}>
                    ← Volver
                  </button>
                  <button type="button" className={styles.btnNext} onClick={handleNext}>
                    CONTINUAR →
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <StepDatos
                  direccion={direccion}
                  fechaEnvio={fechaEnvio}
                  fechaDevolucion={fechaDevolucion}
                  onChange={handleDatosChange}
                  submitAttempted={datosSubmitAttempted}
                />
                <div className={styles.navButtons}>
                  <button type="button" className={styles.btnBack} onClick={handleBack}>
                    ← Volver
                  </button>
                  <button type="button" className={styles.btnNext} onClick={handleNext}>
                    CONTINUAR →
                  </button>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <StepResumen
                  peliculas={selPeliculas}
                  snacks={selSnacks}
                  fechaEnvio={fechaEnvio}
                  fechaDevolucion={fechaDevolucion}
                />
                <div className={styles.navButtons}>
                  <button type="button" className={styles.btnBack} onClick={handleBack}>
                    ← Volver
                  </button>
                  <button type="button" className={styles.btnNext} onClick={handleNext}>
                    IR AL PAGO →
                  </button>
                </div>
              </>
            )}

            {step === 5 && (
              <>
                <StepPago
                  onConfirmar={handlePago}
                  onBack={handleBack}
                  loading={payLoading}
                />
                {payError && <p className={styles.errorMsg} style={{ marginTop: 8 }}>{payError}</p>}
              </>
            )}

            {step === 6 && (
              <StepConfirmacion
                peliculas={selPeliculas}
                fechaEnvio={fechaEnvio}
              />
            )}
          </div>
        </div>
      </main>
    </>
  )
}
