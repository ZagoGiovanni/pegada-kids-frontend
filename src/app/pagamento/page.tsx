"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Cabecalho } from "../../components/Cabecalho";
import { Rodape } from "../../components/Rodape";
import toast from "react-hot-toast";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function PagamentoPage() {
  const router = useRouter();
  const tccDemoMode = process.env.NEXT_PUBLIC_TCC_DEMO_MODE === "true";
  const [pix, setPix] = useState("");
  const [pedidoId, setPedidoId] = useState("");
  const [carregandoSimulacao, setCarregandoSimulacao] = useState(false);

  useEffect(() => {
    const pixSalvo = sessionStorage.getItem("pegada_kids_pix");
    const pedidoSalvo = sessionStorage.getItem("pegada_kids_pedido_id");

    if (pixSalvo && pedidoSalvo) {
      const timer = window.setTimeout(() => {
        setPix(pixSalvo);
        setPedidoId(pedidoSalvo);
      }, 0);
      return () => window.clearTimeout(timer);
    } else {
      router.push("/");
    }
  }, [router]);

  const copiarPix = () => {
    navigator.clipboard.writeText(pix);
    toast.success("Código PIX copiado com sucesso! 🚀");
  };

  const simularPagamentoAprovado = async () => {
    setCarregandoSimulacao(true);
    const idToast = toast.loading("Simulando confirmação do banco...");

    try {
      const resposta = await apiFetch(`/pedidos/${pedidoId}/simular-pagamento`, {
        method: "POST"
      }, "cliente");

      const dados = await resposta.json();
      toast.dismiss(idToast);

      if (!resposta.ok) {
        toast.error(dados.error || "Erro na simulação.");
        return;
      }

      toast.success(dados.message || "Pagamento aprovado, estoque e lista atualizados! 🎉");
      setTimeout(() => {
        router.push("/minha-conta");
      }, 2000);

    } catch {
      toast.dismiss(idToast);
      toast.error("Erro ao conectar com o servidor local.");
    } finally {
      setCarregandoSimulacao(false);
    }
  };

  if (!pix) {
    return <div className="min-h-screen flex items-center justify-center text-[#BA68C8] font-bold">Carregando seu PIX...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Cabecalho />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white max-w-lg w-full rounded-3xl shadow-lg border border-gray-100 p-8 text-center">
          
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            ✅
          </div>
          
          <h1 className="text-2xl font-black text-gray-800 mb-2">Pedido #{pedidoId} Gerado!</h1>
          <p className="text-gray-500 mb-8">
            Agora é só realizar o pagamento via PIX para garantirmos suas peças.
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">PIX Copia e Cola</h2>
            
            <div className="bg-white border border-gray-300 rounded-xl p-4 mb-4 break-all text-xs text-gray-600 font-mono text-left h-24 overflow-y-auto">
              {pix}
            </div>

            <button 
              onClick={copiarPix}
              className="w-full bg-[#42D3E5] text-white font-black py-4 rounded-xl hover:bg-cyan-500 transition-transform hover:-translate-y-1 shadow-md flex items-center justify-center gap-2"
            >
              <span className="text-xl">📋</span> Copiar Código PIX
            </button>
          </div>

          <div className="text-sm text-gray-500 bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-8">
            O pagamento será aprovado em instantes. Assim que aprovado, começaremos a separar o seu pedido com muito carinho! 🧸
          </div>

          <div className="flex flex-col gap-4 items-center">
            <Link href="/minha-conta" className="text-[#BA68C8] font-bold hover:underline">
              Acompanhar meus pedidos
            </Link>

            {tccDemoMode && (
              <div className="mt-4 w-full rounded-2xl border border-violet-200 bg-violet-50 p-4 text-left">
                <p className="text-xs font-black uppercase tracking-wide text-violet-700">
                  Modo de demonstração
                </p>
                <p className="mt-1 text-xs leading-relaxed text-violet-600">
                  Confirma localmente o pagamento para demonstrar a baixa de estoque e a atualização do pedido.
                </p>
                <button
                  type="button"
                  onClick={simularPagamentoAprovado}
                  disabled={carregandoSimulacao}
                  className="mt-3 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {carregandoSimulacao ? "Confirmando..." : "Confirmar pagamento simulado"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Rodape />
    </main>
  );
}
