"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { CarrinhoContext } from "../../contexts/CarrinhoContext";
import { Cabecalho } from "../../components/Cabecalho";
import { Rodape } from "../../components/Rodape";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";
import type { ClienteSessao } from "../../lib/types";

export default function CheckoutOpcoesPage() {
  const { carrinho, carrinhoCarregado, limparCarrinho } = useContext(CarrinhoContext);
  const router = useRouter();
  const redirecionandoParaPagamento = useRef(false);
  const [clienteLogado, setClienteLogado] = useState<ClienteSessao | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<"RETIRADA" | "ENTREGA">("RETIRADA");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [finalizando, setFinalizando] = useState<"PIX" | "WHATSAPP" | null>(null);

  useEffect(() => {
    const dadosSalvos = sessionStorage.getItem("pegada_kids_cliente");
    const token = sessionStorage.getItem("pegada_kids_cliente_token");
    if (token) {
      const preencherEndereco = (cliente: ClienteSessao) => {
        setClienteLogado(cliente);
        setCep(cliente.cep ? cliente.cep.replace(/(\d{5})(\d{3})/, "$1-$2") : "");
        setRua(cliente.rua || "");
        setNumero(cliente.numero || "");
        setBairro(cliente.bairro || "");
        setCidade(cliente.cidade || "");
        setEstado(cliente.estado || "");

        const consultaSalva = sessionStorage.getItem("pegada_kids_cep_consultado");
        if (!cliente.cep && consultaSalva) {
          const endereco = JSON.parse(consultaSalva);
          setCep(String(endereco.cep || ""));
          setRua(endereco.logradouro || "");
          setBairro(endereco.bairro || "");
          setCidade(endereco.localidade || "");
          setEstado(endereco.uf || "");
        }
      };
      let ativo = true;
      void apiFetch("/clientes/me", {}, "cliente")
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error);
          if (!ativo) return;
          sessionStorage.setItem("pegada_kids_cliente", JSON.stringify(data));
          preencherEndereco(data);
        })
        .catch(() => {
          if (!ativo) return;
          if (dadosSalvos) preencherEndereco(JSON.parse(dadosSalvos) as ClienteSessao);
          else router.push("/entrar");
        });
      return () => {
        ativo = false;
      };
    }
    router.push("/entrar");
  }, [router]);

  useEffect(() => {
    if (
      carrinhoCarregado &&
      carrinho.length === 0 &&
      !redirecionandoParaPagamento.current
    ) {
      router.replace("/carrinho");
    }
  }, [carrinho.length, carrinhoCarregado, router]);

  const valorTotal = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

  const consultarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      toast.error("Informe um CEP com 8 dígitos.");
      return;
    }
    setConsultandoCep(true);
    try {
      const response = await apiFetch(`/enderecos/cep/${cepLimpo}`, {}, "cliente");
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "CEP não encontrado.");
        return;
      }
      setCep(cepLimpo.replace(/(\d{5})(\d{3})/, "$1-$2"));
      setRua(data.rua || "");
      setBairro(data.bairro || "");
      setCidade(data.cidade || "");
      setEstado(data.estado || "");
      toast.success("Endereço preenchido. Informe apenas o número.");
    } catch {
      toast.error("Não foi possível consultar o CEP agora.");
    } finally {
      setConsultandoCep(false);
    }
  };

  const salvarEndereco = async () => {
    if (tipoEntrega === "RETIRADA") return true;
    if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
      toast.error("Complete todos os dados do endereço de entrega.");
      return false;
    }
    const response = await apiFetch("/clientes/me/endereco", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cep, rua, numero, bairro, cidade, estado }),
    }, "cliente");
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      toast.error(data.error || "Não foi possível salvar o endereço.");
      return false;
    }
    sessionStorage.setItem("pegada_kids_cliente", JSON.stringify(data.cliente));
    setClienteLogado(data.cliente);
    return true;
  };

  const pagarComPix = async () => {
    if (finalizando) return;
    if (tipoEntrega === "ENTREGA") {
      toast.error("Para pedidos com entrega, finalize pelo WhatsApp para combinar a taxa.");
      return;
    }
    setFinalizando("PIX");
    const loadingToast = toast.loading("Gerando seu PIX seguro...");
    try {
      const resposta = await apiFetch("/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itensCarrinho: carrinho,
          entrega: { tipoEntrega: "RETIRADA" },
        }),
      }, "cliente");

      const dados = await resposta.json();
      toast.dismiss(loadingToast);

      if (!resposta.ok) {
        toast.error(dados.error || "Erro ao gerar o pedido.");
        return;
      }

      sessionStorage.setItem("pegada_kids_pix", dados.pixCode);
      sessionStorage.setItem("pegada_kids_pedido_id", dados.pedidoId);
      redirecionandoParaPagamento.current = true;
      toast.success("Pedido gerado! 🎉");
      router.replace("/pagamento");
      limparCarrinho();
    } catch {
      toast.dismiss(loadingToast);
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setFinalizando(null);
    }
  };

  const pagarComWhatsApp = async () => {
    if (finalizando) return;
    if (!clienteLogado) {
      toast.error("Entre novamente para finalizar o pedido.");
      router.push("/entrar");
      return;
    }
    const whatsappWindow = window.open("", "_blank");
    if (!whatsappWindow) {
      toast.error("O navegador bloqueou o WhatsApp. Permita pop-ups e tente novamente.");
      return;
    }
    whatsappWindow.document.title = "Abrindo WhatsApp...";
    whatsappWindow.document.body.textContent = "Preparando seu pedido na Pegada Kids...";
    setFinalizando("WHATSAPP");
    let enderecoSalvo = false;
    try {
      enderecoSalvo = await salvarEndereco();
    } catch {
      toast.error("Não foi possível salvar o endereço. Tente novamente.");
    }
    if (!enderecoSalvo) {
      whatsappWindow.close();
      setFinalizando(null);
      return;
    }
    const loadingToast = toast.loading("Registrando seu pedido...");
    try {
      const response = await apiFetch("/pedidos/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itensCarrinho: carrinho,
          entrega: tipoEntrega === "ENTREGA"
            ? { tipoEntrega, cep, rua, numero, bairro, cidade, estado }
            : { tipoEntrega },
        }),
      }, "cliente");
      const data = await response.json();
      toast.dismiss(loadingToast);
      if (!response.ok) {
        whatsappWindow.close();
        toast.error(data.error || "Não foi possível registrar o pedido.");
        return;
      }

      const numeroLoja = "5518996753816";
      let textoPedido = `Olá, Pegada Kids! 🧸 Gostaria de finalizar o pedido #${data.pedidoId} (Cliente: ${clienteLogado.nome}):\n\n`;
      carrinho.forEach((item) => {
        textoPedido += `🛒 ${item.quantidade}x ${item.nome} (Tam. ${item.tamanho || "Único"}) - R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}\n`;
      });

      textoPedido += `\n*Total: R$ ${Number(data.valorTotal).toFixed(2).replace('.', ',')}*\n`;
      if (tipoEntrega === "ENTREGA") {
        textoPedido += `📍 Entrega em: ${rua}, ${numero} - ${bairro}, ${cidade}/${estado} - CEP ${cep}\n`;
        textoPedido += `Taxa de entrega a combinar com a loja.\n`;
      } else {
        textoPedido += `📦 Retirada na loja.\n`;
      }
      textoPedido += `Prefiro combinar outra forma de pagamento (Cartão/Retirada)!`;

      whatsappWindow.location.href = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(textoPedido)}`;
      limparCarrinho();
      toast.success(`Pedido #${data.pedidoId} salvo como pendente.`);
    } catch {
      whatsappWindow.close();
      toast.dismiss(loadingToast);
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setFinalizando(null);
    }
  };

  if (!clienteLogado || !carrinhoCarregado || carrinho.length === 0) {
    return <div className="min-h-screen flex items-center justify-center text-[#BA68C8] font-bold">Carregando checkout...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Cabecalho />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white max-w-2xl w-full rounded-3xl shadow-lg p-8 border border-gray-100">
          <h1 className="text-2xl font-black text-center text-[#E85D75] mb-2">Como prefere pagar?</h1>
          <p className="text-gray-500 text-center mb-8 text-sm">Escolha a melhor opção para finalizar sua compra na Pegada Kids</p>

          <section className="mb-8" aria-labelledby="forma-entrega">
            <h2 id="forma-entrega" className="font-black text-gray-800 mb-3">Como deseja receber?</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipoEntrega("RETIRADA")}
                className={`p-4 rounded-2xl border-2 text-left ${tipoEntrega === "RETIRADA" ? "border-[#BA68C8] bg-purple-50" : "border-gray-100 bg-gray-50"}`}
              >
                <span className="font-black block">🏪 Retirar na loja</span>
                <span className="text-xs text-gray-500">Sem taxa de entrega.</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoEntrega("ENTREGA")}
                className={`p-4 rounded-2xl border-2 text-left ${tipoEntrega === "ENTREGA" ? "border-[#42D3E5] bg-cyan-50" : "border-gray-100 bg-gray-50"}`}
              >
                <span className="font-black block">🚚 Receber no endereço</span>
                <span className="text-xs text-gray-500">Taxa combinada com a loja.</span>
              </button>
            </div>

            {tipoEntrega === "ENTREGA" && (
              <div className="mt-4 bg-cyan-50 border border-cyan-100 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <input
                    value={cep}
                    onChange={(event) => setCep(event.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9))}
                    placeholder="CEP"
                    aria-label="CEP"
                    className="flex-1 p-3 rounded-xl border border-cyan-200 bg-white outline-none focus:border-cyan-500"
                  />
                  <button type="button" onClick={consultarCep} disabled={consultandoCep} className="bg-[#42D3E5] text-white font-bold px-5 py-3 rounded-xl disabled:opacity-60">
                    {consultandoCep ? "Consultando..." : "Buscar CEP"}
                  </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <input value={rua} onChange={(event) => setRua(event.target.value)} placeholder="Rua" aria-label="Rua" className="sm:col-span-2 p-3 rounded-xl border border-cyan-200 bg-white" />
                  <input value={numero} onChange={(event) => setNumero(event.target.value)} placeholder="Número" aria-label="Número" className="p-3 rounded-xl border border-cyan-200 bg-white" />
                  <input value={bairro} onChange={(event) => setBairro(event.target.value)} placeholder="Bairro" aria-label="Bairro" className="p-3 rounded-xl border border-cyan-200 bg-white" />
                  <input value={cidade} onChange={(event) => setCidade(event.target.value)} placeholder="Cidade" aria-label="Cidade" className="p-3 rounded-xl border border-cyan-200 bg-white" />
                  <input value={estado} onChange={(event) => setEstado(event.target.value.toUpperCase().slice(0, 2))} placeholder="UF" aria-label="Estado" className="p-3 rounded-xl border border-cyan-200 bg-white" />
                </div>
                <p className="text-xs text-cyan-800 mt-3">Pedidos com entrega são finalizados pelo WhatsApp para confirmar a taxa e o prazo.</p>
              </div>
            )}
          </section>

          <div className="space-y-4">
            <button onClick={pagarComPix} disabled={tipoEntrega === "ENTREGA" || finalizando !== null} className="w-full border-2 border-gray-100 hover:border-[#BA68C8] p-5 rounded-2xl flex items-center gap-4 transition-all text-left bg-gray-50 hover:bg-purple-50 group disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="text-4xl bg-white p-3 rounded-xl shadow-sm group-hover:scale-105 transition-transform">⚡</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{finalizando === "PIX" ? "Gerando PIX..." : "PIX Automático"}</h3>
                <p className="text-xs text-gray-500">{tipoEntrega === "ENTREGA" ? "Disponível para retirada na loja." : "Aprovação imediata. O código copia e cola aparece direto na tela."}</p>
              </div>
            </button>

            <button onClick={pagarComWhatsApp} disabled={finalizando !== null} className="w-full border-2 border-gray-100 hover:border-[#25D366] p-5 rounded-2xl flex items-center gap-4 transition-all text-left bg-gray-50 hover:bg-green-50 group disabled:cursor-wait disabled:opacity-50">
              <span className="text-4xl bg-white p-3 rounded-xl shadow-sm group-hover:scale-105 transition-transform">💬</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg">{finalizando === "WHATSAPP" ? "Preparando pedido..." : "Combinar via WhatsApp"}</h3>
                <p className="text-xs text-gray-500">Para pagar em Cartão de Crédito/Débito na entrega ou combinar retirada física.</p>
              </div>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center text-gray-700">
            <span className="font-bold">Total do seu carrinho:</span>
            <span className="text-xl font-black text-[#BA68C8]">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
      </div>
      <Rodape />
    </main>
  );
}
