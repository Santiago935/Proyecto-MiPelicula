'use client'
 
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import styles from './auth.module.css'
import { useToast, Toast } from './Toast'
 
// ── Tipos ──
interface FieldState {
  value: string
  error: string
  touched: boolean
}
 
interface FieldProps {
  id: string
  label: string
  type?: string
  placeholder: string
  autoComplete?: string
  field: FieldState
  setter: React.Dispatch<React.SetStateAction<FieldState>>
  validator: (v: string) => string
  maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  withEye?: boolean
  showEye?: boolean
  onToggleEye?: () => void
}
 
// ── Regex ──
const NAME_RE  = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USER_RE  = /^[^\s]{1,20}$/
 
// ── Validators ──
const validators = {
  nombre:    (v: string) => NAME_RE.test(v.trim())  ? '' : 'Solo letras, hasta 20 caracteres.',
  apellido:  (v: string) => NAME_RE.test(v.trim())  ? '' : 'Solo letras, hasta 20 caracteres.',
  correo:    (v: string) => EMAIL_RE.test(v.trim()) ? '' : 'Ingresá un correo válido (usuario@dominio).',
  telefono:  (v: string) => v.replace(/\D/g, '').length >= 8 ? '' : 'El teléfono debe tener al menos 8 dígitos.',
  usuario:   (v: string) => USER_RE.test(v.trim())  ? '' : 'Hasta 20 caracteres, sin espacios.',
  password:  (v: string) => v.length >= 4 ? '' : 'La contraseña debe tener al menos 4 caracteres.',
  password2: (v: string, pw: string) => v === pw ? '' : 'Las contraseñas no coinciden.',
}
 
function initField(): FieldState {
  return { value: '', error: '', touched: false }
}
 
function passwordStrength(val: string): { pct: string; color: string } {
  let score = 0
  if (val.length >= 4) score++
  if (val.length >= 8) score++
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  const pcts   = ['0%', '25%', '50%', '75%', '100%']
  const colors = ['transparent', '#E5001A', '#FF8C00', '#EAB308', '#22C55E']
  return { pct: pcts[score], color: colors[score] }
}
 
// ── EyeIcon ──
const EyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const EyeClosed = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)
 
