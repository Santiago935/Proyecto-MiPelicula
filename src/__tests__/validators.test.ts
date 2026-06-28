import { describe, it, expect } from 'vitest'
import { authValidators } from '@/lib/validators'

// ── nombre / apellido ──────────────────────────────────────────────────────

describe('authValidators.nombre', () => {
  it('acepta un nombre válido con letras y espacios', () => {
    expect(authValidators.nombre('Juan')).toBe('')
  })

  it('acepta letras con tildes y eñe', () => {
    expect(authValidators.nombre('María José')).toBe('')
  })

  it('rechaza un nombre vacío', () => {
    expect(authValidators.nombre('')).not.toBe('')
  })

  it('rechaza un nombre con números', () => {
    expect(authValidators.nombre('Juan123')).not.toBe('')
  })

  it('rechaza un nombre con más de 20 caracteres', () => {
    expect(authValidators.nombre('Nombre Muy Largo Aqui Extra')).not.toBe('')
  })
})

describe('authValidators.apellido', () => {
  it('acepta un apellido válido', () => {
    expect(authValidators.apellido('García')).toBe('')
  })

  it('rechaza un apellido vacío', () => {
    expect(authValidators.apellido('')).not.toBe('')
  })

  it('rechaza un apellido con caracteres especiales', () => {
    expect(authValidators.apellido('Pérez!')).not.toBe('')
  })
})

// ── correo ─────────────────────────────────────────────────────────────────

describe('authValidators.correo', () => {
  it('acepta un correo con formato válido', () => {
    expect(authValidators.correo('usuario@dominio.com')).toBe('')
  })

  it('acepta un correo con subdominio', () => {
    expect(authValidators.correo('test@mail.co.uk')).toBe('')
  })

  it('rechaza un correo sin @', () => {
    expect(authValidators.correo('usuariosindominio.com')).not.toBe('')
  })

  it('rechaza un correo sin dominio', () => {
    expect(authValidators.correo('usuario@')).not.toBe('')
  })

  it('rechaza un correo vacío', () => {
    expect(authValidators.correo('')).not.toBe('')
  })

  it('rechaza un correo con espacios', () => {
    expect(authValidators.correo('usuario @dominio.com')).not.toBe('')
  })
})

// ── telefono ───────────────────────────────────────────────────────────────

describe('authValidators.telefono', () => {
  it('acepta un teléfono con 8 dígitos exactos', () => {
    expect(authValidators.telefono('12345678')).toBe('')
  })

  it('acepta un teléfono con espacios y guiones (solo cuenta los dígitos)', () => {
    expect(authValidators.telefono('11 2345-6789')).toBe('')
  })

  it('acepta un teléfono con más de 8 dígitos', () => {
    expect(authValidators.telefono('1112345678')).toBe('')
  })

  it('rechaza un teléfono con menos de 8 dígitos', () => {
    expect(authValidators.telefono('1234567')).not.toBe('')
  })

  it('rechaza un teléfono vacío', () => {
    expect(authValidators.telefono('')).not.toBe('')
  })
})

// ── usuario ────────────────────────────────────────────────────────────────

describe('authValidators.usuario', () => {
  it('acepta un usuario válido sin espacios', () => {
    expect(authValidators.usuario('juanperez92')).toBe('')
  })

  it('acepta un usuario con caracteres especiales (sin espacios)', () => {
    expect(authValidators.usuario('juan_perez')).toBe('')
  })

  it('rechaza un usuario con espacios', () => {
    expect(authValidators.usuario('juan perez')).not.toBe('')
  })

  it('rechaza un usuario vacío', () => {
    expect(authValidators.usuario('')).not.toBe('')
  })

  it('rechaza un usuario con más de 20 caracteres', () => {
    expect(authValidators.usuario('usuariomuylargoquenosirve')).not.toBe('')
  })
})

// ── password ───────────────────────────────────────────────────────────────

describe('authValidators.password', () => {
  it('acepta una contraseña de exactamente 6 caracteres', () => {
    expect(authValidators.password('abc123')).toBe('')
  })

  it('acepta una contraseña larga', () => {
    expect(authValidators.password('contrasenaMuySegura!123')).toBe('')
  })

  it('rechaza una contraseña de menos de 6 caracteres', () => {
    expect(authValidators.password('abc')).not.toBe('')
  })

  it('rechaza una contraseña vacía', () => {
    expect(authValidators.password('')).not.toBe('')
  })
})

// ── password2 (confirmación) ───────────────────────────────────────────────

describe('authValidators.password2', () => {
  it('acepta cuando las contraseñas coinciden', () => {
    expect(authValidators.password2('abc123', 'abc123')).toBe('')
  })

  it('rechaza cuando las contraseñas no coinciden', () => {
    expect(authValidators.password2('abc123', 'xyz789')).not.toBe('')
  })

  it('rechaza cuando la confirmación está vacía y la original no', () => {
    expect(authValidators.password2('', 'abc123')).not.toBe('')
  })
})
