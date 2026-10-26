"use client";

import { useState, useEffect, useContext, use } from "react";
import { CarrinhoContext } from "../../../contexts/CarrinhoContext";
import { Cabecalho } from "../../../components/Cabecalho";
import { Rodape } from "../../../components/Rodape";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API_URL, apiFetch } from "../../../lib/api";
import type { Produto } from "../../../lib/types";
import { ImagemProduto } from "../../../components/ImagemProduto";

export default function ProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  const desempacotado = use(params);
  const produtoId = desempacotado.id;

  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState("");
  const [salvando, setSalvando] = useState(false);
  const { adicionarProduto, modoChaAtivo } = useContext(CarrinhoContext);
  
  const router = useRouter(); 

  useEffect(() => {
    let ativo = true;

    async function carregarProduto() {
      try {
        const response = await apiFetch(`/produtos/${produtoId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || "Produto não encontrado.");
        if (ativo) setProduto(data);
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Não foi possível carregar o produto.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void carregarProduto();
    return () => {
      ativo = false;
    };
  }, [produtoId]);

  if (carregando) return (
    <div className="min-h-screen bg-gray-50 text-center pt-32 font-bold text-gray-500">
      Carregando detalhes da roupinha...
    </div>
  );

  if (erro || !produto) return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Cabecalho />
      <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
        <span className="text-6xl" aria-hidden="true">🧸</span>
        <h1 className="mt-5 text-2xl font-black text-slate-900">Roupinha não encontrada</h1>
        <p className="mt-3 text-gray-500">{erro || "Este produto não está mais disponível."}</p>
        <Link href="/" className="mt-7 rounded-xl bg-[#BA68C8] px-6 py-3 font-black text-white">
          Voltar para a vitrine
        </Link>
      </section>
      <Rodape />
    </main>
  );

  const listaTamanhos = produto.tamanhos 
    ? produto.tamanhos.split(',').map((t: string) => t.trim()) 
    : ["Único"];
  const estoquesPorTamanho = listaTamanhos.map((tamanho) => ({
    tamanho,
    quantidade:
      produto.estoquesPorTamanho?.find(
        (estoque) =>
          estoque.tamanho.toLocaleLowerCase("pt-BR") === tamanho.toLocaleLowerCase("pt-BR"),
      )?.quantidade ?? (produto.estoquesPorTamanho?.length ? 0 : produto.quantidadeEstoque),
  }));
  const tamanhoAtual = tamanhoSelecionado || (listaTamanhos[0] === "Único" ? "Único" : "");
  const estoqueSelecionado = estoquesPorTamanho.find(
    (estoque) => estoque.tamanho === tamanhoAtual,
  )?.quantidade ?? 0;
  const descricaoVisivel =
    produto.descricao && !produto.descricao.toLocaleLowerCase("pt-BR").startsWith("categoria:")
      ? produto.descricao
      : null;
  const categoriaVisivel = produto.categoria
    ? produto.categoria.charAt(0).toUpperCase() + produto.categoria.slice(1)
    : "Moda infantil";

  const handleComprar = async () => {
    if (!tamanhoSelecionado && listaTamanhos[0] !== "Único") {
      toast.error("Selecione um tamanho antes de continuar.");
      return;
    }
    const tamanho = tamanhoSelecionado || listaTamanhos[0];
    const quantidadeDisponivel = estoquesPorTamanho.find(
      (estoque) => estoque.tamanho === tamanho,
    )?.quantidade ?? 0;
    if (quantidadeDisponivel <= 0) {
      toast.error(`O tamanho ${tamanho} está sem estoque no momento.`);
      return;
    }

    if (modoChaAtivo) {
      const listaId = localStorage.getItem("minhaListaId");
      if (!listaId) {
        toast.error("Abra sua lista antes de escolher as roupinhas.");
        router.push("/chadebebe");
        return;
      }
      setSalvando(true);
      try {
        const response = await apiFetch(`/listas/${listaId}/produtos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ produtoId: produto.id, tamanho }),
        }, "cliente");
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          toast.error(data.error || "Não foi possível adicionar o produto à lista.");
          return;
        }
        toast.success(`"${produto.nome}" foi adicionado à lista!`);
        router.push("/chadebebe/painel");
      } catch {
        toast.error("Não foi possível conectar ao servidor.");
      } finally {
        setSalvando(false);
      }
      return;
    }

    adicionarProduto({
       ...produto,
       nome: produto.nome,
       preco: Number(produto.preco),
       quantidade: 1,
       tamanho,
       quantidadeEstoque: quantidadeDisponivel,
    });
    toast.success(`"${produto.nome}" foi adicionado ao carrinho.`);
    router.push('/carrinho');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50/60 via-white to-pink-50/60 font-sans text-gray-900">
      <Cabecalho />

      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#9C4EAA] shadow-sm ring-1 ring-purple-100 transition hover:-translate-x-1 hover:bg-purple-50"
        >
          <span aria-hidden="true">←</span> Voltar para a vitrine
        </Link>

        <article className="overflow-hidden rounded-[2rem] border border-purple-100 bg-white shadow-[0_24px_70px_-35px_rgba(88,28,135,0.45)]">
          <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
            <section className="bg-gradient-to-br from-rose-50 via-white to-violet-50 p-4 sm:p-7 md:p-10" aria-label="Foto do produto">
              <div className="relative flex aspect-[3/4] max-h-[680px] items-center justify-center overflow-hidden rounded-[1.5rem] border border-white bg-white p-2 shadow-inner sm:p-4">
                <span className="absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-[#9C4EAA] shadow-sm ring-1 ring-purple-100">
                  {categoriaVisivel}
                </span>
                {produto.imagemUrl ? (
                  <ImagemProduto
                    src={`${API_URL}${produto.imagemUrl}`}
                    alt={produto.nome}
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    loading="eager"
                    className="h-full w-full rounded-2xl object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-2xl bg-gray-50 text-gray-400">
                    <span className="text-5xl" aria-hidden="true">📷</span>
                    <span className="text-sm font-bold">Foto não cadastrada</span>
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col justify-center p-6 sm:p-8 md:p-10 lg:p-12" aria-labelledby="titulo-produto">
              <div className="mb-7 border-b border-gray-100 pb-7">
                <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-[#BA68C8]">Pegada Kids</p>
                <h1 id="titulo-produto" className="text-3xl font-black leading-tight text-slate-900 md:text-4xl lg:text-5xl">
                  {produto.nome}
                </h1>
                <p className="mt-3 text-sm font-medium text-gray-400">Código do produto: PK-{produto.id}</p>
              </div>

              {descricaoVisivel && (
                <div className="mb-7 rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 ring-1 ring-slate-100">
                  {descricaoVisivel}
                </div>
              )}

              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-500">Preço</p>
                  <p className="mt-1 text-4xl font-black tracking-tight text-[#E85D75] md:text-5xl">
                    R$ {Number(produto.preco).toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${produto.quantidadeEstoque > 0 ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100" : "bg-red-50 text-red-700 ring-1 ring-red-100"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${produto.quantidadeEstoque > 0 ? "bg-emerald-500" : "bg-red-500"}`} aria-hidden="true" />
                  {produto.quantidadeEstoque > 0
                    ? `${produto.quantidadeEstoque} no total`
                    : "Produto sem estoque"}
                </span>
              </div>

              <fieldset className="mb-8">
                <legend className="text-lg font-black text-slate-800">Escolha o tamanho</legend>
                {listaTamanhos[0] !== "Único" && <p className="mb-4 mt-1 text-xs font-medium text-gray-400">Selecione uma opção para continuar</p>}
                <div className="flex flex-wrap gap-3">
                  {estoquesPorTamanho.map(({ tamanho, quantidade }) => {
                    const selecionado = tamanhoSelecionado === tamanho || (!tamanhoSelecionado && tamanho === "Único");
                    const indisponivel = quantidade === 0;
                    return (
                      <button
                        key={tamanho}
                        type="button"
                        aria-pressed={selecionado}
                        aria-label={`${tamanho}: ${indisponivel ? "sem estoque" : `${quantidade} em estoque`}`}
                        disabled={indisponivel}
                        onClick={() => setTamanhoSelecionado(tamanho)}
                        className={`min-w-20 rounded-xl border-2 px-4 py-3 text-base font-black transition focus:outline-none focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed ${indisponivel
                          ? "border-gray-100 bg-gray-100 text-gray-400 line-through"
                          : selecionado
                          ? "border-[#BA68C8] bg-[#BA68C8] text-white shadow-md"
                          : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50"}`}
                      >
                        <span className="block">{selecionado && !indisponivel && <span aria-hidden="true">✓ </span>}{tamanho}</span>
                        <span className={`mt-0.5 block text-[10px] font-bold no-underline ${selecionado && !indisponivel ? "text-white/80" : "text-gray-400"}`}>
                          {indisponivel ? "Esgotado" : `${quantidade} un.`}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {tamanhoAtual && estoqueSelecionado > 0 && (
                  <p className="mt-3 text-xs font-bold text-emerald-700">
                    {estoqueSelecionado} unidade(s) disponível(is) no tamanho {tamanhoAtual}.
                  </p>
                )}
              </fieldset>

              <button
                type="button"
                onClick={handleComprar}
                disabled={salvando || produto.quantidadeEstoque <= 0}
                className={`flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 text-lg font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:hover:translate-y-0 ${modoChaAtivo ? "bg-pink-500 focus:ring-pink-200" : "bg-[#E85D75] focus:ring-rose-200"}`}
              >
                <span className="text-2xl" aria-hidden="true">{modoChaAtivo ? "🎁" : "🛍️"}</span>
                {salvando
                  ? "Adicionando..."
                  : produto.quantidadeEstoque <= 0
                    ? "Produto indisponível"
                    : modoChaAtivo
                      ? "Adicionar à lista de bebê"
                      : "Adicionar ao carrinho"}
              </button>

              <ul className="mt-7 grid gap-3 text-xs font-bold text-gray-500 sm:grid-cols-3" aria-label="Benefícios da compra">
                <li className="rounded-xl bg-gray-50 px-3 py-3 text-center">🔒 Reserva segura</li>
                <li className="rounded-xl bg-gray-50 px-3 py-3 text-center">💬 Suporte pelo WhatsApp</li>
                <li className="rounded-xl bg-gray-50 px-3 py-3 text-center">📍 Retirada na loja</li>
              </ul>
            </section>
          </div>
        </article>
      </div>

      <Rodape />
    </main>
  );
}
