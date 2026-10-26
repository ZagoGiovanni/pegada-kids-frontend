"use client";

import { createContext, useEffect, useState, ReactNode, type Dispatch, type SetStateAction } from "react";

export type CarrinhoItem = {
  id: number;
  nome: string;
  preco: number;
  quantidade: number;
  tamanho?: string;
  quantidadeEstoque?: number;
  listaPresenteId?: number;
  isPresente?: boolean;
  imagemUrl?: string | null;
};

type CarrinhoContextValue = {
  carrinho: CarrinhoItem[];
  carrinhoCarregado: boolean;
  adicionarProduto: (produto: CarrinhoItem) => void;
  alterarQuantidade: (id: number, listaPresenteId: number | undefined, tamanho: string | undefined, delta: number) => void;
  removerProduto: (id: number, listaPresenteId?: number, tamanho?: string) => void;
  limparCarrinho: () => void;
  modoChaAtivo: boolean;
  setModoChaAtivo: Dispatch<SetStateAction<boolean>>;
};

export const CarrinhoContext = createContext<CarrinhoContextValue>({
  carrinho: [],
  carrinhoCarregado: false,
  adicionarProduto: () => undefined,
  alterarQuantidade: () => undefined,
  removerProduto: () => undefined,
  limparCarrinho: () => undefined,
  modoChaAtivo: false,
  setModoChaAtivo: () => undefined,
});

export function CarrinhoProvider({ children }: { children: ReactNode }) {
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [carrinhoCarregado, setCarrinhoCarregado] = useState(false);
  
  const [modoChaAtivo, setModoChaAtivo] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const carrinhoSalvo = sessionStorage.getItem("pegada_kids_carrinho");
        if (carrinhoSalvo) {
          const itens = JSON.parse(carrinhoSalvo);
          if (Array.isArray(itens)) setCarrinho(itens);
        }
      } catch {
        sessionStorage.removeItem("pegada_kids_carrinho");
      } finally {
        setCarrinhoCarregado(true);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const salvarCarrinho = (itens: CarrinhoItem[]) => {
    sessionStorage.setItem("pegada_kids_carrinho", JSON.stringify(itens));
  };

  const adicionarProduto = (produto: CarrinhoItem) => {
    const produtoExistente = carrinho.find(
      (item) =>
        item.id === produto.id &&
        item.listaPresenteId === produto.listaPresenteId &&
        item.tamanho === produto.tamanho,
    );
    if (produtoExistente && produto.listaPresenteId) return;
    const proximoCarrinho = produtoExistente
      ? carrinho.map((item) =>
          item.id === produto.id &&
          item.listaPresenteId === produto.listaPresenteId &&
          item.tamanho === produto.tamanho
            ? {
                ...item,
                quantidade: Math.min(
                  item.quantidade + 1,
                  item.quantidadeEstoque ?? Number.MAX_SAFE_INTEGER,
                ),
              }
            : item,
        )
      : [...carrinho, { ...produto, quantidade: 1 }];
    salvarCarrinho(proximoCarrinho);
    setCarrinho(proximoCarrinho);
  };

  const alterarQuantidade = (
    id: number,
    listaPresenteId: number | undefined,
    tamanho: string | undefined,
    delta: number,
  ) => {
    const proximoCarrinho = carrinho.map((item) => {
        const isSameItem =
          item.id === id &&
          item.listaPresenteId === listaPresenteId &&
          item.tamanho === tamanho;
        if (!isSameItem || item.listaPresenteId) return item;
        const maximum = item.quantidadeEstoque ?? Number.MAX_SAFE_INTEGER;
        return { ...item, quantidade: Math.max(1, Math.min(item.quantidade + delta, maximum)) };
      });
    salvarCarrinho(proximoCarrinho);
    setCarrinho(proximoCarrinho);
  };

  const removerProduto = (id: number, listaPresenteId?: number, tamanho?: string) => {
    const proximoCarrinho = carrinho.filter(
        (item) =>
          !(
            item.id === id &&
            item.listaPresenteId === listaPresenteId &&
            item.tamanho === tamanho
          ),
    );
    salvarCarrinho(proximoCarrinho);
    setCarrinho(proximoCarrinho);
  };

  const limparCarrinho = () => {
    sessionStorage.removeItem("pegada_kids_carrinho");
    setCarrinho([]);
  };

  return (
    <CarrinhoContext.Provider value={{ carrinho, carrinhoCarregado, adicionarProduto, alterarQuantidade, removerProduto, limparCarrinho, modoChaAtivo, setModoChaAtivo }}>
      {children}
    </CarrinhoContext.Provider>
  );
}
