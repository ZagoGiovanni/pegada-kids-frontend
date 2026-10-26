"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { AdminShell } from "../../../components/admin/AdminShell";
import { apiFetch } from "../../../lib/api";

type Cliente = {
  id: number;
  nome: string;
  email: string;
  cpf: string | null;
  telefone: string | null;
  cep: string | null;
  rua: string | null;
  numero: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  _count: { pedidos: number; listas: number };
};
type ClienteForm = Pick<Cliente, "nome" | "email" | "cpf" | "telefone" | "cep" | "rua" | "numero" | "bairro" | "cidade" | "estado">;

const campos: Array<{ id: keyof ClienteForm; rotulo: string; amplo?: boolean }> = [
  { id: "nome", rotulo: "Nome completo", amplo: true },
  { id: "email", rotulo: "E-mail", amplo: true },
  { id: "cpf", rotulo: "CPF" },
  { id: "telefone", rotulo: "Telefone" },
  { id: "cep", rotulo: "CEP" },
  { id: "estado", rotulo: "Estado" },
  { id: "rua", rotulo: "Rua", amplo: true },
  { id: "numero", rotulo: "Número" },
  { id: "bairro", rotulo: "Bairro" },
  { id: "cidade", rotulo: "Cidade", amplo: true },
];

function formatarCpf(valor: string | null) {
  const cpf = String(valor || "").replace(/\D/g, "");
  return cpf.length === 11 ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : valor || "Não informado";
}

