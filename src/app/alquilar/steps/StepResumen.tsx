import styles from '../alquilar.module.css'
import type { Pelicula } from './StepPeliculas'
import type { SnackItem } from './StepSnacks'

interface Props {
  peliculas: Pelicula[]
  snacks: SnackItem[]
  fechaEnvio: string
  fechaDevolucion: string
}

export function calcTotal(
  peliculas: Pelicula[],
  snacks: SnackItem[],
  fechaEnvio: string,
  fechaDevolucion: string
) {
  const dias =
    Math.ceil(
      (new Date(fechaDevolucion + 'T00:00:00').getTime() -
        new Date(fechaEnvio + 'T00:00:00').getTime()) /
        86400000
    ) + 1
  const subtotalPelis = peliculas.reduce((acc, p) => acc + p.precio, 0) * dias
  const snacksActivos = snacks.filter(s => s.cantidad > 0)
  const subtotalSnacks = snacksActivos.reduce((acc, s) => acc + s.snack.precio * s.cantidad, 0)
  const comision = (subtotalPelis + subtotalSnacks) * 0.05
  const total = subtotalPelis + subtotalSnacks + comision
  return { dias, subtotalPelis, subtotalSnacks, comision, total, snacksActivos }
}

export default function StepResumen({ peliculas, snacks, fechaEnvio, fechaDevolucion }: Props) {
  const { dias, comision, total, snacksActivos } =
    calcTotal(peliculas, snacks, fechaEnvio, fechaDevolucion)

  const fmt = (n: number) =>
    `ARS ${new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`

  return (
    <>
      <div className={styles.stepTitle}>Resumen del pedido</div>
      <div className={styles.stepSubtitle}>Revisá el detalle antes de pagar.</div>

      <div className={styles.resumenBreakdown}>
        {/* Una fila por película */}
        {peliculas.map(p => (
          <div key={p.id} className={styles.resumenRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="13" height="13" style={{ color: 'var(--red)', flexShrink: 0 }}>
                <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3z" />
              </svg>
              {p.nombre}
              <span style={{ color: 'var(--gray)', fontSize: 12 }}>
                ({fmt(p.precio)}/día × {dias} día{dias !== 1 ? 's' : ''})
              </span>
            </span>
            <span>{fmt(p.precio * dias)}</span>
          </div>
        ))}

        {/* Una fila por snack */}
        {snacksActivos.map(s => (
          <div key={s.snack.id} className={styles.resumenRow}>
            <span>
              {s.snack.nombre}
              <span style={{ color: 'var(--gray)', fontSize: 12, marginLeft: 6 }}>
                ×{s.cantidad}
              </span>
            </span>
            <span>{fmt(s.snack.precio * s.cantidad)}</span>
          </div>
        ))}

        {/* Comisión */}
        <div className={styles.resumenRow}>
          <span>Comisión (5%)</span>
          <span>{fmt(comision)}</span>
        </div>

        {/* Total al fondo */}
        <div className={`${styles.resumenRow} ${styles.resumenTotal}`}>
          <span>TOTAL</span>
          <span>{fmt(total)}</span>
        </div>
      </div>
    </>
  )
}
