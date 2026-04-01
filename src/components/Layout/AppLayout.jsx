import { Header } from './Header'

export function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t border-white/[0.08] py-4 text-center text-xs text-text-secondary mt-8">
        © {new Date().getFullYear()} BuyHelp Conecta — Todos os direitos reservados
      </footer>
    </div>
  )
}
