import Link from "next/link";

export function Rodape() {
  return (
    <footer className="w-full mt-20">
      
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-pink-50 border border-pink-100 rounded-3xl p-6">
          <div className="text-center md:text-left">
            <p className="font-black text-[#E85D75] text-xl">Quer receber novidades da Pegada Kids?</p>
            <p className="text-sm text-gray-600">Fale com a loja pelo WhatsApp ou acompanhe o Instagram.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <a href="https://wa.me/message/7POZK7CRCT6AB1" target="_blank" rel="noopener noreferrer" className="bg-green-500 text-white font-black px-6 py-3 rounded-full text-center shadow-md">
              💬 WhatsApp
            </a>
            <a href="https://www.instagram.com/pegadakids_/" target="_blank" rel="noopener noreferrer" className="bg-[#E85D75] text-white font-black px-6 py-3 rounded-full text-center shadow-md">
              📷 Instagram
            </a>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden leading-none mb-[-1px]">
        <svg className="relative block w-full h-[40px] md:h-[60px]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118,130.83,121.22,201.2,112.5,243.64,107.24,284.15,86.68,321.39,56.44Z" className="fill-[#E85D75]"></path>
        </svg>
      </div>

      <div className="bg-[#E85D75] py-12 px-4 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          <div>
            <h3 className="text-xl font-black mb-4">Institucional</h3>
            <ul className="space-y-2 text-sm font-medium opacity-90">
              <li><Link href="/institucional#quem-somos" className="hover:underline">Quem Somos</Link></li>
              <li><Link href="/institucional#trocas" className="hover:underline">Trocas e Devoluções</Link></li>
              <li><Link href="/institucional#privacidade" className="hover:underline">Privacidade</Link></li>
              <li><a href="https://wa.me/message/7POZK7CRCT6AB1" target="_blank" rel="noopener noreferrer" className="hover:underline">Fale Conosco</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-black mb-4">Categorias</h3>
            <ul className="space-y-2 text-sm font-medium opacity-90">
              <li><Link href="/categoria/meninos" className="hover:underline">Meninos</Link></li>
              <li><Link href="/categoria/meninas" className="hover:underline">Meninas</Link></li>
              <li><Link href="/categoria/acessorios" className="hover:underline">Acessórios</Link></li>
              <li><Link href="/categoria/exclusivas" className="hover:underline">Coleção Exclusiva</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-black mb-4">Contatos</h3>
            <ul className="space-y-2 text-sm font-medium opacity-90">
              <li className="flex items-center gap-2"><span>📞</span> (18) 99675-3816</li>
              <li className="flex items-center gap-2"><span>💬</span> (18) 99675-3816</li>
              <li className="flex items-center gap-2"><span>✉️</span> pegada_kids@gmail.com</li>
              <li className="flex gap-2 mt-4">
                <span className="text-lg">📍</span> 
                <span className="leading-tight">
                  Loja Pegada Kids<br/>
                  Paraguaçu Paulista / SP<br/>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-black mb-4">Instagram</h3>
            <p className="text-sm font-medium opacity-90 mb-4">Siga a gente para acompanhar as novidades e ofertas!</p>
            <a href="https://www.instagram.com/pegadakids_/" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-[#E85D75] font-bold px-6 py-2 rounded-full hover:bg-pink-50 transition-colors shadow-sm">
              @pegadakids_
            </a>
          </div>
        </div>
      </div>

      <div className="bg-[#C9475D] py-8 px-4 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Compra e retirada</span>
            <div className="flex gap-3 text-sm font-bold">
              PIX • WhatsApp • Retirada
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Certificados</span>
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-2xl">🔒</span>
              <span className="text-xs font-bold leading-tight">Senhas protegidas<br/>Acesso autenticado</span>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-end">
            <span className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Siga-nos</span>
            <div className="flex gap-3">
              <a href="https://www.facebook.com/pegada.kids.2025?locale=pt_BR" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors text-xl font-bold">f</a>
              <a href="https://www.instagram.com/pegadakids_/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors text-xl">📷</a>
              <a href="https://wa.me/message/7POZK7CRCT6AB1" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/40 transition-colors text-xl">💬</a>
            </div>
          </div>

        </div>
      </div>
      
      <div className="bg-gray-900 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
          <span className="text-xs text-gray-400">
            © 2026 Pegada Kids. Todos os direitos reservados.
          </span>
          
          <Link 
            href="/admin" 
            className="text-xs font-bold text-[#BA68C8] hover:text-purple-400 transition-colors flex items-center gap-1.5 bg-gray-800 px-3 py-1.5 rounded-lg shadow-sm"
          >
            🔒 Painel Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
