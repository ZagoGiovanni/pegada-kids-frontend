"use client";

import { useContext, useState, useEffect } from "react";
import { CarrinhoContext } from "../contexts/CarrinhoContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export function Cabecalho() {
  const { carrinho, setModoChaAtivo } = useContext(CarrinhoContext);
  const [termoBusca, setTermoBusca] = useState("");
  const [menuAberto, setMenuAberto] = useState(false);
  const router = useRouter();

  const [clienteLogado, setClienteLogado] = useState<{ nome: string; email: string } | null>(null);

  useEffect(() => {
    const dadosSalvos = sessionStorage.getItem("pegada_kids_cliente");
    if (dadosSalvos) {
      const timer = window.setTimeout(() => setClienteLogado(JSON.parse(dadosSalvos)), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (termoBusca.trim() !== "") {
      router.push(`/busca?q=${encodeURIComponent(termoBusca)}`);
    }
  };

  const handleSair = () => {
    sessionStorage.removeItem("pegada_kids_cliente");
    sessionStorage.removeItem("pegada_kids_cliente_token");
    setModoChaAtivo(false);
    setClienteLogado(null);
    router.push("/");
  };

  return (
    <header className="border-b border-gray-100 bg-white sticky top-0 z-50 shadow-sm">
      <div className="py-4 px-4 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <Link href="/">
          <div className="cursor-pointer hover:scale-105 transition-transform flex-shrink-0">
            <Image src="/logo.png" alt="Logo Pegada Kids" width={146} height={80} className="object-contain" priority />
          </div>
        </Link>

        <div className="flex-1 w-full max-w-2xl px-2">
          <form onSubmit={handleBuscar} className="flex w-full border-2 border-[#BA68C8] rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-purple-400 transition-all shadow-sm">
            <input 
              type="text" 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="O que você está buscando?" 
              className="w-full px-6 py-3 text-sm text-gray-700 outline-none" 
            />
            <button type="submit" className="bg-[#BA68C8] px-8 text-white text-xl hover:bg-purple-600 transition-colors">
              🔍
            </button>
          </form>
        </div>

        <div className="flex items-center gap-5 flex-shrink-0">
          <div className="hidden lg:flex gap-3">
            <a href="https://www.instagram.com/pegadakids_/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#E1C152] text-white rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://www.facebook.com/pegada.kids.2025?locale=pt_BR" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#E85D75] text-white rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="https://wa.me/message/7POZK7CRCT6AB1" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#BA68C8] text-white rounded-full flex items-center justify-center hover:-translate-y-1 transition-transform shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </a>
          </div>

          <div className="w-px h-10 bg-gray-200 hidden md:block mx-1"></div>

          {clienteLogado ? (
            <div className="hidden md:flex items-center gap-3 ml-2 mr-2">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center text-xl shadow-sm border border-pink-200">
                👶
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-gray-500 text-xs">Olá, {clienteLogado.nome.split(' ')[0]}</span>
                <div className="flex gap-2 text-xs font-bold mt-0.5">
                  <Link href="/minha-conta" className="text-[#BA68C8] hover:underline">Minha Conta</Link>
                  <span className="text-gray-300">|</span>
                  <button onClick={handleSair} className="text-red-400 hover:text-red-600 transition-colors">Sair</button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/entrar" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity ml-2 mr-2">
              <span className="text-3xl text-gray-400">👤</span>
              <div className="flex flex-col leading-tight">
                <span className="text-gray-500 text-xs">Olá, visitante</span>
                <span className="text-[#BA68C8] font-bold text-sm">Entrar / Cadastrar</span>
              </div>
            </Link>
          )}

          <Link href="/carrinho" className="relative cursor-pointer hover:scale-110 transition-transform flex items-center ml-2">
            <span className="text-4xl">🛍️</span>
            {carrinho.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#E85D75] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-md">
                {carrinho.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            className="md:hidden w-11 h-11 rounded-xl bg-gray-100 text-gray-700 font-black text-xl"
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          >
            {menuAberto ? "✕" : "☰"}
          </button>
        </div>
      </div>

      <nav id="menu-principal" className={`max-w-7xl mx-auto px-4 pb-4 gap-3 flex-col md:flex-row ${menuAberto ? "flex" : "hidden"} md:flex`}>
        <div className="group relative flex-1">
          <Link onClick={() => setMenuAberto(false)} href="/categoria/meninos" className="w-full bg-[#42D3E5] hover:bg-[#35B8C9] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black text-base lg:text-lg transition-colors shadow-sm">
            👦 Meninos
          </Link>
        </div>

        <div className="group relative flex-1">
          <Link onClick={() => setMenuAberto(false)} href="/categoria/meninas" className="w-full bg-[#E1C152] hover:bg-[#C9A93A] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black text-base lg:text-lg transition-colors shadow-sm">
            👧 Meninas
          </Link>
        </div>

        <div className="group relative flex-1">
          <Link onClick={() => setMenuAberto(false)} href="/categoria/acessorios" className="w-full bg-[#E85D75] hover:bg-[#C9475D] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black text-base lg:text-lg transition-colors shadow-sm">
            🎀 Acessórios
          </Link>
        </div>

        <div className="group relative flex-1">
          <Link onClick={() => setMenuAberto(false)} href="/categoria/exclusivas" className="w-full bg-[#BA68C8] hover:bg-[#9C4AA8] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black text-base lg:text-lg transition-colors shadow-sm">
            ✨ Exclusivas
          </Link>
        </div>

        <div className="group relative flex-1">
          <Link onClick={() => setMenuAberto(false)} href="/chadebebe" className="w-full bg-[#00BFA6] hover:bg-[#009f8a] text-white py-3 rounded-xl flex items-center justify-center gap-2 font-black text-base lg:text-lg transition-colors shadow-sm">
            🎁 Chá de Bebê
          </Link>
        </div>

        <div className="md:hidden grid grid-cols-2 gap-3">
          <Link onClick={() => setMenuAberto(false)} href={clienteLogado ? "/minha-conta" : "/entrar"} className="bg-gray-100 text-gray-700 py-3 rounded-xl text-center font-bold">
            {clienteLogado ? "Minha Conta" : "Entrar / Cadastrar"}
          </Link>
          {clienteLogado ? (
            <button type="button" onClick={handleSair} className="bg-red-50 text-red-600 py-3 rounded-xl font-bold">Sair</button>
          ) : (
            <Link onClick={() => setMenuAberto(false)} href="/carrinho" className="bg-pink-50 text-pink-700 py-3 rounded-xl text-center font-bold">Ver Carrinho</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
