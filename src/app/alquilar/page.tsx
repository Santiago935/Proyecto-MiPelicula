'use client'

import { useRouter } from 'next/navigation'

export default function AlquilarPage() {
  const router = useRouter()
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, fontFamily: 'var(--font-body)', color: 'var(--cream)' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: 4 }}>Próximamente</p>
      <p style={{ color: 'var(--gray)', fontSize: 14 }}>El catálogo de alquiler estará disponible pronto.</p>
      <button
        onClick={() => router.push('/menu')}
        style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 3, padding: '8px 20px', color: 'var(--gray)', cursor: 'pointer', fontFamily: 'var(--font-display)', letterSpacing: 2, fontSize: 13 }}
      >
        ← Volver al menú
      </button>
    </main>
  )
}
