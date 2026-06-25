'use client'

import { useState } from 'react'
import LoginForm from './Loginform'
import RegisterForm from './Registerform'
import styles from './auth.module.css'

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

export default function AuthCard() {
  const [tab, setTab] = useState<'login' | 'register'>('login')

  return (
    <>
      <FilmStrip />
      <FilmStrip reverse />

      {/* Grain overlay */}
      <div className={styles.grain} aria-hidden="true" />

      <div className={styles.card} role="region" aria-label="Autenticación">

        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="26" height="26">
              <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zM7 8H5V6h2v2zm0 4H5v-2h2v2zm0 4H5v-2h2v2zm12-8h-2V6h2v2zm0 4h-2v-2h2v2zm0 4h-2v-2h2v2zm-3-9H8V7h8v6z" />
            </svg>
          </div>
          <div className={styles.logoTitle}>
            Mi<span>Película</span>
          </div>
          <div className={styles.logoSub}>Alquiler de cine físico</div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'login'}
            aria-controls="panel-login"
            className={`${styles.tabBtn} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setTab('login')}
          >
            Iniciar sesión
          </button>
          <button
            role="tab"
            aria-selected={tab === 'register'}
            aria-controls="panel-register"
            className={`${styles.tabBtn} ${tab === 'register' ? styles.tabActive : ''}`}
            onClick={() => setTab('register')}
          >
            Crear sesión
          </button>
        </div>

        {/* Panels */}
        <div id="panel-login" role="tabpanel" hidden={tab !== 'login'}>
          <LoginForm onSwitchToRegister={() => setTab('register')} />
        </div>
        <div id="panel-register" role="tabpanel" hidden={tab !== 'register'}>
          <RegisterForm onSwitchToLogin={() => setTab('login')} />
        </div>

      </div>
    </>
  )
}