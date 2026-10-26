"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AdminShell } from "../../../components/admin/AdminShell";
import { apiFetch } from "../../../lib/api";

type Pedido = {
  id: number;
  dataCriacao: string;
  valorTotal: string | number;
  status: string;
  metodoPagamento: string | null;
  isPresente: boolean;
  tipoEntrega?: "RETIRADA" | "ENTREGA" | "NAO_INFORMADO";
  cepEntrega?: string | null;
  ruaEntrega?: string | null;
  numeroEntrega?: string | null;
  bairroEntrega?: string | null;
  cidadeEntrega?: string | null;
  estadoEntrega?: string | null;
  cliente: { nome: string; email: string };
  itens: Array<{ id: number; quantidade: number; tamanho?: string | null; produto: { nome: string }; listaPresente: { nomeBebe: string } | null }>;
};

const statusDisponiveis = ["Pendente", "Aprovado", "Em separação", "Enviado", "Entregue", "Cancelado"];
const formatarPreco = (valor: string | number) => Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const formatarCep = (valor?: string | null) => String(valor || "").replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
const rotuloEntrega = (tipo?: Pedido["tipoEntrega"]) => tipo === "ENTREGA" ? "🚚 Entrega" : tipo === "RETIRADA" ? "🏪 Retirada" : "ℹ️ Não informado";
const estiloEntrega = (tipo?: Pedido["tipoEntrega"]) => tipo === "ENTREGA" ? "bg-cyan-50 text-cyan-700" : tipo === "RETIRADA" ? "bg-purple-50 text-purple-700" : "bg-gray-100 text-gray-600";
const estiloStatus = (status: string) => {
  if (status === "Entregue") return "bg-green-50 text-green-700";
  if (status === "Cancelado" || status === "Falha no pagamento") return "bg-red-50 text-red-600";
  if (status === "Pendente") return "bg-amber-50 text-amber-700";
  if (status === "Enviado") return "bg-blue-50 text-blue-700";
  return "bg-teal-50 text-[#008f7d]";
};

