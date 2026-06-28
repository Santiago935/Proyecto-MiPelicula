import styles from '../alquilar.module.css'

export interface Pelicula {
  id: number
  nombre: string
  genero: string
  descripcion: string | null
  precio: number
  duracion: number | null
  imagen_url: string | null
}

interface Props {
  peliculas: Pelicula[]
  selected: Pelicula[]
  onToggle: (p: Pelicula) => void
}

export default function StepPeliculas({ peliculas, selected, onToggle }: Props) {
  const isSelected = (id: number) => selected.some(p => p.id === id)

  return (
    <>
      <div className={styles.stepTitle}>Elegí tu película</div>
      <div className={styles.stepSubtitle}>
        Seleccioná las películas que querés alquilar. Podés elegir varias.
      </div>
      <div className={styles.selectedCount}>
        <span>{selected.length}</span> película{selected.length !== 1 ? 's' : ''} seleccionada{selected.length !== 1 ? 's' : ''}
      </div>
      <div className={styles.movieGrid}>
        {peliculas.map(p => (
          <button
            key={p.id}
            type="button"
            className={`${styles.movieCard} ${isSelected(p.id) ? styles.selected : ''}`}
            onClick={() => onToggle(p)}
          >
            {p.imagen_url
              ? <img src={p.imagen_url} alt={p.nombre} className={styles.movieImg} />
              : (
                <div className={styles.moviePlaceholder}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" style={{ opacity: 0.3 }}>
                    <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zM7 8H5V6h2v2zm0 4H5v-2h2v2zm0 4H5v-2h2v2zm12-8h-2V6h2v2zm0 4h-2v-2h2v2zm0 4h-2v-2h2v2zm-3-9H8V7h8v6z" />
                  </svg>
                  <span className={styles.moviePlaceholderTitle}>{p.nombre}</span>
                </div>
              )
            }
            <div className={styles.movieOverlay}>
              <span className={styles.movieOverlayGenero}>{p.genero}</span>
              <span className={styles.movieOverlayNombre}>{p.nombre}</span>
              {p.duracion != null && (
                <span className={styles.movieOverlayDuracion}>{p.duracion} min</span>
              )}
              {p.descripcion && (
                <span className={styles.movieOverlayDesc}>{p.descripcion}</span>
              )}
            </div>
            <div className={styles.movieCheck}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </>
  )
}
