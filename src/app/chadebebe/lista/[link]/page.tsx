"use client";

import Link from "next/link";
import { use, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CarrinhoContext } from "../../../../contexts/CarrinhoContext";
import { API_URL, apiFetch } from "../../../../lib/api";
import { ImagemProduto } from "../../../../components/ImagemProduto";
import { temaLista, type TemaLista } from "../../../../lib/temaLista";

type ListaPublica = {
  id: number;
  nomeBebe: string;
  dataEvento: string;
  tema: TemaLista;
  cliente: { nome: string };
  produtos: Array<{
    comprado: boolean;
    tamanho?: string | null;
    produto: {
      id: number;
      nome: string;
      preco: number | string;
      imagemUrl?: string | null;
      quantidadeEstoque: number;
      estoquesPorTamanho?: Array<{ tamanho: string; quantidade: number }>;
    };
  }>;
};

export default function ListaConvidadoPage({ params }: { params: Promise<{ link: string }> }) {
  const { link } = use(params);
  const { adicionarProduto } = useContext(CarrinhoContext);
  const [lista, setLista] = useState<ListaPublica | null>(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    apiFetch(`/listas/${encodeURIComponent(link)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Lista não encontrada.");
        setLista(data);
      })
      .catch((error) => setErro(error.message));
  }, [link]);

  const handlePresentear = (item: ListaPublica["produtos"][number]) => {
    const tamanho = item.tamanho || "Único";
    const estoqueDoTamanho =
      item.produto.estoquesPorTamanho?.find(
        (estoque) =>
          estoque.tamanho.toLocaleLowerCase("pt-BR") === tamanho.toLocaleLowerCase("pt-BR"),
      )?.quantidade ?? item.produto.quantidadeEstoque;
    if (estoqueDoTamanho <= 0) {
      toast.error(`O tamanho ${tamanho} está sem estoque no momento.`);
      return;
    }
    adicionarProduto({
      id: item.produto.id,
      nome: item.produto.nome,
      preco: Number(item.produto.preco),
      quantidade: 1,
      tamanho,
      quantidadeEstoque: estoqueDoTamanho,
      imagemUrl: item.produto.imagemUrl,
      listaPresenteId: lista!.id,
      isPresente: true,
    });
    toast.success(`Presente para ${lista!.nomeBebe} adicionado à sacola!`);
  };

  if (erro) {
    return <main className="min-h-screen bg-blue-50 flex items-center justify-center"><div className="bg-white p-10 rounded-3xl text-center"><p className="text-red-500 font-bold mb-5">{erro}</p><Link href="/chadebebe/buscar" className="text-blue-500 font-bold">Buscar outra lista</Link></div></main>;
  }
  if (!lista) return <div className="min-h-screen flex items-center justify-center text-blue-500 font-bold">Carregando lista...</div>;

  const totalPresentes = lista.produtos.length;
  const presentesRecebidos = lista.produtos.filter((item) => item.comprado).length;
  const progresso = totalPresentes > 0 ? Math.round((presentesRecebidos / totalPresentes) * 100) : 0;
  const visual = temaLista(lista.tema);

  return (
    <main className={`min-h-screen ${visual.fundo} font-sans text-gray-900 pb-12`}>
      <header className={`${visual.cabecalho} pt-12 pb-10 px-6 text-center text-white shadow-md rounded-b-[3rem]`}>
        <div className={`w-20 h-20 bg-white ${visual.textoDestaque} rounded-full flex items-center justify-center text-4xl mx-auto mb-4`}>{visual.emoji}</div>
        <h1 className="text-3xl font-extrabold mb-2">Chá do(a) {lista.nomeBebe}</h1>
        <p className={`${visual.textoCabecalho} font-medium`}>Lista de presentes de {lista.cliente.nome}</p>
        <p className={`text-sm ${visual.textoCabecalho} mt-2`}>Evento em {new Date(lista.dataEvento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
      </header>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        <div className={`bg-white border ${visual.borda} rounded-2xl p-5 mb-7 shadow-sm`}>
          <div className="flex justify-between gap-4 text-sm font-bold mb-3">
            <span>Presentes recebidos</span>
            <span className={visual.textoDestaque}>{presentesRecebidos} de {totalPresentes}</span>
          </div>
          <div className={`h-3 ${visual.trilha} rounded-full overflow-hidden`} role="progressbar" aria-label="Progresso da lista" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progresso}>
            <div className={`h-full ${visual.progresso} rounded-full`} style={{ width: `${progresso}%` }} />
          </div>
        </div>
        <div className="flex justify-between items-center mb-6 gap-4">
          <h2 className="text-xl font-bold">Escolha um presente com carinho:</h2>
          <Link href="/chadebebe/buscar" className={`text-sm ${visual.textoDestaque} font-bold hover:underline`}>Buscar outra lista</Link>
        </div>

        <div className="space-y-4">
          {lista.produtos.length === 0 && <p className="bg-white rounded-2xl p-8 text-center text-gray-500">A lista ainda não possui presentes.</p>}
          {lista.produtos.map((item) => {
            const tamanho = item.tamanho || "Único";
            const estoqueDoTamanho =
              item.produto.estoquesPorTamanho?.find(
                (estoque) =>
                  estoque.tamanho.toLocaleLowerCase("pt-BR") === tamanho.toLocaleLowerCase("pt-BR"),
              )?.quantidade ?? item.produto.quantidadeEstoque;
            const indisponivel = item.comprado || estoqueDoTamanho <= 0;
            return (
              <div key={item.produto.id} className={`flex flex-col sm:flex-row justify-between items-center p-6 rounded-3xl shadow-sm border ${indisponivel ? "bg-gray-100 opacity-70" : `bg-white ${visual.borda}`}`}>
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  {item.produto.imagemUrl ? <ImagemProduto src={`${API_URL}${item.produto.imagemUrl}`} alt={item.produto.nome} className="h-20 w-20 rounded-xl object-cover" sizes="80px" /> : <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">📷</div>}
                  <div>
                    <p className={`font-bold text-lg ${indisponivel ? "line-through text-gray-500" : "text-gray-800"}`}>{item.produto.nome}</p>
                    <p className="text-sm text-gray-500">Tamanho desejado: {item.tamanho || "a confirmar"}</p>
                    <p className="font-semibold text-green-600">R$ {Number(item.produto.preco).toFixed(2).replace(".", ",")}</p>
                  </div>
                </div>
                {item.comprado ? (
                  <span className="bg-gray-200 px-6 py-3 rounded-xl font-bold text-sm">✅ Já presenteado</span>
                ) : estoqueDoTamanho <= 0 ? (
                  <span className="bg-red-100 text-red-700 px-6 py-3 rounded-xl font-bold text-sm">Tamanho sem estoque</span>
                ) : (
                  <button onClick={() => handlePresentear(item)} className={`${visual.botao} text-white px-8 py-3 rounded-xl font-bold transition`}>🎁 Presentear</button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link href="/carrinho" className="inline-block bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-gray-800">Ir para a Sacola e Pagar</Link>
        </div>
      </div>
    </main>
  );
}
