"use client";

import { useState, useEffect, use } from "react";
import { Cabecalho } from "../../../components/Cabecalho";
import { Rodape } from "../../../components/Rodape";
import { ModoChaBanner } from "../../../components/ModoChaBanner";
import { VitrineProdutoCard } from "../../../components/VitrineProdutoCard";
import Link from "next/link";
import { apiFetch } from "../../../lib/api";
import type { Produto } from "../../../lib/types";

export default function CategoriaPage({ params }: { params: Promise<{ id: string }> }) {
  const desempacotado = use(params);
  const categoriaId = desempacotado.id;

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    apiFetch('/produtos')
      .then(res => res.json())
      .then((data: Produto[]) => {
        const filtrados = data.filter((p) => 
          p.categoria && p.categoria.toLowerCase() === categoriaId.toLowerCase()
        );
        setProdutos(filtrados);
        setCarregando(false);
      })
      .catch(() => setCarregando(false));
  }, [categoriaId]);

  const tituloDaPagina = categoriaId.charAt(0).toUpperCase() + categoriaId.slice(1);

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Cabecalho />
      <ModoChaBanner />
      
      <div className="max-w-7xl mx-auto p-4 mt-8 min-h-[50vh]">
        <h1 className="text-3xl md:text-5xl font-black text-[#BA68C8] mb-10 text-center drop-shadow-sm">
          {tituloDaPagina === "Exclusivas" ? "Coleção Exclusiva" : `Mundo ${tituloDaPagina}`}
        </h1>

        {carregando ? (
          <div className="text-center pt-20">
            <p className="text-xl text-gray-500 font-bold animate-pulse">Buscando as melhores roupinhas...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <span className="text-6xl block mb-6">👕</span>
            <h2 className="text-2xl font-bold text-gray-700">Poxa, ainda não temos roupinhas aqui!</h2>
            <p className="text-gray-500 mt-2 mb-8">Nossa equipe já está preparando novidades incríveis para esta seção.</p>
            <Link href="/" className="bg-[#42D3E5] text-white font-bold px-8 py-3 rounded-full hover:bg-cyan-500 transition-colors">
              Voltar para a Home
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
