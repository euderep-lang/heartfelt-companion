import Link from 'next/link'
import { HardHat } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-8 px-4 sm:px-6 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#e8500a] flex items-center justify-center">
            <HardHat className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-slate-900">ObraQ</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Termos de Uso
          </Link>
          <Link href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Privacidade
          </Link>
          <Link href="#" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            Contato
          </Link>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} ObraQ. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  )
}
