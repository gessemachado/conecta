import { BookOpen } from 'lucide-react'

export function ColaboradorSectionHeader({ subtitle = 'Sua jornada de aprendizagem' }) {
  return (
    <div
      className="border-b"
      style={{ background: '#0D0D0D', borderColor: '#292929' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
        {/* Title row */}
        <div>
          <h1 className="text-2xl font-bold text-white leading-tight">BuyHelp Conecta</h1>
          <p className="text-sm mt-0.5" style={{ color: '#999999' }}>{subtitle}</p>
        </div>

        {/* Single nav pill */}
        <div className="flex items-center gap-3">
          <span
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold"
            style={{
              background: '#FF6600',
              color: '#fff',
              boxShadow: '0px 4px 6px -4px rgba(249,115,22,0.2), 0px 10px 15px -3px rgba(249,115,22,0.2)',
            }}
          >
            <BookOpen size={15} />
            Trilhas
          </span>
        </div>
      </div>
    </div>
  )
}