// ─────────────────────────────────────────────
// Field — definido FUERA del componente principal
// para que React no lo desmonte en cada render
// ─────────────────────────────────────────────
function Field({
  id, label, type = 'text', placeholder, autoComplete,
  field, setter, validator, maxLength, inputMode,
  withEye, showEye, onToggleEye,
}: FieldProps) {
  const hasError = field.touched && !!field.error
  const isValid  = field.touched && !field.error
 
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          type={withEye && showEye ? 'text' : type}
          inputMode={inputMode}
          className={[
            styles.input,
            withEye ? styles.inputWithEye : '',
            hasError ? styles.inputInvalid : '',
            isValid  ? styles.inputValid   : '',
          ].join(' ')}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          value={field.value}
          onChange={e => setter(prev => ({ ...prev, value: e.target.value }))}
          onBlur={() => setter(prev => ({ ...prev, error: validator(prev.value), touched: true }))}
        />
        {withEye && (
          <button
            type="button"
            className={styles.eyeBtn}
            aria-label={showEye ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={onToggleEye}
          >
            {showEye ? <EyeClosed /> : <EyeOpen />}
          </button>
        )}
      </div>
      {hasError && (
        <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`} role="alert">
          {field.error}
        </p>
      )}
    </div>
  )
}
 
// ─────────────────────────────────────────────
// RegisterForm
// ─────────────────────────────────────────────
interface Props {
  onSwitchToLogin: () => void
}
 
export default function RegisterForm({ onSwitchToLogin }: Props) {
  const { toast, showToast } = useToast()
 
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [nombre,    setNombre]    = useState(initField())
  const [apellido,  setApellido]  = useState(initField())
  const [correo,    setCorreo]    = useState(initField())
  const [telefono,  setTelefono]  = useState(initField())
  const [usuario,   setUsuario]   = useState(initField())
  const [password,  setPassword]  = useState(initField())
  const [password2, setPassword2] = useState(initField())
  const [showPw,    setShowPw]    = useState(false)
  const [showPw2,   setShowPw2]   = useState(false)
 
  const strength = passwordStrength(password.value)
 
  function touch(setter: React.Dispatch<React.SetStateAction<FieldState>>, error: string) {
    setter(prev => ({ ...prev, error, touched: true }))
  }
 
  function validate() {
    const n  = validators.nombre(nombre.value)
    const ap = validators.apellido(apellido.value)
    const co = validators.correo(correo.value)
    const te = validators.telefono(telefono.value)
    const us = validators.usuario(usuario.value)
    const pw = validators.password(password.value)
    const p2 = validators.password2(password2.value, password.value)
 
    touch(setNombre,    n)
    touch(setApellido,  ap)
    touch(setCorreo,    co)
    touch(setTelefono,  te)
    touch(setUsuario,   us)
    touch(setPassword,  pw)
    touch(setPassword2, p2)
 
    return !n && !ap && !co && !te && !us && !pw && !p2
  }
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      showToast('Revisá los campos marcados.', 'error')
      return
    }
 
    setLoading(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: correo.value.trim(),
        password: password.value,
      })
 
      if (authError) {
        if (authError.message.toLowerCase().includes('already registered')) {
          touch(setCorreo, 'Este correo ya está registrado.')
        }
        showToast('No se pudo crear la cuenta.', 'error')
        return
      }
 
      const userId = authData.user?.id
      if (!userId) throw new Error('No se obtuvo ID de usuario.')
 
      // Un solo RPC atómico: inserta Cliente + Cuenta en una transacción
      const { error: rpcError } = await supabase.rpc('registrar_cliente', {
        p_auth_id:  userId,
        p_nombre:   nombre.value.trim(),
        p_apellido: apellido.value.trim(),
        p_correo:   correo.value.trim(),
        p_telefono: telefono.value.replace(/\D/g, ''),
        p_usuario:  usuario.value.trim(),
      })
 
      if (rpcError) {
        if (rpcError.message.includes('usuario')) {
          touch(setUsuario, 'Este nombre de usuario ya está en uso.')
        }
        showToast('Error al guardar los datos.', 'error')
        return
      }
 
      setSuccess(true)
      showToast('¡Cuenta creada con éxito!', 'success')
 
    } catch {
      showToast('Error inesperado. Intentá de nuevo.', 'error')
    } finally {
      setLoading(false)
    }
  }
 
  if (success) {
    return (
      <>
        <div className={styles.successState}>
          <div className={styles.successIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div className={styles.successTitle}>¡Cuenta creada!</div>
          <p className={styles.successMsg}>Ya podés iniciar sesión con tus datos.</p>
          <button className={styles.linkBtn} style={{ marginTop: 16 }} onClick={onSwitchToLogin}>
            Ir al inicio de sesión →
          </button>
        </div>
        <Toast {...toast} />
      </>
    )
  }
 
  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
 
        <div className={styles.fieldRow}>
          <Field id="reg-nombre"   label="Nombre"   placeholder="Juan"  autoComplete="given-name"
            field={nombre}   setter={setNombre}   validator={validators.nombre}   maxLength={20} />
          <Field id="reg-apellido" label="Apellido" placeholder="Pérez" autoComplete="family-name"
            field={apellido} setter={setApellido} validator={validators.apellido} maxLength={20} />
        </div>
 
        <Field id="reg-correo" label="Correo electrónico" type="email"
          placeholder="juan@ejemplo.com" autoComplete="email"
          field={correo} setter={setCorreo} validator={validators.correo} />
 
        <Field id="reg-telefono" label="Teléfono" type="tel" inputMode="tel"
          placeholder="11 2345 6789" autoComplete="tel"
          field={telefono} setter={setTelefono} validator={validators.telefono} maxLength={15} />
 
        <Field id="reg-usuario" label="Nombre de usuario"
          placeholder="juanperez92" autoComplete="username"
          field={usuario} setter={setUsuario} validator={validators.usuario} maxLength={20} />
 
        {/* Contraseña con barra de fortaleza (manual porque tiene el strength bar) */}
        <div className={styles.field}>
          <label className={styles.label} htmlFor="reg-pass">Contraseña</label>
          <div className={styles.inputWrap}>
            <input
              id="reg-pass"
              type={showPw ? 'text' : 'password'}
              className={[
                styles.input, styles.inputWithEye,
                password.touched && password.error  ? styles.inputInvalid : '',
                password.touched && !password.error ? styles.inputValid   : '',
              ].join(' ')}
              placeholder="Mínimo 4 caracteres"
              autoComplete="new-password"
              value={password.value}
              onChange={e => setPassword(prev => ({ ...prev, value: e.target.value }))}
              onBlur={() => setPassword(prev => ({ ...prev, error: validators.password(prev.value), touched: true }))}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
              {showPw ? <EyeClosed /> : <EyeOpen />}
            </button>
          </div>
          <div className={styles.strengthBar}>
            <div className={styles.strengthFill} style={{ width: strength.pct, background: strength.color }} />
          </div>
          {password.touched && password.error && (
            <p className={`${styles.fieldError} ${styles.fieldErrorVisible}`} role="alert">
              {password.error}
            </p>
          )}
        </div>
 
        <Field id="reg-pass2" label="Confirmar contraseña" type="password"
          placeholder="Repetí tu contraseña" autoComplete="new-password"
          field={password2} setter={setPassword2}
          validator={(v) => validators.password2(v, password.value)}
          withEye showEye={showPw2} onToggleEye={() => setShowPw2(v => !v)} />
 
        <button type="submit" className={styles.btnPrimary} disabled={loading}>
          {loading ? <span className={styles.spinner} /> : 'Crear sesión'}
        </button>
      </form>
 
      <p className={styles.linkText}>
        ¿Ya tenés cuenta?{' '}
        <button className={styles.linkBtn} onClick={onSwitchToLogin}>
          Iniciar sesión
        </button>
      </p>
 
      <Toast {...toast} />
    </>
  )
}
