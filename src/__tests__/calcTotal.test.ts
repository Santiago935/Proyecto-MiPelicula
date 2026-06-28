import { describe, it, expect } from 'vitest'
import { calcTotal } from '@/app/alquilar/steps/StepResumen'
import type { Pelicula } from '@/app/alquilar/steps/StepPeliculas'
import type { SnackItem } from '@/app/alquilar/steps/StepSnacks'

// Película de prueba: $1000 precio base
// Fórmula: precio × dias,  donde dias = diferencia en días entre envío y devolución
//   18→19 (diff 1) → 1 día  → $1000
//   01→03 (diff 2) → 2 días → $2000
//   01→04 (diff 3) → 3 días → $3000
//   01→08 (diff 7) → 7 días → $7000
const peli: Pelicula = {
  id: 1,
  nombre: 'El Padrino',
  genero: 'Drama',
  descripcion: null,
  precio: 1000,
  duracion: 175,
  imagen_url: null,
}

// Snack de prueba: $500 c/u
const snackItem = (cantidad: number): SnackItem => ({
  snack: { id: 1, nombre: 'Pochoclo', precio: 500, imagen_url: null },
  cantidad,
})

// ── días ───────────────────────────────────────────────────────────────────

describe('calcTotal — días', () => {
  it('cuenta 1 día cuando envío y devolución son el mismo día', () => {
    // mismo día → diff 0 → Math.max(1,0) = 1
    const { dias } = calcTotal([peli], [], '2026-10-01', '2026-10-01')
    expect(dias).toBe(1)
  })

  it('cuenta 1 día para alquiler de un día (18→19)', () => {
    // diff 1 → 1 día
    const { dias } = calcTotal([peli], [], '2026-10-18', '2026-10-19')
    expect(dias).toBe(1)
  })

  it('cuenta 3 días cuando la diferencia es de 3 días (01→04)', () => {
    // diff 3 → 3 días
    const { dias } = calcTotal([peli], [], '2026-10-01', '2026-10-04')
    expect(dias).toBe(3)
  })

  it('cuenta 7 días para una semana (01→08)', () => {
    // diff 7 → 7 días
    const { dias } = calcTotal([peli], [], '2026-10-01', '2026-10-08')
    expect(dias).toBe(7)
  })
})

// ── subtotal películas ─────────────────────────────────────────────────────

describe('calcTotal — subtotal películas', () => {
  it('1 película, 1 día (18→19): precio × 1', () => {
    const { subtotalPelis } = calcTotal([peli], [], '2026-10-18', '2026-10-19')
    expect(subtotalPelis).toBe(1000)
  })

  it('1 película, 2 días (01→03): precio × 2', () => {
    const { subtotalPelis } = calcTotal([peli], [], '2026-10-01', '2026-10-03')
    expect(subtotalPelis).toBe(2000)
  })

  it('1 película, 3 días (01→04): precio × 3', () => {
    const { subtotalPelis } = calcTotal([peli], [], '2026-10-01', '2026-10-04')
    expect(subtotalPelis).toBe(3000)
  })

  it('1 película, 7 días (01→08): precio × 7', () => {
    const { subtotalPelis } = calcTotal([peli], [], '2026-10-01', '2026-10-08')
    expect(subtotalPelis).toBe(7000)
  })

  it('2 películas, 2 días: 2 × precio × 2', () => {
    const { subtotalPelis } = calcTotal([peli, peli], [], '2026-10-01', '2026-10-03')
    expect(subtotalPelis).toBe(4000)
  })

  it('devuelve 0 si no hay películas', () => {
    const { subtotalPelis } = calcTotal([], [], '2026-10-18', '2026-10-19')
    expect(subtotalPelis).toBe(0)
  })
})

// ── subtotal snacks ────────────────────────────────────────────────────────

describe('calcTotal — subtotal snacks', () => {
  it('calcula correctamente 2 snacks a $500 cada uno', () => {
    const { subtotalSnacks } = calcTotal([], [snackItem(2)], '2026-10-18', '2026-10-19')
    expect(subtotalSnacks).toBe(1000)
  })

  it('ignora snacks con cantidad 0', () => {
    const { subtotalSnacks } = calcTotal([], [snackItem(0)], '2026-10-18', '2026-10-19')
    expect(subtotalSnacks).toBe(0)
  })

  it('devuelve 0 si no hay snacks', () => {
    const { subtotalSnacks } = calcTotal([peli], [], '2026-10-18', '2026-10-19')
    expect(subtotalSnacks).toBe(0)
  })
})

// ── comisión ───────────────────────────────────────────────────────────────

describe('calcTotal — comisión (5%)', () => {
  it('5% sobre películas y snacks combinados (1 día)', () => {
    // pelis: $1000, snacks: $1000, base: $2000, comisión: $100
    const { comision } = calcTotal([peli], [snackItem(2)], '2026-10-18', '2026-10-19')
    expect(comision).toBe(100)
  })

  it('5% solo sobre películas sin snacks (1 día)', () => {
    // pelis: $1000, comisión: $50
    const { comision } = calcTotal([peli], [], '2026-10-18', '2026-10-19')
    expect(comision).toBe(50)
  })

  it('5% sobre 3 días de alquiler (01→04)', () => {
    // pelis: $3000, comisión: $150
    const { comision } = calcTotal([peli], [], '2026-10-01', '2026-10-04')
    expect(comision).toBe(150)
  })
})

// ── total final ────────────────────────────────────────────────────────────

describe('calcTotal — total', () => {
  it('total = subtotalPelis + subtotalSnacks + comisión (1 día)', () => {
    // $1000 + $1000 + $100 = $2100
    const { total } = calcTotal([peli], [snackItem(2)], '2026-10-18', '2026-10-19')
    expect(total).toBe(2100)
  })

  it('total sin snacks, 1 día: $1000 + 5% = $1050', () => {
    const { total } = calcTotal([peli], [], '2026-10-18', '2026-10-19')
    expect(total).toBe(1050)
  })

  it('total sin snacks, 3 días (01→04): $3000 + 5% = $3150', () => {
    const { total } = calcTotal([peli], [], '2026-10-01', '2026-10-04')
    expect(total).toBe(3150)
  })

  it('total con todo en cero es 0', () => {
    const { total } = calcTotal([], [], '2026-10-18', '2026-10-19')
    expect(total).toBe(0)
  })
})
