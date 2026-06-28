'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './menu.module.css'

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

const MENU_ITEMS = [
  {
    key: 'alquilar',
    title: 'Alquilar Película',
    desc: 'Explore el catálogo y elija su próxima película.',
    href: '/alquilar',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
        <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zM7 8H5V6h2v2zm0 4H5v-2h2v2zm0 4H5v-2h2v2zm12-8h-2V6h2v2zm0 4h-2v-2h2v2zm0 4h-2v-2h2v2zm-3-9H8V7h8v6z" />
      </svg>
    ),
  },
  {
    key: 'historial',
    title: 'Historial de Alquiler',
    desc: 'Revise todas sus películas alquiladas anteriormente.',
    href: '/historial',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: 'perfil',
    title: 'Modificar su Perfil',
    desc: 'Edite su foto, usuario, contraseña y datos personales.',
    href: '/perfil',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="26" height="26">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function MenuPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/auth')
    })
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  return (
    <>
      <FilmStrip />
      <FilmStrip reverse />
      <div className={styles.grain} aria-hidden="true" />

      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.logo} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
              <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zM7 8H5V6h2v2zm0 4H5v-2h2v2zm0 4H5v-2h2v2zm12-8h-2V6h2v2zm0 4h-2v-2h2v2zm0 4h-2v-2h2v2zm-3-9H8V7h8v6z" />
            </svg>
          </div>
          <div className={styles.title}>Mi<span>Película</span></div>
          <div className={styles.subtitle}>¿Qué desea hacer hoy?</div>
        </header>

        <div className={styles.grid}>
          {MENU_ITEMS.map(item => (
            <button
              key={item.key}
              className={styles.card}
              onClick={() => router.push(item.href)}
            >
              <div className={styles.cardIcon}>{item.icon}</div>
              <div className={styles.cardTitle}>{item.title}</div>
              <p className={styles.cardDesc}>{item.desc}</p>
              <svg className={styles.cardArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          ))}
        </div>

        <div className={styles.logoutWrap}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </main>
    </>
  )
}
