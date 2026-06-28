'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { perfilValidators } from '@/lib/validators'
import styles from './perfil.module.css'
import { useToast, Toast } from '@/components/auth/Toast'

// ── Tipos ──
interface FieldState {
  value: string
  error: string
  touched: boolean
}

function initField(value = ''): FieldState {
  return { value, error: '', touched: false }
}

const validators = perfilValidators

// ── Film Strip ──
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

// ── Componente Field reutilizable ──
function Field({
  id, label, type = 'text', placeholder, autoComplete, field, setter, validator, maxLength, inputMode,
  withEye, showEye, onToggleEye,
}: {
  id: string; label: string; type?: string; placeholder: string; autoComplete?: string
  field: FieldState; setter: React.Dispatch<React.SetStateAction<FieldState>>
  validator: (v: string) => string; maxLength?: number
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  withEye?: boolean; showEye?: boolean; onToggleEye?: () => void
}) {
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
          <button type="button" className={styles.eyeBtn}
            aria-label={showEye ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={onToggleEye}>
            {showEye ? (
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
// PerfilPage
// ─────────────────────────────────────────────
export default function PerfilPage() {
  const router = useRouter()
  const { toast, showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading,     setLoading]     = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const [showPw,      setShowPw]      = useState(false)

  // IDs necesarios para las actualizaciones
  const [clienteId, setClienteId] = useState<number | null>(null)

  // Estado de la foto
  const [fotoUrl,     setFotoUrl]     = useState<string | null>(null)
  const [fotoFile,    setFotoFile]    = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)

  // Campos del formulario
  const [usuario,   setUsuario]   = useState(initField())
  const [telefono,  setTelefono]  = useState(initField())
  const [direccion, setDireccion] = useState(initField())
  const [password,  setPassword]  = useState(initField())

  // ── Cargar datos al montar ──
  useEffect(() => {
    async function cargarPerfil() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/auth'); return }

      const { data: cliente, error: clienteError } = await supabase
        .from('Cliente')
        .select('idCliente, telefono, direccion, foto_perfil, Cuenta(usuario)')
        .eq('auth_id', user.id)
        .single()

      if (clienteError || !cliente) {
        showToast('No se pudo cargar el perfil.', 'error')
        setDataLoading(false)
        return
      }

      const cuenta = Array.isArray(cliente.Cuenta) ? cliente.Cuenta[0] : cliente.Cuenta

      setClienteId(cliente.idCliente)
      setFotoUrl(cliente.foto_perfil ?? null)
      setTelefono(initField(String(cliente.telefono ?? '')))
      setDireccion(initField(cliente.direccion ?? ''))
      setUsuario(initField(cuenta?.usuario ?? ''))
      setDataLoading(false)
    }
    cargarPerfil()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Selección de foto ──
  function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFotoFile(file)
    setFotoPreview(URL.createObjectURL(file))
  }

  // ── Validación ──
  function validate() {
    const u  = validators.usuario(usuario.value)
    const te = validators.telefono(telefono.value)
    const di = validators.direccion(direccion.value)
    const pw = validators.password(password.value)

    setUsuario(prev  => ({ ...prev, error: u,  touched: true }))
    setTelefono(prev => ({ ...prev, error: te, touched: true }))
    setDireccion(prev => ({ ...prev, error: di, touched: true }))
    setPassword(prev => ({ ...prev, error: pw, touched: true }))

    return !u && !te && !di && !pw
  }

  // ── Guardar ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) { showToast('Revisá los campos marcados.', 'error'); return }
    if (!clienteId)  { showToast('Error: no se encontró el perfil.', 'error'); return }

    setLoading(true)
    try {
      let nuevaFotoUrl = fotoUrl

      // 1. Subir foto si se seleccionó una nueva
      if (fotoFile) {
        const ext  = fotoFile.name.split('.').pop()
        const path = `${clienteId}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatares')
          .upload(path, fotoFile, { upsert: true })

        if (uploadError) {
          showToast('No se pudo subir la foto.', 'error')
          setLoading(false)
          return
        }
        const { data: urlData } = supabase.storage.from('avatares').getPublicUrl(path)
        nuevaFotoUrl = urlData.publicUrl
      }

      // 2. Actualizar Clientes
      const { error: clienteError } = await supabase
        .from('Cliente')
        .update({
          ...(telefono.value !== '' && { telefono: telefono.value.replace(/\D/g, '') }),
          ...(direccion.value !== '' && { direccion: direccion.value.trim() }),
          ...(fotoFile && { foto_perfil: nuevaFotoUrl }),
        })
        .eq('idCliente', clienteId)

      if (clienteError) {
        showToast('Error al actualizar los datos.', 'error')
        setLoading(false)
        return
      }

      // 3. Actualizar Cuenta (usuario) solo si se ingresó uno
      if (usuario.value.trim() !== '') {
        const { error: cuentaError } = await supabase
          .from('Cuenta')
          .update({ usuario: usuario.value.trim() })
          .eq('idCliente', clienteId)

        if (cuentaError) {
          const msg = cuentaError.message?.toLowerCase().includes('usuario')
            ? 'Ese nombre de usuario ya está en uso.'
            : 'Error al actualizar el usuario.'
          showToast(msg, 'error')
          setLoading(false)
          return
        }
      }

      // 4. Actualizar contraseña (solo si se ingresó una nueva)
      if (password.value) {
        const { error: authError } = await supabase.auth.updateUser({ password: password.value })
        if (authError) {
          showToast('Error al actualizar la contraseña.', 'error')
          setLoading(false)
          return
        }
      }

      setFotoUrl(nuevaFotoUrl)
      setFotoFile(null)
      setFotoPreview(null)
      setPassword(initField())
      showToast('Perfil actualizado correctamente.', 'success')

    } catch {
      showToast('Error inesperado. Intentá de nuevo.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading state ──
  if (dataLoading) {
    return (
      <>
        <FilmStrip />
        <FilmStrip reverse />
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.loadingWrap}>
          <div className={styles.loadingSpinner} />
          <span>Cargando perfil…</span>
        </div>
      </>
    )
  }

  const avatarSrc = fotoPreview ?? fotoUrl

  return (
    <>
      <FilmStrip />
      <FilmStrip reverse />
      <div className={styles.grain} aria-hidden="true" />

      <main className={styles.page}>
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.push('/menu')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Menú
          </button>
          <h1 className={styles.pageTitle}>Tu Perfil</h1>
        </header>

        <div className={styles.card}>
          <form onSubmit={handleSubmit} noValidate>

            {/* ── Foto de perfil ── */}
            <div className={styles.avatarSection}>
              <div className={styles.avatarWrap} onClick={() => fileInputRef.current?.click()} title="Cambiar foto">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="Foto de perfil" className={styles.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="40" height="40">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <div className={styles.avatarOverlay}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              <span className={styles.avatarHint}>Tocá para cambiar la foto</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handleFotoChange}
              />
            </div>

            <hr className={styles.divider} />

            {/* ── Datos de cuenta ── */}
            <p className={styles.sectionLabel}>Cuenta</p>

            <Field
              id="perfil-usuario" label="Nombre de usuario"
              placeholder="tu_usuario" autoComplete="username"
              field={usuario} setter={setUsuario}
              validator={validators.usuario} maxLength={20}
            />

            <Field
              id="perfil-pass" label="Nueva contraseña (opcional)"
              type="password" placeholder="Dejá vacío para no cambiarla"
              autoComplete="new-password"
              field={password} setter={setPassword}
              validator={validators.password}
              withEye showEye={showPw} onToggleEye={() => setShowPw(v => !v)}
            />

            <hr className={styles.divider} />

            {/* ── Datos personales ── */}
            <p className={styles.sectionLabel}>Datos personales</p>

            <Field
              id="perfil-telefono" label="Teléfono"
              type="tel" inputMode="tel"
              placeholder="11 2345 6789" autoComplete="tel"
              field={telefono} setter={setTelefono}
              validator={validators.telefono} maxLength={15}
            />

            <Field
              id="perfil-direccion" label="Dirección"
              placeholder="Av. Corrientes 1234, CABA" autoComplete="street-address"
              field={direccion} setter={setDireccion}
              validator={validators.direccion} maxLength={40}
            />

            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : 'Guardar cambios'}
            </button>

          </form>
        </div>
      </main>

      <Toast {...toast} />
    </>
  )
}
