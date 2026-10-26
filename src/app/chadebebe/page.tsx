"use client";

import Link from "next/link";

export default function ChaDeBebePage() {
  return (
    <main className="min-h-screen bg-teal-50 font-sans text-gray-900 pb-12">
      
      <div className="bg-[#00BFA6] pt-12 pb-20 px-6 text-center rounded-b-[3rem] shadow-sm">
        <div className="flex justify-center mb-4">
          <span className="text-5xl bg-white p-4 rounded-full shadow-md">👶</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2">Chá de Bebê</h1>
        <p className="text-teal-100 max-w-md mx-auto">
          Celebre a chegada do seu bebê com praticidade, ou encontre a lista de alguém especial para presentear!
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 -mt-10 grid md:grid-cols-2 gap-6">
        
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-teal-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center text-3xl mb-6">
            📝
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Sou a Mamãe</h2>
          <p className="text-gray-500 text-sm mb-6 flex-1">
            Crie sua lista de presentes personalizada, adicione as roupinhas e compartilhe o link com seus convidados.
          </p>
          <Link href="/chadebebe/criar" className="w-full bg-pink-500 text-white py-3.5 rounded-2xl font-bold hover:bg-pink-600 transition-colors shadow-md text-center block">
  Criar Minha Lista
</Link>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-lg border border-teal-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center text-3xl mb-6">
            🎁
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Sou Convidado</h2>
          <p className="text-gray-500 text-sm mb-6 flex-1">
            Digite o nome da mamãe ou o código do evento para acessar a lista e escolher o presente perfeito.
          </p>
          <Link href="/chadebebe/buscar" className="w-full bg-blue-500 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-600 transition-colors shadow-md text-center block">
  Buscar uma Lista
</Link>
        </div>

      </div>

      <div className="text-center mt-12">
        <Link href="/" className="text-[#00BFA6] font-bold hover:underline">
          ← Voltar para a loja
        </Link>
      </div>

    </main>
  );
}
