"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AdminShell } from "../../../components/admin/AdminShell";
import { API_URL, apiFetch } from "../../../lib/api";
import { ImagemProduto } from "../../../components/ImagemProduto";
import { opcoesTemaLista, type TemaLista } from "../../../lib/temaLista";

type Produto = {
  id: number;
  nome: string;
  preco: string | number;
  quantidadeEstoque: number;
  imagemUrl: string | null;
  tamanhos: string | null;
  estoquesPorTamanho?: Array<{ tamanho: string; quantidade: number; ordem?: number }>;
};
type ItemLista = { listaId: number; produtoId: number; tamanho: string | null; comprado: boolean; compradoEm: string | null; produto: Produto };
type Lista = {
  id: number;
  nomeBebe: string;
  dataEvento: string;
  tema: TemaLista;
  linkExclusivo: string;
  cliente: { id: number; nome: string; email: string; telefone: string | null };
  produtos: ItemLista[];
};
type FiltroLista = "todas" | "ativas" | "concluidas" | "encerradas";

const hojeLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const formatarData = (data: string) => new Date(data).toLocaleDateString("pt-BR", { timeZone: "UTC" });
const progresso = (lista: Lista) => {
  const total = lista.produtos.length;
  const comprados = lista.produtos.filter((item) => item.comprado).length;
  return { total, comprados, percentual: total ? Math.round((comprados / total) * 100) : 0 };
};
const tamanhosDoProduto = (produto?: Produto) => {
  if (produto?.estoquesPorTamanho?.length) {
    return produto.estoquesPorTamanho
      .filter((estoque) => estoque.quantidade > 0)
      .map((estoque) => estoque.tamanho);
  }
  return String(produto?.tamanhos || "Único").split(",").map((tamanho) => tamanho.trim()).filter(Boolean);
};

