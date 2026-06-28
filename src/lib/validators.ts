const NAME_RE  = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{1,20}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USER_RE  = /^[^\s]{1,20}$/

export const authValidators = {
  nombre:    (v: string) => NAME_RE.test(v.trim())  ? '' : 'Solo letras, hasta 20 caracteres.',
  apellido:  (v: string) => NAME_RE.test(v.trim())  ? '' : 'Solo letras, hasta 20 caracteres.',
  correo:    (v: string) => EMAIL_RE.test(v.trim()) ? '' : 'Ingresá un correo válido (usuario@dominio).',
  telefono:  (v: string) => v.replace(/\D/g, '').length >= 8 ? '' : 'El teléfono debe tener al menos 8 dígitos.',
  usuario:   (v: string) => USER_RE.test(v.trim())  ? '' : 'Hasta 20 caracteres, sin espacios.',
  password:  (v: string) => v.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres.',
  password2: (v: string, pw: string) => v === pw ? '' : 'Las contraseñas no coinciden.',
}

// Validators del perfil: todos los campos son opcionales (vacío = sin cambios)
export const perfilValidators = {
  usuario:   (v: string) => v === '' || USER_RE.test(v.trim()) ? '' : 'Hasta 20 caracteres, sin espacios.',
  telefono:  (v: string) => v === '' || v.replace(/\D/g, '').length >= 8 ? '' : 'El teléfono debe tener al menos 8 dígitos.',
  direccion: (v: string) => v === '' || v.trim().length <= 40 ? '' : 'Máximo 40 caracteres.',
  password:  (v: string) => v === '' || v.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres.',
}

export function passwordStrength(val: string): { pct: string; color: string } {
  let score = 0
  if (val.length >= 4) score++
  if (val.length >= 8) score++
  if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  const pcts   = ['0%', '25%', '50%', '75%', '100%']
  const colors = ['transparent', '#E5001A', '#FF8C00', '#EAB308', '#22C55E']
  return { pct: pcts[score], color: colors[score] }
}
