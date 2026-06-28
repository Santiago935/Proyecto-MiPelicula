'use client'

import { useRouter } from 'next/navigation'
import styles from '../alquilar.module.css'
import type { Pelicula } from './StepPeliculas'

interface Props {
  peliculas: Pelicula[]
  fechaEnvio: string
}

export default function StepConfirmacion({ peliculas, fechaEnvio }: Props) {
  const router = useRouter()

  const fechaStr = new Date(fechaEnvio + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={styles.confirmWrap}>
      <div className={styles.confirmCheck}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="36"
          height="36"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div className={styles.confirmTitle}>¡Pago confirmado!</div>

      <p className={styles.confirmSub}>
        Tus películas llegarán el{' '}
        <strong style={{ color: 'var(--cream)' }}>{fechaStr}</strong>.
      </p>

      <div className={styles.confirmPeliculas}>
        <div className={styles.resumenListTitle}>Películas alquiladas</div>
        {peliculas.map(p => (
          <div key={p.id} className={styles.resumenListItem}>
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              width="14"
              height="14"
              style={{ color: 'var(--success)', flexShrink: 0 }}
            >
              <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3z" />
            </svg>
            <span>{p.nombre}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className={styles.btnNext}
        style={{ width: '100%', maxWidth: 420 }}
        onClick={() => router.push('/menu')}
      >
        VOLVER AL MENÚ
      </button>
    </div>
  )
}