export default function ChaDeBebeAdmin() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [listas, setListas] = useState<Lista[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<FiltroLista>("todas");
  const [listaEditandoId, setListaEditandoId] = useState<number | null>(null);
  const [nomeBebeEdicao, setNomeBebeEdicao] = useState("");
  const [dataEventoEdicao, setDataEventoEdicao] = useState("");
  const [temaEdicao, setTemaEdicao] = useState<TemaLista>("NEUTRO");
  const [produtoAdicionarId, setProdutoAdicionarId] = useState("");
  const [tamanhoAdicionar, setTamanhoAdicionar] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [mostrarCriacao, setMostrarCriacao] = useState(false);
  const [emailCliente, setEmailCliente] = useState("");
  const [nomeBebeNovo, setNomeBebeNovo] = useState("");
  const [dataEventoNova, setDataEventoNova] = useState("");
  const [temaNovo, setTemaNovo] = useState<TemaLista>("NEUTRO");

  const carregarDados = useCallback(async () => {
    try {
      const [listasResponse, produtosResponse] = await Promise.all([
        apiFetch("/admin/listas", {}, "admin"),
        apiFetch("/produtos"),
      ]);
      if (listasResponse.status === 401 || listasResponse.status === 403) {
        sessionStorage.removeItem("pegada_kids_admin_token");
        router.push("/admin");
        return;
      }
      if (!listasResponse.ok || !produtosResponse.ok) throw new Error();
      setListas(await listasResponse.json());
      setProdutos(await produtosResponse.json());
    } catch {
      toast.error("Não foi possível carregar as listas de Chá de Bebê.");
    } finally {
      setCarregando(false);
    }
  }, [router]);

  useEffect(() => {
    const token = sessionStorage.getItem("pegada_kids_admin_token");
    if (!token) {
      router.push("/admin");
      return;
    }
    const timer = window.setTimeout(() => {
      setAutenticado(true);
      void carregarDados();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [carregarDados, router]);

  const listaEditando = listas.find((lista) => lista.id === listaEditandoId) || null;
  const produtoAdicionar = produtos.find((produto) => produto.id === Number(produtoAdicionarId));
  const buscaNormalizada = busca.trim().toLocaleLowerCase("pt-BR");
  const listasFiltradas = listas.filter((lista) => {
    const dados = `${lista.nomeBebe} ${lista.cliente.nome} ${lista.cliente.email} ${lista.linkExclusivo}`.toLocaleLowerCase("pt-BR");
    const { total, comprados } = progresso(lista);
    const encerrada = lista.dataEvento.slice(0, 10) < hojeLocal;
    const concluida = total > 0 && comprados === total;
    const correspondeFiltro = filtro === "todas" || (filtro === "ativas" && !encerrada && !concluida) || (filtro === "concluidas" && concluida) || (filtro === "encerradas" && encerrada);
    return (!buscaNormalizada || dados.includes(buscaNormalizada)) && correspondeFiltro;
  });
  const presentesTotal = listas.reduce((total, lista) => total + lista.produtos.length, 0);
  const presentesComprados = listas.reduce((total, lista) => total + lista.produtos.filter((item) => item.comprado).length, 0);
  const listasAtivas = listas.filter((lista) => lista.dataEvento.slice(0, 10) >= hojeLocal).length;

  function abrirGerenciamento(lista: Lista) {
    setListaEditandoId(lista.id);
    setNomeBebeEdicao(lista.nomeBebe);
    setDataEventoEdicao(lista.dataEvento.slice(0, 10));
    setTemaEdicao(lista.tema || "NEUTRO");
    setProdutoAdicionarId("");
    setTamanhoAdicionar("");
  }

  async function salvarDadosLista() {
    if (!listaEditando) return;
    setSalvando(true);
    try {
      const response = await apiFetch(`/admin/listas/${listaEditando.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nomeBebe: nomeBebeEdicao, dataEvento: dataEventoEdicao, tema: temaEdicao }),
      }, "admin");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "Não foi possível atualizar a lista.");
      toast.success(data.message);
      await carregarDados();
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  async function adicionarProduto() {
    if (!listaEditando || !produtoAdicionarId || !tamanhoAdicionar) return void toast.error("Selecione o produto e o tamanho.");
    setSalvando(true);
    try {
      const response = await apiFetch(`/listas/${listaEditando.id}/produtos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produtoId: Number(produtoAdicionarId), tamanho: tamanhoAdicionar }),
      }, "admin");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "Não foi possível adicionar o presente.");
      toast.success("Presente adicionado à lista.");
      setProdutoAdicionarId("");
      setTamanhoAdicionar("");
      await carregarDados();
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  async function removerProduto(item: ItemLista) {
    if (!listaEditando || item.comprado || !window.confirm(`Remover ${item.produto.nome} desta lista?`)) return;
    try {
      const response = await apiFetch(`/listas/${listaEditando.id}/produtos/${item.produtoId}`, { method: "DELETE" }, "admin");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "Não foi possível remover o presente.");
      toast.success(data.message);
      await carregarDados();
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    }
  }

  async function criarLista(event: React.FormEvent) {
    event.preventDefault();
    setSalvando(true);
    try {
      const response = await apiFetch("/admin/listas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailCliente, nomeBebe: nomeBebeNovo, dataEvento: dataEventoNova, tema: temaNovo }),
      }, "admin");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "Não foi possível criar a lista.");
      toast.success("Lista criada. Agora você pode incluir os presentes.");
      setMostrarCriacao(false);
      setEmailCliente("");
      setNomeBebeNovo("");
      setDataEventoNova("");
      setTemaNovo("NEUTRO");
      await carregarDados();
      setListaEditandoId(data.id);
      setNomeBebeEdicao(data.nomeBebe);
      setDataEventoEdicao(data.dataEvento.slice(0, 10));
      setTemaEdicao(data.tema || "NEUTRO");
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  async function copiarLink(lista: Lista) {
    await navigator.clipboard.writeText(`${window.location.origin}/chadebebe/lista/${lista.linkExclusivo}`);
    toast.success("Link da lista copiado!");
  }

  if (!autenticado) return <div className="min-h-screen bg-gray-950" />;

  return (
    <AdminShell areaAtiva="listas">
      <main className="mx-auto max-w-[1600px] p-4 md:p-8 lg:p-10">
        <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-pink-600"><span className="h-2 w-2 rounded-full bg-pink-500" /> Central de listas</div>
            <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Chá de Bebê</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">Acompanhe todas as listas, presentes escolhidos e informações dos eventos.</p>
          </div>
          <button type="button" onClick={() => setMostrarCriacao(true)} className="rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-gray-200 transition hover:-translate-y-0.5 hover:bg-gray-800">＋ Criar para um cliente</button>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[["Listas", listas.length, "🎁", "Todas as listas cadastradas"], ["Ativas", listasAtivas, "🗓️", "Eventos que ainda acontecerão"], ["Presentes", presentesTotal, "🧸", "Itens escolhidos pelas famílias"], ["Comprados", presentesComprados, "✅", "Presentes já confirmados"]].map(([rotulo, valor, icone, detalhe]) => (
            <div key={String(rotulo)} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-gray-400">{rotulo}</p><p className="mt-1 text-2xl font-black text-gray-900">{valor}</p></div><span className="rounded-xl bg-pink-50 p-2.5 text-xl">{icone}</span></div><p className="mt-3 text-xs text-gray-500">{detalhe}</p></div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 md:p-6">
            <div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">⌕</span><span className="sr-only">Buscar lista</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por bebê, responsável, e-mail ou código..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-pink-400 focus:bg-white focus:ring-4 focus:ring-pink-50" /></label><div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 text-xs font-bold [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{(["todas", "ativas", "concluidas", "encerradas"] as const).map((opcao) => <button key={opcao} type="button" onClick={() => setFiltro(opcao)} className={`whitespace-nowrap rounded-lg px-3 py-2.5 capitalize transition ${filtro === opcao ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>{opcao === "concluidas" ? "Concluídas" : opcao}</button>)}</div></div>
            <p className="mt-3 text-xs text-gray-500">Mostrando {listasFiltradas.length} de {listas.length} listas.</p>
          </div>
          <div className="p-4 md:p-6">
            {carregando ? <div className="grid gap-4 xl:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-60 animate-pulse rounded-2xl bg-gray-100" />)}</div> : listasFiltradas.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center"><span className="mb-3 block text-4xl">🎁</span><p className="font-bold text-gray-700">Nenhuma lista encontrada</p><p className="mt-1 text-xs text-gray-500">Altere os filtros ou crie uma lista para auxiliar um cliente.</p></div> : (
              <div className="grid gap-4 xl:grid-cols-2">{listasFiltradas.map((lista) => { const andamento = progresso(lista); const encerrada = lista.dataEvento.slice(0, 10) < hojeLocal; const opcaoTema = opcoesTemaLista.find((opcao) => opcao.valor === (lista.tema || "NEUTRO")); return (
                <article key={lista.id} className="rounded-2xl border border-gray-100 bg-white p-5 transition hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl">{opcaoTema?.emoji || "🧸"}</span><div className="min-w-0"><h2 className="truncate text-lg font-black text-gray-900">Lista de {lista.nomeBebe}</h2><p className="truncate text-sm text-gray-500">{lista.cliente.nome} · {lista.cliente.email}</p><p className="mt-1 text-[10px] font-black uppercase tracking-wide text-gray-400">Tema {opcaoTema?.titulo || "Neutro"}</p></div></div><span className={`whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-black uppercase ${encerrada ? "bg-gray-100 text-gray-500" : andamento.percentual === 100 && andamento.total > 0 ? "bg-green-50 text-green-700" : "bg-pink-50 text-pink-600"}`}>{encerrada ? "Encerrada" : andamento.percentual === 100 && andamento.total > 0 ? "Completa" : "Ativa"}</span></div>
                  <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 text-sm"><div><span className="block text-[10px] font-bold uppercase text-gray-400">Evento</span><strong>{formatarData(lista.dataEvento)}</strong></div><div><span className="block text-[10px] font-bold uppercase text-gray-400">Presentes</span><strong>{andamento.comprados} de {andamento.total} comprados</strong></div></div>
                  <div className="mt-4"><div className="mb-1.5 flex justify-between text-xs font-bold text-gray-500"><span>Progresso da lista</span><span>{andamento.percentual}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-gradient-to-r from-pink-400 to-[#BA68C8]" style={{ width: `${andamento.percentual}%` }} /></div></div>
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-gray-100 pt-4"><button type="button" onClick={() => abrirGerenciamento(lista)} className="rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-black text-white hover:bg-gray-800">Gerenciar lista</button><button type="button" onClick={() => void copiarLink(lista)} className="rounded-xl bg-pink-50 px-4 py-2.5 text-xs font-black text-pink-600 hover:bg-pink-100">🔗 Copiar link</button><Link href={`/chadebebe/lista/${lista.linkExclusivo}`} target="_blank" className="rounded-xl bg-gray-100 px-4 py-2.5 text-xs font-black text-gray-600 hover:bg-gray-200">Visualizar ↗</Link></div>
                </article> ); })}</div>
            )}
          </div>
        </section>
      </main>

      {listaEditando && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-5"><div className="max-h-[94vh] w-full max-w-4xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl md:rounded-3xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 md:px-7"><div><h2 className="text-xl font-black">Gerenciar lista de {listaEditando.nomeBebe}</h2><p className="text-xs text-gray-500">Responsável: {listaEditando.cliente.nome}</p></div><button type="button" onClick={() => setListaEditandoId(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-500">×</button></div>
          <div className="grid gap-6 p-5 md:p-7 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="space-y-5"><section className="rounded-2xl border border-gray-100 p-5"><h3 className="mb-4 font-black">Dados do evento</h3><div className="space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold text-gray-500">Nome do bebê</span><input value={nomeBebeEdicao} onChange={(event) => setNomeBebeEdicao(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-pink-400" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-gray-500">Data do evento</span><input type="date" value={dataEventoEdicao} onChange={(event) => setDataEventoEdicao(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none focus:border-pink-400" /></label><fieldset><legend className="mb-2 text-xs font-bold text-gray-500">Tema da lista</legend><div className="grid grid-cols-3 gap-2">{opcoesTemaLista.map((opcao) => <button key={opcao.valor} type="button" aria-pressed={temaEdicao === opcao.valor} onClick={() => setTemaEdicao(opcao.valor)} className={`rounded-xl border-2 px-2 py-2 text-center transition ${opcao.cartao} ${temaEdicao === opcao.valor ? opcao.selecionado : "opacity-70"}`}><span className="block text-lg">{opcao.emoji}</span><span className="block text-[10px] font-black">{opcao.titulo}</span></button>)}</div></fieldset><button type="button" disabled={salvando} onClick={() => void salvarDadosLista()} className="w-full rounded-xl bg-gray-950 px-4 py-3 text-sm font-black text-white disabled:opacity-60">Salvar dados</button></div></section>
            <section className="rounded-2xl border border-pink-100 bg-pink-50/50 p-5"><h3 className="font-black text-gray-900">Adicionar presente</h3><p className="mt-1 text-xs text-gray-500">Escolha um produto disponível e o tamanho.</p><select value={produtoAdicionarId} onChange={(event) => { const id = event.target.value; setProdutoAdicionarId(id); const produto = produtos.find((item) => item.id === Number(id)); setTamanhoAdicionar(tamanhosDoProduto(produto)[0] || "Único"); }} className="mt-4 w-full rounded-xl border border-pink-200 bg-white p-3 text-sm outline-none"><option value="">Selecione um produto...</option>{produtos.filter((produto) => produto.quantidadeEstoque > 0).map((produto) => <option key={produto.id} value={produto.id}>{produto.nome} · estoque {produto.quantidadeEstoque}</option>)}</select>{produtoAdicionar && <div className="mt-3 flex flex-wrap gap-2">{tamanhosDoProduto(produtoAdicionar).map((tamanho) => <button key={tamanho} type="button" onClick={() => setTamanhoAdicionar(tamanho)} className={`rounded-lg px-3 py-2 text-xs font-black ${tamanhoAdicionar === tamanho ? "bg-pink-500 text-white" : "bg-white text-gray-600"}`}>{tamanho}</button>)}</div>}<button type="button" disabled={salvando || !produtoAdicionarId} onClick={() => void adicionarProduto()} className="mt-4 w-full rounded-xl bg-pink-500 px-4 py-3 text-sm font-black text-white disabled:opacity-50">Adicionar à lista</button></section></div>
            <section>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h3 className="font-black">Presentes da lista</h3>
                  <p className="text-xs text-gray-500">Itens comprados ficam protegidos contra remoção.</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold">{listaEditando.produtos.length} itens</span>
              </div>
              {listaEditando.produtos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-14 text-center text-sm text-gray-500">Nenhum presente foi escolhido ainda.</div>
              ) : (
                <div className="space-y-3">
                  {listaEditando.produtos.map((item) => (
                    <div key={item.produtoId} className="flex items-center gap-3 rounded-2xl border border-gray-100 p-3">
                      <div className="flex h-16 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                        {item.produto.imagemUrl ? (
                          <ImagemProduto src={`${API_URL}${item.produto.imagemUrl}`} alt={item.produto.nome} className="h-full w-full object-cover" sizes="56px" />
                        ) : "📷"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black">{item.produto.nome}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-bold">
                          <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">Tam. {item.tamanho || "Único"}</span>
                          <span className={`rounded-md px-2 py-1 ${item.comprado ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>{item.comprado ? "Comprado" : "Aguardando"}</span>
                        </div>
                      </div>
                      <button type="button" disabled={item.comprado} onClick={() => void removerProduto(item)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-600 disabled:cursor-not-allowed disabled:opacity-30">Remover</button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div></div>
      )}

      {mostrarCriacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"><form onSubmit={criarLista} className="max-h-[94vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">Criar para um cliente</h2><p className="mt-1 text-xs leading-relaxed text-gray-500">Use somente quando a loja estiver auxiliando uma família. O cliente precisa já estar cadastrado.</p></div><button type="button" onClick={() => setMostrarCriacao(false)} className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold">×</button></div><div className="mt-6 space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold text-gray-600">E-mail do cliente</span><input type="email" value={emailCliente} onChange={(event) => setEmailCliente(event.target.value)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 outline-none focus:border-pink-400" placeholder="cliente@email.com" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-gray-600">Nome do bebê</span><input value={nomeBebeNovo} onChange={(event) => setNomeBebeNovo(event.target.value)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 outline-none focus:border-pink-400" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-gray-600">Data do evento</span><input type="date" min={hojeLocal} value={dataEventoNova} onChange={(event) => setDataEventoNova(event.target.value)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 outline-none focus:border-pink-400" /></label><fieldset><legend className="mb-2 text-xs font-bold text-gray-600">Tema da lista</legend><div className="grid grid-cols-3 gap-2">{opcoesTemaLista.map((opcao) => <button key={opcao.valor} type="button" aria-pressed={temaNovo === opcao.valor} onClick={() => setTemaNovo(opcao.valor)} className={`rounded-xl border-2 px-2 py-2.5 text-center transition ${opcao.cartao} ${temaNovo === opcao.valor ? opcao.selecionado : "opacity-70"}`}><span className="block text-xl">{opcao.emoji}</span><span className="block text-[10px] font-black">{opcao.titulo}</span></button>)}</div></fieldset><button type="submit" disabled={salvando} className="w-full rounded-xl bg-pink-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-pink-100 disabled:opacity-60">{salvando ? "Criando..." : "Criar lista e gerenciar presentes"}</button></div></form></div>
      )}
    </AdminShell>
  );
}
