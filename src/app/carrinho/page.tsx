"use client";

import { useContext, useEffect, useState } from "react";
import { CarrinhoContext } from "../../contexts/CarrinhoContext";
import { Cabecalho } from "../../components/Cabecalho";
import { Rodape } from "../../components/Rodape";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { API_URL } from "../../lib/api";
import type { ClienteSessao } from "../../lib/types";
import { ImagemProduto } from "../../components/ImagemProduto";

export default function CarrinhoPage() {
  const { carrinho, carrinhoCarregado, alterarQuantidade, removerProduto } = useContext(CarrinhoContext);
  const router = useRouter();
  const [clienteLogado, setClienteLogado] = useState<ClienteSessao | null>(null);
  const [cep, setCep] = useState("");
  const [consultandoCep, setConsultandoCep] = useState(false);
  const [enderecoEncontrado, setEnderecoEncontrado] = useState("");

  useEffect(() => {
    const dadosSalvos = sessionStorage.getItem("pegada_kids_cliente");
    if (dadosSalvos) {
      const timer = window.setTimeout(() => setClienteLogado(JSON.parse(dadosSalvos)), 0);
      return () => window.clearTimeout(timer);
    }
  }, []);

  const valorTotal = carrinho.reduce((acumulador, item) => {
    return acumulador + (item.preco * item.quantidade);
  }, 0);

  const finalizarCompra = () => {
    if (!clienteLogado) {
      toast.error("Faça login ou crie sua conta para finalizar a compra!");
      router.push("/entrar"); 
      return;
    }

    if (carrinho.length === 0) {
      toast.error("Seu carrinho está vazio!");
      return;
    }

    router.push("/checkout-opcoes");
  };

  const consultarCep = async () => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      toast.error("Informe um CEP com 8 dígitos.");
      return;
    }
    setConsultandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (!response.ok || data.erro) {
        toast.error("CEP não encontrado.");
        setEnderecoEncontrado("");
        return;
      }
      const resumo = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean).join(" • ");
      setEnderecoEncontrado(resumo);
      sessionStorage.setItem("pegada_kids_cep_consultado", JSON.stringify(data));
      toast.success("CEP encontrado! Você poderá completar o endereço no checkout.");
    } catch {
      toast.error("Não foi possível consultar o CEP agora.");
    } finally {
      setConsultandoCep(false);
    }
  };

  if (!carrinhoCarregado) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white font-sans text-gray-900">
        <div className="text-center">
          <span className="mb-3 block animate-bounce text-4xl">🛍️</span>
          <p className="font-bold text-[#BA68C8]">Carregando sua sacola...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900">
      <Cabecalho />

      <div className="max-w-6xl mx-auto p-4 mt-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-[#E85D75] mb-12">
          Carrinho
        </h1>

        {carrinho.length === 0 ? (
          <div className="bg-gray-50 rounded-3xl p-12 text-center shadow-sm border border-gray-100 flex flex-col items-center max-w-2xl mx-auto">
            <span className="text-6xl mb-4">💨</span>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Sua sacola está vazia</h2>
            <p className="text-gray-500 mb-8">Volte para a loja e escolha looks incríveis!</p>
            <Link href="/" className="bg-[#BA68C8] text-white px-8 py-3 rounded-full font-bold hover:bg-purple-600 transition-colors shadow-md">
              Continuar Comprando
            </Link>
          </div>
        ) : (
          <div className="w-full">

            <div className="hidden md:grid grid-cols-12 gap-4 border-b border-gray-200 pb-4 mb-6 text-sm text-gray-500 font-medium text-center">
              <div className="col-span-5 text-left pl-4">Produto</div>
              <div className="col-span-2">Quantidade</div>
              <div className="col-span-2">Valor unitário</div>
              <div className="col-span-2">Valor total</div>
              <div className="col-span-1"></div>
            </div>

            <div className="space-y-8 md:space-y-0">
              {carrinho.map((item) => (
                <div key={`${item.id}-${item.listaPresenteId || "loja"}-${item.tamanho || "unico"}`} className="relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-gray-100 pb-6 md:pb-4 md:mb-4">

                  <div className="col-span-5 flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-50 rounded-md overflow-hidden flex-shrink-0 border border-gray-200 flex items-center justify-center">
                      {item.imagemUrl ? (
                        <ImagemProduto src={`${API_URL}${item.imagemUrl}`} alt={item.nome} className="h-full w-full object-cover object-top" sizes="80px" />
                      ) : (
                        <span className="text-2xl text-gray-300">📷</span>
                      )}
                    </div>
                    <div className="pr-4">
                      <span className="font-medium text-gray-700 text-sm leading-tight block">{item.nome}</span>
                      <span className="text-xs text-gray-500">Tamanho: {item.tamanho || "Único"}</span>
                      {typeof item.quantidadeEstoque === "number" && !item.isPresente && (
                        <span className="mt-1 block text-[11px] font-semibold text-emerald-700">
                          {item.quantidadeEstoque} disponível(is) neste tamanho
                        </span>
                      )}
                      {item.isPresente && <span className="text-xs text-blue-600 font-bold block mt-1">🎁 Presente de Chá de Bebê</span>}
                    </div>
                  </div>

                  <div className="col-span-2 flex justify-center mt-4 md:mt-0">
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden h-10 w-24">
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.id, item.listaPresenteId, item.tamanho, -1)}
                        disabled={item.quantidade <= 1 || Boolean(item.listaPresenteId)}
                        aria-label={`Diminuir quantidade de ${item.nome}`}
                        className="w-1/3 h-full flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                      >-</button>
                      <div className="w-1/3 h-full flex items-center justify-center border-l border-r border-gray-300 text-sm font-semibold text-gray-800">
                        {item.quantidade}
                      </div>
                      <button
                        type="button"
                        onClick={() => alterarQuantidade(item.id, item.listaPresenteId, item.tamanho, 1)}
                        disabled={Boolean(item.listaPresenteId) || item.quantidade >= (item.quantidadeEstoque ?? Number.MAX_SAFE_INTEGER)}
                        aria-label={`Aumentar quantidade de ${item.nome}`}
                        className="w-1/3 h-full flex items-center justify-center bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30"
                      >+</button>
                    </div>
                  </div>

                  <div className="col-span-2 text-center text-gray-700 hidden md:block">
                    R$ {Number(item.preco).toFixed(2).replace('.', ',')}
                  </div>

                  <div className="col-span-2 text-center font-bold text-gray-900 mt-2 md:mt-0 text-lg md:text-base">
                    <span className="md:hidden text-sm text-gray-500 font-normal mr-2">Total:</span>
                    R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}
                  </div>

                  <div className="col-span-1 flex justify-center absolute right-4 md:static mt-2 md:mt-0">
                    <button
                      onClick={() => removerProduto(item.id, item.listaPresenteId, item.tamanho)}
                      className="flex flex-col items-center text-gray-400 hover:text-red-500 transition-colors"
                      title="Remover produto"
                    >
                      <span className="text-xl">🗑️</span>
                      <span className="text-[10px] uppercase font-semibold mt-1 hidden md:block">Excluir</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-col lg:flex-row justify-between gap-10">

              <div className="w-full lg:w-1/2 max-w-lg bg-gray-50 p-6 rounded-xl border border-gray-200 h-fit">
                <p className="text-sm text-gray-600 mb-4">Consulte seu CEP para confirmar a região de entrega. O valor da entrega será informado pela loja.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 font-semibold mb-1 block">Informe seu CEP:</label>
                    <input
                      type="text"
                      value={cep}
                      onChange={(event) => setCep(event.target.value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9))}
                      placeholder="00000-000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#42D3E5] focus:ring-1 focus:ring-[#42D3E5] transition-all"
                    />
                    {enderecoEncontrado && <p className="text-xs text-green-700 font-bold mt-2">📍 {enderecoEncontrado}</p>}
                  </div>
                  <div className="sm:mt-5">
                    <button type="button" onClick={consultarCep} disabled={consultandoCep} className="w-full sm:w-auto bg-[#42D3E5] text-white px-8 py-2 rounded-md text-sm font-bold hover:bg-cyan-500 transition-colors h-[38px] disabled:opacity-60">
                      {consultandoCep ? "Consultando..." : "Consultar"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-1/3 flex flex-col">
                <div className="flex justify-between items-center mb-4 text-gray-700">
                  <span className="font-medium text-lg">Subtotal:</span>
                  <span className="font-bold text-xl">R$ {valorTotal.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="flex justify-between items-center mb-8 text-gray-700 pb-6 border-b border-gray-200">
                  <span className="font-medium text-lg">Desconto:</span>
                  <span className="font-bold text-xl text-green-500">R$ 0,00</span>
                </div>

                <button
                  onClick={finalizarCompra}
                  className="w-full bg-[#BA68C8] text-white py-4 rounded-xl text-xl font-bold hover:bg-purple-600 shadow-lg transition-transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <span className="text-3xl">🔒</span>
                  Finalizar Compra
                </button>

                <div className="text-center mt-4">
                  <Link href="/" className="text-sm text-gray-500 font-bold hover:text-[#BA68C8] hover:underline">
                    Ou continuar comprando
                  </Link>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
      <Rodape />
    </main>
  );
}
