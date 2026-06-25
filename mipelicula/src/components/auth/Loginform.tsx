'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './auth.module.css'
import { useToast, Toast } from './Toast'

interface Props {
  onSwitchToRegister: () => void
}

interface FieldState {
  value: string
  error: string
  touched: boolean
}

function initField(value = ''): FieldState {
  return { value, error: '', touched: false }
}

export default function LoginForm({ onSwitchToRegister }: Props) {
  const { toast, showToast } = useToast()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [usuario, setUsuario] = useState(initField())
  const [password, setPassword] = useState(initField())
  const [showPw, setShowPw] = useState(false)

  // ── Validators ──
  function validateUsuario(val: string) {
    if (!val.trim()) return 'Ingresá tu usuario o correo.'
    return ''
  }
  function validatePassword(val: string) {
    if (!val) return 'Ingresá tu contraseña.'
    return ''
  }

  function touchField(
    setter: React.Dispatch<React.SetStateAction<FieldState>>,
    validator: (v: string) => string,
    value: string
  ) {
    setter(prev => ({ ...prev, error: validator(value), touched: true }))
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const usuarioErr = validateUsuario(usuario.value)
    const passwordErr = validatePassword(password.value)

    setUsuario(prev => ({ ...prev, error: usuarioErr, touched: true }))
    setPassword(prev => ({ ...prev, error: passwordErr, touched: true }))

    if (usuarioErr || passwordErr) return

    setLoading(true)
    try {
      // Supabase signInWithPassword usa email, por eso buscamos si es usuario o correo.
      // Si el campo no tiene @, asumimos que es username → buscamos el correo en la tabla Cuenta.
      let email = usuario.value.trim()

      if (!email.includes('@')) {
        const { data: cuenta, error: cuentaError } = await supabase
          .from('Cuenta')
          .select('idCliente, Clientes(correo)')
          .eq('usuario', email)
          .single()

        if (cuentaError || !cuenta) {
          setUsuario(prev => ({ ...prev, error: 'Usuario no encontrado.', touched: true }))
          showToast('Usuario o contraseña incorrectos.', 'error')
          return
        }

        // @ts-expect-error: relación anidada de Supabase
        email = cuenta.Clientes?.correo ?? ''
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: password.value,
      })

      if (error) {
        if (error.message.toLowerCase().includes('invalid')) {
          setPassword(prev => ({ ...prev, error: 'Usuario o contraseña incorrectos.', touched: true }))
        }
        showToast('No se pudo iniciar sesión.', 'error')
        return
      }

      setSuccess(true)
      showToast('Sesión iniciada correctamente.', 'success')
      // TODO: redirect('/') o router.push('/') según la estructura de rutas

    } catch {
      showToast('Error inesperado. Intentá de nuevo.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Success state ──
  if (success) {
    return (
      <>
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className={styles.successTitle}>¡Bienvenido de vuelta!</div>
          <p className={styles.successMsg}>Sesión iniciada correctamente.</p>
        </div>
        <Toast {...toast} />
      </>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>

        {/* Usuario o correo */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-usuario">
            Usuario o correo
          </label>
          <div className={styles.inputWrap}>
            <input
              id="login-usuario"
              type="text"
              className={[
                styles.input,
                usuario.touched && usuario.error ? styles.inputInvalid : '',
                usuario.touched && !usuario.error ? styles.inputValid : '',
              ].join(' ')}
              placeholder="tu_usuario"
              autoComplete="username"
              value={usuario.value}
              onChange={e => setUsuario(prev => ({ ...prev, value: e.target.value }))}
              onBlur={() => touchField(setUsuario, validateUsuario, usuario.value)}
            />
          </div>
          {usuario.touched && usuario.error && (
            <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`} role="alert">
              {usuario.error}
            </p>
          )}
        </div>

        {/* Contraseña */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="login-pass">
            Contraseña
          </label>
          <div className={styles.inputWrap}>
            <input
              id="login-pass"
              type={showPw ? 'text' : 'password'}
              className={[
                styles.input,
                styles.inputWithEye,
                password.touched && password.error ? styles.inputInvalid : '',
                password.touched && !password.error ? styles.inputValid : '',
              ].join(' ')}
              placeholder="••••••••"
              autoComplete="current-password"
              value={password.value}
              onChange={e => setPassword(prev => ({ ...prev, value: e.target.value }))}
              onBlur={() => touchField(setPassword, validatePassword, password.value)}
            />
            <button
              type="button"
              className={styles.eyeBtn}
              aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setShowPw(v => !v)}
            >
              {showPw ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {password.touched && password.error && (
            <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`} role="alert">
              {password.error}
            </p>
          )}
        </div>

        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : 'Ingresar'}
        </button>
      </form>

      <p className={styles.linkText}>
        ¿No tenés cuenta?{' '}
        <button className={styles.linkBtn} onClick={onSwitchToRegister}>
          Crear sesión
        </button>
      </p>

      <Toast {...toast} />
    </>
  )
}