import Link from "next/link";
import { Cabecalho } from "../components/Cabecalho";
import { Rodape } from "../components/Rodape";
import { BannerCarrossel } from "../components/BannerCarrossel";
import { ModoChaBanner } from "../components/ModoChaBanner";
import { VitrineProdutoCard } from "../components/VitrineProdutoCard";
import { API_URL } from "../lib/api";
import type { Produto } from "../lib/types";

async function carregarProdutos() {
  try {
    const resposta = await fetch(`${API_URL}/produtos`, { cache: "no-store" });
    if (!resposta.ok) return null;
    return await resposta.json() as Produto[];
  } catch {
    return null;
  }
}

export default async function Home() {
  const produtos = await carregarProdutos();
  if (!produtos) {
    return (
      <main className="p-8 text-center text-red-700 bg-red-50 min-h-screen">
        <h1 className="text-3xl font-bold mb-4">Erro de Conexão com a Loja</h1>
        <p>A vitrine virtual não conseguiu buscar os produtos. Verifique o Back-end!</p>
      </main>
    );
  }

    const destaques = produtos.slice(0, 4);

    const novidades = produtos.slice(4, 8);

    return (
      <main className="min-h-screen bg-white font-sans text-gray-900">
        <Cabecalho />
        <ModoChaBanner />

        <BannerCarrossel />

        <section className="max-w-7xl mx-auto px-4 mt-10" aria-labelledby="cha-bebe-home">
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white shadow-xl">
            <div className="grid lg:grid-cols-[1.1fr_1fr] items-center">
              <div className="p-8 md:p-12">
                <span className="inline-flex bg-white/20 px-4 py-2 rounded-full text-sm font-black mb-5">
                  O diferencial da Pegada Kids
                </span>
                <h2 id="cha-bebe-home" className="text-3xl md:text-5xl font-black leading-tight">
                  Monte uma lista de Chá de Bebê cheia de carinho
                </h2>
                <p className="mt-4 text-cyan-50 max-w-2xl">
                  Escolha as roupinhas, compartilhe um link exclusivo e acompanhe os presentes recebidos em um só lugar.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-7">
                  <Link href="/chadebebe/criar" className="bg-[#E85D75] hover:bg-rose-600 text-white px-6 py-3.5 rounded-xl font-black text-center shadow-md">
                    Criar minha lista
                  </Link>
                  <Link href="/chadebebe/buscar" className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3.5 rounded-xl font-black text-center shadow-md">
                    Encontrar uma lista
                  </Link>
                </div>
              </div>

              <ol className="grid sm:grid-cols-3 lg:grid-cols-1 gap-3 p-6 md:p-8 bg-white/10 lg:h-full content-center">
                {[
                  ["1", "Crie", "Informe o nome do bebê e a data do evento."],
                  ["2", "Escolha", "Adicione as roupinhas e os tamanhos desejados."],
                  ["3", "Compartilhe", "Envie o link exclusivo aos seus convidados."],
                ].map(([numero, titulo, texto]) => (
                  <li key={numero} className="flex gap-4 items-start bg-white/15 rounded-2xl p-4">
                    <span className="w-10 h-10 rounded-full bg-white text-blue-600 font-black flex items-center justify-center shrink-0">{numero}</span>
                    <div>
                      <p className="font-black text-lg">{titulo}</p>
                      <p className="text-sm text-cyan-50">{texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto p-4 mt-12">
          <h2 className="text-3xl font-bold text-center text-[#E85D75] mb-10">Destaque da Semana</h2>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,260px))] justify-center gap-6">
            {destaques.map((produto) => (
              <VitrineProdutoCard key={produto.id} produto={produto} cor="rosa" />
            ))}
          </div>
        </section>

        {novidades.length > 0 && (
          <section className="max-w-7xl mx-auto p-4 mt-16">
            <h2 className="text-3xl font-bold text-center text-[#BA68C8] mb-10">Novidades e Lançamentos</h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,260px))] justify-center gap-6">
              {novidades.map((produto) => (
                <VitrineProdutoCard key={produto.id} produto={produto} cor="roxo" />
              ))}
            </div>
          </section>
        )}

        <Rodape />
      </main>
    );
}