export default function PedidosAdmin() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [alterandoId, setAlterandoId] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("Todos");

  const carregarPedidos = useCallback(async () => {
    try {
      const response = await apiFetch("/admin/pedidos", {}, "admin");
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("pegada_kids_admin_token");
        router.push("/admin");
        return;
      }
      if (!response.ok) throw new Error();
      setPedidos(await response.json());
    } catch {
      toast.error("Não foi possível carregar os pedidos.");
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
      void carregarPedidos();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router, carregarPedidos]);

  async function atualizarStatus(pedidoId: number, status: string) {
    setAlterandoId(pedidoId);
    try {
      const response = await apiFetch(`/admin/pedidos/${pedidoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }, "admin");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "Não foi possível atualizar o pedido.");
      toast.success(data.message);
      await carregarPedidos();
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setAlterandoId(null);
    }
  }

  const buscaNormalizada = busca.trim().toLocaleLowerCase("pt-BR");
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const texto = `${pedido.id} ${pedido.cliente.nome} ${pedido.cliente.email} ${pedido.ruaEntrega || ""} ${pedido.bairroEntrega || ""} ${pedido.cidadeEntrega || ""} ${pedido.itens.map((item) => item.produto.nome).join(" ")}`.toLocaleLowerCase("pt-BR");
    return (!buscaNormalizada || texto.includes(buscaNormalizada)) && (filtroStatus === "Todos" || pedido.status === filtroStatus);
  });
  const pendentes = pedidos.filter((pedido) => pedido.status === "Pendente").length;
  const emAndamento = pedidos.filter((pedido) => ["Aprovado", "Em separação", "Enviado"].includes(pedido.status)).length;
  const entregues = pedidos.filter((pedido) => pedido.status === "Entregue").length;

  if (!autenticado) return <div className="min-h-screen bg-gray-950" />;

  return (
    <AdminShell areaAtiva="pedidos">
      <main className="mx-auto max-w-[1600px] p-4 md:p-8 lg:p-10">
        <header className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600"><span className="h-2 w-2 rounded-full bg-blue-500" /> Vendas e atendimento</div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Pedidos recebidos</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">Acompanhe pagamentos, separação e entrega em uma visão organizada.</p>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[["Pedidos", pedidos.length, "🧾", "Total registrado"], ["Pendentes", pendentes, "⏳", "Aguardando confirmação"], ["Em andamento", emAndamento, "📦", "Separação ou envio"], ["Entregues", entregues, "✅", "Finalizados com sucesso"]].map(([rotulo, valor, icone, detalhe]) => (
            <div key={String(rotulo)} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-gray-400">{rotulo}</p><p className="mt-1 text-2xl font-black text-gray-900">{valor}</p></div><span className="rounded-xl bg-blue-50 p-2.5 text-xl">{icone}</span></div><p className="mt-3 text-xs text-gray-500">{detalhe}</p></div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 md:p-6">
            <div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">⌕</span><span className="sr-only">Buscar pedido</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por número, cliente, e-mail ou produto..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#00BFA6] focus:bg-white focus:ring-4 focus:ring-teal-50" /></label><select value={filtroStatus} onChange={(event) => setFiltroStatus(event.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#00BFA6]"><option>Todos</option>{statusDisponiveis.map((status) => <option key={status}>{status}</option>)}</select></div>
            <p className="mt-3 text-xs text-gray-500">Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos.</p>
          </div>

          <div className="p-4 md:p-6">
            {carregando ? <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-52 animate-pulse rounded-2xl bg-gray-100" />)}</div> : pedidosFiltrados.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center"><span className="mb-3 block text-4xl">🛒</span><p className="font-bold text-gray-700">Nenhum pedido encontrado</p><p className="mt-1 text-xs text-gray-500">Altere a busca ou o filtro selecionado.</p></div> : (
              <div className="space-y-4">{pedidosFiltrados.map((pedido) => (
                <article key={pedido.id} className="overflow-hidden rounded-2xl border border-gray-100 transition hover:border-blue-200 hover:shadow-md">
                  <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-gray-900">Pedido #{pedido.id}</h2><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${estiloStatus(pedido.status)}`}>{pedido.status}</span>{pedido.isPresente && <span className="rounded-full bg-pink-50 px-3 py-1 text-[10px] font-black uppercase text-pink-600">🎁 Presente</span>}<span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${estiloEntrega(pedido.tipoEntrega)}`}>{rotuloEntrega(pedido.tipoEntrega)}</span></div><p className="mt-2 text-sm font-bold text-gray-700">{pedido.cliente.nome}</p><p className="text-xs text-gray-500">{pedido.cliente.email} · {new Date(pedido.dataCriacao).toLocaleString("pt-BR")}</p>{pedido.tipoEntrega === "ENTREGA" && <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs text-cyan-900"><span className="font-black">Endereço:</span> {pedido.ruaEntrega}, {pedido.numeroEntrega} — {pedido.bairroEntrega}, {pedido.cidadeEntrega}/{pedido.estadoEntrega} · CEP {formatarCep(pedido.cepEntrega)}</div>}</div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><div className="sm:text-right"><p className="text-xl font-black text-gray-900">{formatarPreco(pedido.valorTotal)}</p><p className="text-[10px] font-bold uppercase text-gray-400">via {pedido.metodoPagamento || "não informado"}</p></div><select aria-label={`Alterar status do pedido ${pedido.id}`} value={pedido.status} disabled={alterandoId === pedido.id} onChange={(event) => void atualizarStatus(pedido.id, event.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-[#00BFA6] disabled:opacity-50">{[...new Set([pedido.status, ...statusDisponiveis])].map((status) => <option key={status}>{status}</option>)}</select></div>
                  </div>
                  <div className="border-t border-gray-100 bg-gray-50/70 p-4"><p className="mb-3 text-[10px] font-black uppercase tracking-wide text-gray-400">Itens do pedido</p><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{pedido.itens.map((item) => <div key={item.id} className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm"><p className="font-black text-gray-800">{item.quantidade}× {item.produto.nome}</p><p className="mt-1 text-xs text-gray-500">Tamanho {item.tamanho || "Único"}</p>{item.listaPresente && <p className="mt-1 text-xs font-bold text-pink-600">🎁 Lista de {item.listaPresente.nomeBebe}</p>}</div>)}</div></div>
                </article>
              ))}</div>
            )}
          </div>
        </section>
      </main>
    </AdminShell>
  );
}