export default function ClientesAdmin() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [form, setForm] = useState<ClienteForm | null>(null);
  const [busca, setBusca] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregarClientes = useCallback(async () => {
    try {
      const response = await apiFetch("/admin/clientes", {}, "admin");
      if (response.status === 401 || response.status === 403) {
        sessionStorage.removeItem("pegada_kids_admin_token");
        router.push("/admin");
        return;
      }
      if (!response.ok) throw new Error();
      setClientes(await response.json());
    } catch {
      toast.error("Não foi possível carregar os clientes.");
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
      void carregarClientes();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router, carregarClientes]);

  function iniciarEdicao(cliente: Cliente) {
    setEditandoId(cliente.id);
    setForm({ nome: cliente.nome, email: cliente.email, cpf: cliente.cpf || "", telefone: cliente.telefone || "", cep: cliente.cep || "", rua: cliente.rua || "", numero: cliente.numero || "", bairro: cliente.bairro || "", cidade: cliente.cidade || "", estado: cliente.estado || "" });
  }

  async function salvar() {
    if (!form || !editandoId) return;
    setSalvando(true);
    try {
      const response = await apiFetch(`/admin/clientes/${editandoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }, "admin");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "Não foi possível atualizar o cliente.");
      toast.success(data.message);
      setEditandoId(null);
      setForm(null);
      await carregarClientes();
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(cliente: Cliente) {
    if (!window.confirm(`Excluir o cadastro de ${cliente.nome}?`)) return;
    try {
      const response = await apiFetch(`/admin/clientes/${cliente.id}`, { method: "DELETE" }, "admin");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "Não foi possível excluir o cliente.");
      toast.success(data.message);
      await carregarClientes();
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    }
  }

  const atualizarCampo = (campo: keyof ClienteForm, valor: string) => setForm((atual) => atual ? { ...atual, [campo]: valor } : atual);
  const buscaNormalizada = busca.trim().toLocaleLowerCase("pt-BR");
  const clientesFiltrados = clientes.filter((cliente) => `${cliente.nome} ${cliente.email} ${cliente.cpf || ""} ${cliente.telefone || ""} ${cliente.cidade || ""}`.toLocaleLowerCase("pt-BR").includes(buscaNormalizada));
  const totalPedidos = clientes.reduce((total, cliente) => total + cliente._count.pedidos, 0);
  const totalListas = clientes.reduce((total, cliente) => total + cliente._count.listas, 0);
  const enderecosCompletos = clientes.filter((cliente) => cliente.cep && cliente.rua && cliente.numero && cliente.cidade).length;

  if (!autenticado) return <div className="min-h-screen bg-gray-950" />;

  return (
    <AdminShell areaAtiva="clientes">
      <main className="mx-auto max-w-[1600px] p-4 md:p-8 lg:p-10">
        <header className="mb-7">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-purple-600"><span className="h-2 w-2 rounded-full bg-purple-500" /> Relacionamento</div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Clientes</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">Consulte cadastros, histórico e dados de contato usados nas compras e listas.</p>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[["Clientes", clientes.length, "👥", "Cadastros ativos"], ["Pedidos", totalPedidos, "🛍️", "Compras registradas"], ["Listas", totalListas, "🎁", "Listas de Chá de Bebê"], ["Endereços", enderecosCompletos, "📍", "Cadastros completos"]].map(([rotulo, valor, icone, detalhe]) => (
            <div key={String(rotulo)} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-gray-400">{rotulo}</p><p className="mt-1 text-2xl font-black text-gray-900">{valor}</p></div><span className="rounded-xl bg-purple-50 p-2.5 text-xl">{icone}</span></div><p className="mt-3 text-xs text-gray-500">{detalhe}</p></div>
          ))}
        </section>

        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5 md:p-6"><label className="relative block"><span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">⌕</span><span className="sr-only">Buscar cliente</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Buscar por nome, e-mail, CPF, telefone ou cidade..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-50" /></label><p className="mt-3 text-xs text-gray-500">Mostrando {clientesFiltrados.length} de {clientes.length} clientes.</p></div>
          <div className="p-4 md:p-6">
            {carregando ? <div className="grid gap-4 xl:grid-cols-2">{[1, 2, 3, 4].map((item) => <div key={item} className="h-64 animate-pulse rounded-2xl bg-gray-100" />)}</div> : clientesFiltrados.length === 0 ? <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center"><span className="mb-3 block text-4xl">👥</span><p className="font-bold text-gray-700">Nenhum cliente encontrado</p><p className="mt-1 text-xs text-gray-500">Tente buscar por outro dado.</p></div> : (
              <div className="grid gap-4 xl:grid-cols-2">{clientesFiltrados.map((cliente) => (
                <article key={cliente.id} className="rounded-2xl border border-gray-100 p-5 transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4"><div className="flex min-w-0 gap-3"><span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-lg font-black text-purple-600">{cliente.nome.trim().charAt(0).toUpperCase()}</span><div className="min-w-0"><h2 className="truncate text-lg font-black text-gray-900">{cliente.nome}</h2><p className="truncate text-sm text-gray-500">{cliente.email}</p></div></div><span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black text-gray-400">#{cliente.id}</span></div>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-gray-50 p-3"><span className="block text-[10px] font-bold uppercase text-gray-400">CPF</span><strong className="text-xs sm:text-sm">{formatarCpf(cliente.cpf)}</strong></div><div className="rounded-xl bg-gray-50 p-3"><span className="block text-[10px] font-bold uppercase text-gray-400">Telefone</span><strong className="text-xs sm:text-sm">{cliente.telefone || "Não informado"}</strong></div><div className="rounded-xl bg-gray-50 p-3"><span className="block text-[10px] font-bold uppercase text-gray-400">Localidade</span><strong className="text-xs sm:text-sm">{[cliente.cidade, cliente.estado].filter(Boolean).join(" - ") || "Não informada"}</strong></div><div className="rounded-xl bg-gray-50 p-3"><span className="block text-[10px] font-bold uppercase text-gray-400">Histórico</span><strong className="text-xs sm:text-sm">{cliente._count.pedidos} pedidos · {cliente._count.listas} listas</strong></div></div>
                  <div className="mt-5 flex gap-2 border-t border-gray-100 pt-4"><button type="button" onClick={() => iniciarEdicao(cliente)} className="rounded-xl bg-gray-950 px-4 py-2.5 text-xs font-black text-white hover:bg-gray-800">✏️ Editar cadastro</button><button type="button" onClick={() => void excluir(cliente)} className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-black text-red-600 hover:bg-red-100">Excluir</button></div>
                </article>
              ))}</div>
            )}
          </div>
        </section>
      </main>

      {form && editandoId && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm md:items-center md:p-5"><div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl md:rounded-3xl md:p-8"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">Editar cliente</h2><p className="mt-1 text-xs text-gray-500">Atualize dados pessoais, contato e endereço.</p></div><button type="button" onClick={() => { setEditandoId(null); setForm(null); }} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg font-bold">×</button></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{campos.map((campo) => <label key={campo.id} className={campo.amplo ? "sm:col-span-2" : ""}><span className="mb-1.5 block text-xs font-bold text-gray-600">{campo.rotulo}</span><input value={form[campo.id] || ""} onChange={(event) => atualizarCampo(campo.id, event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 outline-none transition focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-50" /></label>)}</div><div className="mt-7 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row"><button type="button" onClick={() => { setEditandoId(null); setForm(null); }} className="rounded-xl bg-gray-100 px-5 py-3 font-bold text-gray-600">Cancelar</button><button type="button" disabled={salvando} onClick={() => void salvar()} className="flex-1 rounded-xl bg-purple-600 px-5 py-3 font-black text-white shadow-lg shadow-purple-100 disabled:opacity-60">{salvando ? "Salvando..." : "Salvar alterações"}</button></div></div></div>
      )}
    </AdminShell>
  );
}
