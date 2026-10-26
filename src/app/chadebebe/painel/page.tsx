"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CarrinhoContext } from "../../../contexts/CarrinhoContext";
import { apiFetch } from "../../../lib/api";
import { temaLista, type TemaLista } from "../../../lib/temaLista";

type PainelLista = {
  id: number;
  nomeBebe: string;
  dataEvento: string;
  tema: TemaLista;
  linkExclusivo: string;
  cliente: { nome: string };
  produtos: Array<{
    comprado: boolean;
    tamanho?: string | null;
    produto: { id: number; nome: string; preco: number | string };
  }>;
};

export default function PainelMaePage() {
  const { setModoChaAtivo } = useContext(CarrinhoContext);
  const router = useRouter();
  const [lista, setLista] = useState<PainelLista | null>(null);
  const [diasParaEvento, setDiasParaEvento] = useState(0);

  useEffect(() => {
    const id = localStorage.getItem("minhaListaId");
    if (!id || !sessionStorage.getItem("pegada_kids_cliente_token")) {
      router.push("/chadebebe/criar");
      return;
    }
    apiFetch(`/listas/painel/${id}`, {}, "cliente")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Não foi possível carregar a lista.");
        setLista(data);
        setDiasParaEvento(Math.max(
          0,
          Math.ceil((new Date(data.dataEvento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        ));
        localStorage.setItem("minhaListaLink", data.linkExclusivo);
        localStorage.setItem("minhaListaNomeBebe", data.nomeBebe);
      })
      .catch((error) => toast.error(error.message));
  }, [router]);

  const irParaVitrine = () => {
    setModoChaAtivo(true);
    router.push("/");
  };

  const copiarLink = async () => {
    if (!lista) return;
    const slug = lista.linkExclusivo.split("/").pop() || lista.linkExclusivo;
    await navigator.clipboard.writeText(`${window.location.origin}/chadebebe/lista/${slug}`);
    toast.success("Link exclusivo copiado!");
  };

  const compartilharWhatsApp = () => {
    if (!lista) return;
    const slug = lista.linkExclusivo.split("/").pop() || lista.linkExclusivo;
    const publicUrl = `${window.location.origin}/chadebebe/lista/${slug}`;
    const message = `Olá! Preparamos com carinho a lista do Chá do(a) ${lista.nomeBebe}. Você pode escolher um presente por aqui: ${publicUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  };

  const removerDaLista = async (produtoId: number) => {
    if (!lista || !window.confirm("Deseja remover este produto da lista?")) return;
    const response = await apiFetch(`/listas/${lista.id}/produtos/${produtoId}`, { method: "DELETE" }, "cliente");
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Não foi possível remover o produto.");
      return;
    }
    setLista({ ...lista, produtos: lista.produtos.filter((item) => item.produto.id !== produtoId) });
    toast.success("Produto removido da lista.");
  };

  if (!lista) return <div className="min-h-screen flex items-center justify-center text-pink-500 font-bold">Carregando sua lista...</div>;

  const totalPresentes = lista.produtos.length;
  const presentesRecebidos = lista.produtos.filter((item) => item.comprado).length;
  const progresso = totalPresentes > 0 ? Math.round((presentesRecebidos / totalPresentes) * 100) : 0;
  const visual = temaLista(lista.tema);
  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-12">
      <header className={`${visual.cabecalho} pt-10 pb-8 px-6 text-center text-white shadow-md rounded-b-[2rem]`}>
        <div className={`w-16 h-16 bg-white ${visual.textoDestaque} rounded-full flex items-center justify-center text-3xl mx-auto mb-3`}>{visual.emoji}</div>
        <h1 className="text-3xl font-extrabold mb-1">Chá do(a) {lista.nomeBebe}</h1>
        <p className={`${visual.textoCabecalho} font-medium`}>Responsável: {lista.cliente.nome} | Data: {new Date(lista.dataEvento).toLocaleDateString("pt-BR", { timeZone: "UTC" })}</p>
        <p className={`text-sm ${visual.textoCabecalho} mt-2`}>{diasParaEvento === 0 ? "O grande dia chegou!" : `Faltam ${diasParaEvento} dia(s) para o evento`}</p>
      </header>

      <div className="max-w-4xl mx-auto px-6 mt-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm mb-5">
          <div className="flex justify-between gap-4 mb-3">
            <p className="font-black text-gray-800">Progresso da lista</p>
            <p className={`font-black ${visual.textoDestaque}`}>{presentesRecebidos} de {totalPresentes} presente(s)</p>
          </div>
          <div className={`h-3 ${visual.trilha} rounded-full overflow-hidden`} role="progressbar" aria-label="Presentes recebidos" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progresso}>
            <div className={`h-full ${visual.progresso} rounded-full transition-all`} style={{ width: `${progresso}%` }} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between bg-white p-4 rounded-2xl shadow-sm mb-8 gap-3">
          <button onClick={irParaVitrine} className="bg-[#00BFA6] text-white px-6 py-3 rounded-xl font-bold">+ Adicionar Roupinhas</button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={compartilharWhatsApp} className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold">💬 Compartilhar no WhatsApp</button>
            <button onClick={copiarLink} className={`border-2 ${visual.botaoContorno} px-6 py-3 rounded-xl font-bold transition`}>🔗 Copiar Link</button>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">🎁 Presentes na Lista ({lista.produtos.length})</h2>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
          {lista.produtos.length === 0 ? <div className="text-center py-8 text-gray-500">Sua lista ainda está vazia.</div> : <div className="space-y-4">
            {lista.produtos.map((item) => (
              <div key={item.produto.id} className="flex justify-between items-center border-b border-gray-50 pb-4">
                <div>
                  <p className="font-semibold">{item.produto.nome}</p>
                  <p className="text-xs text-gray-500">Tamanho: {item.tamanho || "a confirmar"}</p>
                  <p className={`text-xs font-bold ${item.comprado ? "text-green-600" : "text-gray-400"}`}>{item.comprado ? "Já presenteado" : "Disponível"}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${visual.textoDestaque}`}>R$ {Number(item.produto.preco).toFixed(2).replace(".", ",")}</span>
                  {!item.comprado && <button onClick={() => removerDaLista(item.produto.id)} title="Remover">🗑️</button>}
                </div>
              </div>
            ))}
          </div>}
        </div>
      </div>
    </main>
  );
}
