import styles from '../alquilar.module.css'

export interface Snack {
  id: number
  nombre: string
  precio: number
  imagen_url: string | null
}

export interface SnackItem {
  snack: Snack
  cantidad: number
}

interface Props {
  snacks: Snack[]
  snacksConCantidad: SnackItem[]
  onCambiarCantidad: (snackId: number, delta: number) => void
}

export default function StepSnacks({ snacks, snacksConCantidad, onCambiarCantidad }: Props) {
  const getCantidad = (id: number) =>
    snacksConCantidad.find(s => s.snack.id === id)?.cantidad ?? 0

  if (snacks.length === 0) {
    return (
      <>
        <div className={styles.stepTitle}>Elegí tus snacks</div>
        <div className={styles.stepSubtitle}>No hay snacks disponibles por el momento.</div>
      </>
    )
  }

  return (
    <>
      <div className={styles.stepTitle}>Elegí tus snacks</div>
      <div className={styles.stepSubtitle}>
        Este paso es opcional. Podés continuar sin agregar nada.
      </div>
      <div className={styles.snackGrid}>
        {snacks.map(s => {
          const cant = getCantidad(s.id)
          return (
            <div key={s.id} className={styles.snackCard}>
              <div className={styles.snackNombre}>{s.nombre}</div>
              <div className={styles.snackPrecio}>
                ARS {new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(s.precio)}
              </div>
              <div className={styles.snackQty}>
                <button
                  type="button"
                  className={styles.snackQtyBtn}
                  onClick={() => onCambiarCantidad(s.id, -1)}
                  disabled={cant === 0}
                >
                  −
                </button>
                <span className={styles.snackQtyNum}>{cant}</span>
                <button
                  type="button"
                  className={styles.snackQtyBtn}
                  onClick={() => onCambiarCantidad(s.id, 1)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
