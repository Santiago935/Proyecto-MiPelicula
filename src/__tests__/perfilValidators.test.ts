import { describe, it, expect } from 'vitest'
import { perfilValidators, passwordStrength } from '@/lib/validators'

// ── perfilValidators ───────────────────────────────────────────────────────
// Todos los campos son opcionales: vacío siempre es válido (el usuario
// no está obligado a cambiar nada en la pantalla de perfil)

describe('perfilValidators.usuario', () => {
  it('acepta vacío (campo opcional)', () => {
    expect(perfilValidators.usuario('')).toBe('')
  })

  it('acepta un usuario válido sin espacios', () => {
    expect(perfilValidators.usuario('juan_92')).toBe('')
  })

  it('rechaza un usuario con espacios', () => {
    expect(perfilValidators.usuario('juan perez')).not.toBe('')
  })

  it('rechaza un usuario de más de 20 caracteres', () => {
    expect(perfilValidators.usuario('usuariomuylargoquenosirve')).not.toBe('')
  })
})

describe('perfilValidators.telefono', () => {
  it('acepta vacío (campo opcional)', () => {
    expect(perfilValidators.telefono('')).toBe('')
  })

  it('acepta un teléfono con 8 o más dígitos', () => {
    expect(perfilValidators.telefono('11 2345-6789')).toBe('')
  })

  it('rechaza un teléfono con menos de 8 dígitos', () => {
    expect(perfilValidators.telefono('1234567')).not.toBe('')
  })
})

describe('perfilValidators.direccion', () => {
  it('acepta vacío (campo opcional)', () => {
    expect(perfilValidators.direccion('')).toBe('')
  })

  it('acepta una dirección de hasta 40 caracteres', () => {
    expect(perfilValidators.direccion('Av. Corrientes 1234, CABA')).toBe('')
  })

  it('acepta exactamente 40 caracteres', () => {
    expect(perfilValidators.direccion('A'.repeat(40))).toBe('')
  })

  it('rechaza una dirección de más de 40 caracteres', () => {
    expect(perfilValidators.direccion('A'.repeat(41))).not.toBe('')
  })
})

describe('perfilValidators.password', () => {
  it('acepta vacío (no cambiar contraseña)', () => {
    expect(perfilValidators.password('')).toBe('')
  })

  it('acepta una contraseña de 6 o más caracteres', () => {
    expect(perfilValidators.password('abc123')).toBe('')
  })

  it('rechaza una contraseña de menos de 6 caracteres', () => {
    expect(perfilValidators.password('abc')).not.toBe('')
  })
})

// ── passwordStrength ───────────────────────────────────────────────────────
// score 0 → 0%, score 1 → 25%, score 2 → 50%, score 3 → 75%, score 4 → 100%

describe('passwordStrength', () => {
  it('contraseña vacía devuelve 0% (score 0)', () => {
    expect(passwordStrength('').pct).toBe('0%')
  })

  it('contraseña de 4 caracteres devuelve 25% (score 1)', () => {
    expect(passwordStrength('abcd').pct).toBe('25%')
  })

  it('contraseña de 8 caracteres devuelve 50% (score 2)', () => {
    expect(passwordStrength('abcdefgh').pct).toBe('50%')
  })

  it('contraseña larga con mayúscula y número devuelve 75% (score 3)', () => {
    expect(passwordStrength('Abcdefg1').pct).toBe('75%')
  })

  it('contraseña larga con mayúscula, número y especial devuelve 100% (score 4)', () => {
    expect(passwordStrength('Abcdefg1!').pct).toBe('100%')
  })

  it('contraseña vacía tiene color transparente', () => {
    expect(passwordStrength('').color).toBe('transparent')
  })

  it('contraseña fuerte tiene color verde', () => {
    expect(passwordStrength('Abcdefg1!').color).toBe('#22C55E')
  })
})
