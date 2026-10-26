"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Cabecalho } from "../../components/Cabecalho";
import { Rodape } from "../../components/Rodape";
import { apiFetch } from "../../lib/api";

type Cliente = {
  id: number;
  nome: string;
  email: string;
  cpf?: string | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
};
type Pedido = {
  id: number;
  dataCriacao: string;
  valorTotal: number | string;
  status: string;
  metodoPagamento?: string | null;
  tipoEntrega?: "RETIRADA" | "ENTREGA" | "NAO_INFORMADO";
  cepEntrega?: string | null;
  ruaEntrega?: string | null;
  numeroEntrega?: string | null;
  bairroEntrega?: string | null;
  cidadeEntrega?: string | null;
  estadoEntrega?: string | null;
  itens: Array<{ id: number; quantidade: number; tamanho?: string | null; produto: { nome: string } }>;
};
type Lista = { id: number; nomeBebe: string; dataEvento: string; linkExclusivo: string; produtos: unknown[] };
type EnderecoForm = { cep: string; rua: string; numero: string; bairro: string; cidade: string; estado: string };

const enderecoVazio: EnderecoForm = { cep: "", rua: "", numero: "", bairro: "", cidade: "", estado: "" };
const formatarCep = (valor: string) => valor.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);

function estiloStatus(status: string) {
  if (status === "Aprovado" || status === "Entregue") return "bg-green-100 text-green-700";
  if (status === "Em separação") return "bg-purple-100 text-purple-700";
  if (status === "Enviado") return "bg-blue-100 text-blue-700";
  if (status === "Cancelado" || status === "Falha no pagamento") return "bg-red-100 text-red-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function MinhaConta() {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [listas, setListas] = useState<Lista[]>([]);
  const [abaAtiva, setAbaAtiva] = useState("pedidos");
  const [editandoEndereco, setEditandoEndereco] = useState(false);
  const [endereco, setEndereco] = useState<EnderecoForm>(enderecoVazio);
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [salvandoEndereco, setSalvandoEndereco] = useState(false);

  useEffect(() => {
    const clientData = sessionStorage.getItem("pegada_kids_cliente");
    const token = sessionStorage.getItem("pegada_kids_cliente_token");
    if (!clientData || !token) {
      router.push("/entrar");
      return;
    }
    Promise.all([
      apiFetch("/clientes/me", {}, "cliente").then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setCliente(data);
        sessionStorage.setItem("pegada_kids_cliente", JSON.stringify(data));
        setEndereco({
          cep: formatarCep(data.cep || ""),
          rua: data.rua || "",
          numero: data.numero || "",
          bairro: data.bairro || "",
          cidade: data.cidade || "",
          estado: data.estado || "",
        });
      }),
      apiFetch("/pedidos/me", {}, "cliente").then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setPedidos(data);
      }),
      apiFetch("/clientes/me/listas", {}, "cliente").then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setListas(data);
      }),
    ]).catch((error) => toast.error(error.message || "Não foi possível carregar sua conta."));
  }, [router]);

  const atualizarCampoEndereco = (campo: keyof EnderecoForm, valor: string) => {
    setEndereco((atual) => ({ ...atual, [campo]: campo === "cep" ? formatarCep(valor) : valor }));
  };

  const consultarCep = async () => {
    const cepLimpo = endereco.cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return void toast.error("Informe um CEP com 8 dígitos.");
    setConsultandoCep(true);
    try {
      const response = await apiFetch(`/enderecos/cep/${cepLimpo}`, {}, "cliente");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "CEP não encontrado.");
      setEndereco((atual) => ({
        ...atual,
        cep: formatarCep(data.cep),
        rua: data.rua || "",
        bairro: data.bairro || "",
        cidade: data.cidade || "",
        estado: data.estado || "",
      }));
      toast.success("CEP encontrado. Confira o endereço e informe o número.");
    } catch {
      toast.error("Não foi possível consultar o CEP agora.");
    } finally {
      setConsultandoCep(false);
    }
  };

  const salvarEndereco = async () => {
    if (!endereco.cep || !endereco.rua || !endereco.numero || !endereco.bairro || !endereco.cidade || !endereco.estado) {
      return void toast.error("Preencha todos os campos do endereço.");
    }
    setSalvandoEndereco(true);
    try {
      const response = await apiFetch("/clientes/me/endereco", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(endereco),
      }, "cliente");
      const data = await response.json();
      if (!response.ok) return void toast.error(data.error || "Não foi possível salvar o endereço.");
      setCliente(data.cliente);
      sessionStorage.setItem("pegada_kids_cliente", JSON.stringify(data.cliente));
      setEndereco({
        cep: formatarCep(data.cliente.cep || ""),
        rua: data.cliente.rua || "",
        numero: data.cliente.numero || "",
        bairro: data.cliente.bairro || "",
        cidade: data.cliente.cidade || "",
        estado: data.cliente.estado || "",
      });
      setEditandoEndereco(false);
      toast.success("Endereço de entrega atualizado.");
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setSalvandoEndereco(false);
    }
  };

  const abrirPainelLista = (lista: Lista) => {
    localStorage.setItem("minhaListaId", String(lista.id));
    localStorage.setItem("minhaListaLink", lista.linkExclusivo);
    router.push("/chadebebe/painel");
  };

  if (!cliente) return <div className="min-h-screen flex items-center justify-center text-[#BA68C8] font-bold">Carregando...</div>;

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Cabecalho />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center text-3xl">👶</div>
                <div><p className="text-xs text-gray-500 font-bold uppercase">Bem-vindo(a),</p><h2 className="text-lg font-black">{cliente.nome.split(" ")[0]}</h2></div>
              </div>
              <nav className="space-y-2">
                {[["pedidos", "📦 Meus Pedidos"], ["dados", "👤 Meus Dados"], ["listas", "🎁 Chá de Bebê"]].map(([id, label]) => (
                  <button key={id} onClick={() => setAbaAtiva(id)} className={`w-full px-4 py-3 rounded-xl font-bold text-left ${abaAtiva === id ? "bg-[#BA68C8] text-white" : "text-gray-500 hover:bg-gray-50"}`}>{label}</button>
                ))}
              </nav>
            </div>
          </aside>

          <section className="flex-1">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
              {abaAtiva === "pedidos" && (
                <div>
                  <h2 className="text-2xl font-black mb-6">Meus Pedidos</h2>
                  {pedidos.length === 0 ? <p className="text-gray-500">Você ainda não realizou pedidos.</p> : <div className="space-y-4">
                    {pedidos.map((pedido) => (
                      <article key={pedido.id} className="border border-gray-100 rounded-2xl p-6">
                        <div className="flex flex-wrap justify-between gap-3 border-b pb-4 mb-4">
                          <div><p className="font-bold text-gray-700">Pedido #{pedido.id}</p><p className="text-xs text-gray-400">{new Date(pedido.dataCriacao).toLocaleString("pt-BR")}</p></div>
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase ${estiloStatus(pedido.status)}`}>{pedido.status}</span>
                        </div>
                        {pedido.itens.map((item) => <p key={item.id} className="text-sm text-gray-600">{item.quantidade}x {item.produto.nome} — Tam. {item.tamanho || "Único"}</p>)}
                        <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                          {pedido.tipoEntrega === "ENTREGA" ? (
                            <><span className="font-black text-gray-800">🚚 Entrega:</span> {pedido.ruaEntrega}, {pedido.numeroEntrega} — {pedido.bairroEntrega}, {pedido.cidadeEntrega}/{pedido.estadoEntrega} · CEP {formatarCep(pedido.cepEntrega || "")}</>
                          ) : pedido.tipoEntrega === "RETIRADA" ? (
                            <><span className="font-black text-gray-800">🏪 Retirada na loja</span> — sem taxa de entrega.</>
                          ) : (
                            <><span className="font-black text-gray-800">ℹ️ Forma de recebimento não registrada</span> — pedido anterior à atualização do sistema.</>
                          )}
                        </div>
                        <div className="flex justify-between mt-4 font-bold"><span>{pedido.metodoPagamento || "Pagamento"}</span><span className="text-[#BA68C8]">R$ {Number(pedido.valorTotal).toFixed(2).replace(".", ",")}</span></div>
                      </article>
                    ))}
                  </div>}
                </div>
              )}

              {abaAtiva === "dados" && (
                <div>
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-2xl font-black">Meus Dados</h2><p className="mt-1 text-sm text-gray-500">Mantenha seu endereço pronto para agilizar as próximas compras.</p></div></div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div><p className="text-xs font-bold text-gray-500 uppercase">Nome</p><div className="p-4 bg-gray-50 rounded-xl">{cliente.nome}</div></div>
                    <div><p className="text-xs font-bold text-gray-500 uppercase">E-mail</p><div className="p-4 bg-gray-50 rounded-xl">{cliente.email}</div></div>
                    <div><p className="text-xs font-bold text-gray-500 uppercase">CPF</p><div className="p-4 bg-gray-50 rounded-xl">***.***.***-**</div></div>
                    <div><p className="text-xs font-bold text-gray-500 uppercase">Endereço de entrega</p><div className="p-4 bg-gray-50 rounded-xl">{cliente.rua ? `${cliente.rua}, ${cliente.numero} — ${cliente.bairro}, ${cliente.cidade}/${cliente.estado} · CEP ${formatarCep(cliente.cep || "")}` : "Ainda não cadastrado"}</div></div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div><h3 className="font-black text-gray-900">📍 Endereço para entrega</h3><p className="mt-1 text-xs text-gray-600">O CEP é validado e preenche cidade, estado, bairro e rua automaticamente.</p></div>
                      {!editandoEndereco && <button type="button" onClick={() => setEditandoEndereco(true)} className="rounded-xl bg-[#42D3E5] px-4 py-2.5 text-sm font-black text-white">{cliente.rua ? "Alterar endereço" : "Cadastrar endereço"}</button>}
                    </div>

                    {editandoEndereco && (
                      <div className="mt-5 space-y-3">
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <input value={endereco.cep} onChange={(event) => atualizarCampoEndereco("cep", event.target.value)} placeholder="CEP" aria-label="CEP" className="flex-1 rounded-xl border border-cyan-200 bg-white p-3 outline-none focus:border-cyan-500" />
                          <button type="button" onClick={() => void consultarCep()} disabled={consultandoCep} className="rounded-xl bg-[#42D3E5] px-5 py-3 font-bold text-white disabled:opacity-60">{consultandoCep ? "Consultando..." : "Buscar CEP"}</button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <input value={endereco.rua} onChange={(event) => atualizarCampoEndereco("rua", event.target.value)} placeholder="Rua" aria-label="Rua" className="rounded-xl border border-cyan-200 bg-white p-3 sm:col-span-2" />
                          <input value={endereco.numero} onChange={(event) => atualizarCampoEndereco("numero", event.target.value)} placeholder="Número" aria-label="Número" className="rounded-xl border border-cyan-200 bg-white p-3" />
                          <input value={endereco.bairro} onChange={(event) => atualizarCampoEndereco("bairro", event.target.value)} placeholder="Bairro" aria-label="Bairro" className="rounded-xl border border-cyan-200 bg-white p-3" />
                          <input value={endereco.cidade} readOnly placeholder="Cidade" aria-label="Cidade" className="rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-gray-600" />
                          <input value={endereco.estado} readOnly placeholder="UF" aria-label="Estado" className="rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-gray-600" />
                        </div>
                        <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditandoEndereco(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600">Cancelar</button><button type="button" onClick={() => void salvarEndereco()} disabled={salvandoEndereco} className="rounded-xl bg-[#00BFA6] px-5 py-3 text-sm font-black text-white disabled:opacity-60">{salvandoEndereco ? "Salvando..." : "Salvar endereço"}</button></div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {abaAtiva === "listas" && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6"><h2 className="text-2xl font-black">Suas Listas</h2><Link href="/chadebebe/criar" className="bg-[#E85D75] text-white font-bold px-5 py-3 rounded-xl">+ Criar Nova Lista</Link></div>
                  {listas.length === 0 ? <p className="text-gray-500">Você ainda não criou uma lista.</p> : <div className="space-y-4">{listas.map((lista) => <button key={lista.id} onClick={() => abrirPainelLista(lista)} className="w-full text-left border rounded-2xl p-5 hover:bg-pink-50"><p className="font-black">Chá do(a) {lista.nomeBebe}</p><p className="text-sm text-gray-500">{lista.produtos.length} presentes • {new Date(lista.dataEvento).toLocaleDateString("pt-BR")}</p></button>)}</div>}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      <Rodape />
    </main>
  );
}
