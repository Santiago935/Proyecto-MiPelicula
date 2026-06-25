import AuthCard from '@/components/auth/AuthCard'
 
export const metadata = {
  title: 'MiPelícula — Acceso',
}
 
export default function AuthPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 16px',
        background: 'var(--black)',
        position: 'relative',
      }}
    >
      <AuthCard />
    </main>
  )
}