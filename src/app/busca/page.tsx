"use client";

import { useState, useEffect, use } from "react";
import { Cabecalho } from "../../components/Cabecalho";
import { Rodape } from "../../components/Rodape";
import { ModoChaBanner } from "../../components/ModoChaBanner";
import { VitrineProdutoCard } from "../../components/VitrineProdutoCard";
import Link from "next/link";
import { apiFetch } from "../../lib/api";
import type { Produto } from "../../lib/types";

export default function BuscaPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
  const desempacotado = use(searchParams);
  const termoDeBusca = desempacotado.q || "";

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!termoDeBusca) {
      const timer = window.setTimeout(() => setCarregando(false), 0);
      return () => window.clearTimeout(timer);
    }

    apiFetch('/produtos')
      .then(res => res.json())
      .then((data: Produto[]) => {
        const filtrados = data.filter((p) => 
          p.nome.toLowerCase().includes(termoDeBusca.toLowerCase())
        );
        setProdutos(filtrados);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [termoDeBusca]);

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Cabecalho />
      <ModoChaBanner />
      
      <div className="max-w-7xl mx-auto p-4 mt-8 min-h-[50vh]">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 text-center">
          Resultados para: <span className="text-[#BA68C8]">&quot;{termoDeBusca}&quot;</span>
        </h1>
        <p className="text-center text-gray-500 mb-10 border-b pb-6 max-w-2xl mx-auto">
          Encontramos {produtos.length} {produtos.length === 1 ? 'resultado' : 'resultados'} para a sua pesquisa.
        </p>

        {carregando ? (
          <div className="text-center pt-10">
            <p className="text-xl text-gray-500 font-bold animate-pulse">Procurando no estoque...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <span className="text-6xl block mb-6">🔍</span>
            <h2 className="text-2xl font-bold text-gray-700">Poxa, não encontramos nada!</h2>
            <p className="text-gray-500 mt-2 mb-8">
              Não achamos nenhuma roupinha com o termo &quot;{termoDeBusca}&quot;. Que tal tentar palavras mais curtas ou categorias gerais?
            </p>
            <Link href="/" className="bg-[#42D3E5] text-white font-bold px-8 py-3 rounded-full hover:bg-cyan-500 transition-colors">
              Voltar para a Vitrine
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,260px))] justify-center gap-6">
            {produtos.map((produto) => (
              <VitrineProdutoCard key={produto.id} produto={produto} cor="rosa" />
            ))}
          </div>
        )}
      </div>

      <Rodape />
    </main>
  );
}
