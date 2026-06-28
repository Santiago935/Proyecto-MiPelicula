import { describe, it, expect } from 'vitest'
import {
  validateDireccion,
  validateFechaEnvio,
  validateFechaDevolucion,
} from '@/app/alquilar/steps/StepDatos'

// ── validateDireccion ──────────────────────────────────────────────────────

describe('validateDireccion', () => {
  it('acepta una dirección válida', () => {
    expect(validateDireccion('Av. Corrientes 1234, CABA')).toBe('')
  })

  it('rechaza una dirección vacía', () => {
    expect(validateDireccion('')).not.toBe('')
  })

  it('rechaza una dirección con solo espacios', () => {
    expect(validateDireccion('   ')).not.toBe('')
  })

  it('rechaza una dirección de más de 100 caracteres', () => {
    const larga = 'A'.repeat(101)
    expect(validateDireccion(larga)).not.toBe('')
  })

  it('acepta una dirección de exactamente 100 caracteres', () => {
    const exacta = 'A'.repeat(100)
    expect(validateDireccion(exacta)).toBe('')
  })
})

// ── validateFechaEnvio ─────────────────────────────────────────────────────

describe('validateFechaEnvio', () => {
  it('rechaza una fecha vacía', () => {
    expect(validateFechaEnvio('')).not.toBe('')
  })

  it('rechaza una fecha en el pasado', () => {
    expect(validateFechaEnvio('2020-01-01')).not.toBe('')
  })

  it('acepta una fecha en el futuro', () => {
    expect(validateFechaEnvio('2099-12-31')).toBe('')
  })
})

// ── validateFechaDevolucion ────────────────────────────────────────────────

describe('validateFechaDevolucion', () => {
  it('rechaza una fecha de devolución vacía', () => {
    expect(validateFechaDevolucion('', '2099-10-01')).not.toBe('')
  })

  it('rechaza una devolución igual al envío (debe ser posterior)', () => {
    expect(validateFechaDevolucion('2099-10-01', '2099-10-01')).not.toBe('')
  })

  it('rechaza una devolución anterior al envío', () => {
    expect(validateFechaDevolucion('2099-09-30', '2099-10-01')).not.toBe('')
  })

  it('acepta una devolución el día siguiente al envío', () => {
    expect(validateFechaDevolucion('2099-10-02', '2099-10-01')).toBe('')
  })

  it('acepta una devolución varios días después del envío', () => {
    expect(validateFechaDevolucion('2099-10-15', '2099-10-01')).toBe('')
  })
})
