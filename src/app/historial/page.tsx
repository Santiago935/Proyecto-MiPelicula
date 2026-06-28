'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './historial.module.css'

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

// ── Types ──
interface PeliculaRow {
  id: number
  nombre: string
}

interface SnackRow {
  id: number
  nombre: string
}

interface LineaSnackRow {
  alquiler_id: number
  snack_id: number
  cantidad: number
  snack: SnackRow
}

interface AlquilerRow {
  id: number
  fecha_envio: string
  fecha_devolucion: string
  precio_total: number
  pelicula_ids: number[]
  created_at: string
}

interface AlquilerConDetalle extends AlquilerRow {
  peliculas: PeliculaRow[]
  lineasSnack: LineaSnackRow[]
}

// ── Main page ──
export default function HistorialPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [alquileres, setAlquileres] = useState<AlquilerConDetalle[]>([])

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/auth'); return }

      const { data: clienteData } = await supabase
        .from('Cliente')
        .select('idCliente')
        .eq('auth_id', session.user.id)
        .single()

      if (!clienteData) { setLoading(false); return }

      const { data: alqData } = await supabase
        .from('alquiler')
        .select('*')
        .eq('cliente_id', clienteData.idCliente)
        .order('created_at', { ascending: false })

      if (!alqData || alqData.length === 0) { setLoading(false); return }

      // Collect all unique pelicula IDs
      const allPeliculaIds = [...new Set<number>(alqData.flatMap((a: AlquilerRow) => a.pelicula_ids))]

      // Fetch all peliculas and snack lines in parallel
      const [peliculasRes, lineasRes] = await Promise.all([
        supabase
          .from('pelicula')
          .select('id, nombre')
          .in('id', allPeliculaIds),
        supabase
          .from('linea_snack')
          .select('alquiler_id, snack_id, cantidad, snack:snack(id, nombre)')
          .in('alquiler_id', alqData.map((a: AlquilerRow) => a.id)),
      ])

      const peliculasMap: Record<number, PeliculaRow> = {}
      for (const p of peliculasRes.data ?? []) {
        peliculasMap[p.id] = p
      }

      const lineasMap: Record<number, LineaSnackRow[]> = {}
      for (const l of lineasRes.data ?? []) {
        const row = l as unknown as LineaSnackRow
        if (!lineasMap[row.alquiler_id]) lineasMap[row.alquiler_id] = []
        lineasMap[row.alquiler_id].push(row)
      }

      const detallados: AlquilerConDetalle[] = alqData.map((a: AlquilerRow) => ({
        ...a,
        peliculas: a.pelicula_ids.map((id: number) => peliculasMap[id]).filter(Boolean),
        lineasSnack: lineasMap[a.id] ?? [],
      }))

      setAlquileres(detallados)
      setLoading(false)
    }
    load()
  }, [router])

  function fmtDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <>
        <FilmStrip />
        <FilmStrip reverse />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.loadingWrap}>
          <div className={styles.loadingSpinner} />
          <span>Cargando historial...</span>
        </div>
      </>
    )
  }

  if (alquileres.length === 0) {
    return (
      <>
        <FilmStrip />
        <FilmStrip reverse />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.emptyWrap}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="52" height="52" style={{ opacity: 0.3 }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <div className={styles.emptyTitle}>Sin alquileres aún</div>
          <p style={{ fontSize: 13, color: 'var(--gray)' }}>
            Todavía no alquilaste ninguna película.
          </p>
          <button type="button" className={styles.emptyBtn} onClick={() => router.push('/alquilar')}>
            ALQUILAR AHORA
          </button>
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => router.push('/menu')}
          >
            ← Volver al menú
          </button>
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
        <div className={styles.wrap}>
          <div className={styles.header}>
            <button type="button" className={styles.backBtn} onClick={() => router.push('/menu')}>
              ← Menú
            </button>
            <span className={styles.pageTitle}>HISTORIAL</span>
          </div>

          {alquileres.map(a => (
            <div key={a.id} className={styles.alquilerCard}>
              <div className={styles.alquilerHeader}>
                <div>
                  <div className={styles.alquilerFecha}>
                    Alquilado el {new Date(a.created_at).toLocaleDateString('es-AR', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                  <div className={styles.alquilerEnvio}>
                    Envío: <span>{fmtDate(a.fecha_envio)}</span>
                    {' · '}
                    Devolución: <span>{fmtDate(a.fecha_devolucion)}</span>
                  </div>
                </div>
                <div className={styles.alquilerTotal}>
                  ARS {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(a.precio_total)}
                </div>
              </div>

              <div className={styles.sectionLabel}>Películas</div>
              <div className={styles.itemList}>
                {a.peliculas.map(p => (
                  <div key={p.id} className={styles.peliculaItem}>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" style={{ color: 'var(--red)', flexShrink: 0 }}>
                      <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3z" />
                    </svg>
                    {p.nombre}
                  </div>
                ))}
              </div>

              {a.lineasSnack.length > 0 && (
                <>
                  <hr className={styles.divider} />
                  <div className={styles.sectionLabel}>Snacks</div>
                  <div className={styles.itemList}>
                    {a.lineasSnack.map(l => (
                      <div key={l.snack_id} className={styles.snackItem}>
                        <span>{l.snack.nombre}</span>
                        <span style={{ color: 'var(--gray)', fontSize: 12 }}>×{l.cantidad}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
