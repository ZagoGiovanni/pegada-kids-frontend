"use client";

import toast from "react-hot-toast";
import { useContext } from "react";
import { CarrinhoContext } from "../contexts/CarrinhoContext";
import { apiFetch } from "../lib/api";

export function BotaoComprar({ produtoId, nomeProduto, precoProduto }: { produtoId: number, nomeProduto: string, precoProduto: number }) {
  const { adicionarProduto, modoChaAtivo } = useContext(CarrinhoContext);

  const handleClick = async () => {
    if (modoChaAtivo) {
      try {
        const idReal = localStorage.getItem("minhaListaId");
        if (!idReal) {
          toast.error("Crie ou selecione sua lista antes de adicionar produtos.");
          return;
        }
        
        const resposta = await apiFetch(`/listas/${idReal}/produtos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            produtoId: produtoId
          }),
        }, "cliente");

        const dados = await resposta.json().catch(() => ({}));

        if (resposta.ok) {
          toast.success(`"${nomeProduto}" foi salvo na sua lista!`);
        } else {
          toast.error(dados.error || "Este produto já foi adicionado à lista.");
        }
      } catch (error) {
        console.error("Erro na conexão:", error);
        toast.error("Não conseguimos conectar com o servidor.");
      }
    } else {
      const item = { id: produtoId, nome: nomeProduto, preco: precoProduto, quantidade: 1 };
      adicionarProduto(item);
      toast.success(`"${nomeProduto}" adicionado ao Carrinho!`);
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shadow-sm transition-colors cursor-pointer ${
        modoChaAtivo 
        ? "bg-pink-100 text-pink-600 hover:bg-pink-200" 
        : "bg-green-100 text-green-700 hover:bg-green-200"
      }`}
      title={modoChaAtivo ? "Adicionar à Lista" : "Adicionar ao Carrinho"}
    >
      {modoChaAtivo ? "♡" : "+"}
    </button>
  );
}
