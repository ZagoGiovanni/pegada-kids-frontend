"use client";

import Link from "next/link";
import { useContext } from "react";
import { CarrinhoContext } from "../contexts/CarrinhoContext";
import { API_URL } from "../lib/api";
import type { Produto } from "../lib/types";
import { ImagemProduto } from "./ImagemProduto";

export function VitrineProdutoCard({
  produto,
  cor,
}: {
  produto: Produto;
  cor: "rosa" | "roxo";
}) {
  const { modoChaAtivo } = useContext(CarrinhoContext);
  const accent = cor === "rosa" ? "text-[#E85D75]" : "text-[#BA68C8]";
  const button = cor === "rosa" ? "bg-[#E85D75]" : "bg-[#BA68C8]";
  const semEstoque = produto.quantidadeEstoque <= 0;

  return (
    <article className="group text-center">
      <Link
        href={`/produto/${produto.id}`}
        className="block relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 aspect-[3/4] mb-4 shadow-sm group-hover:shadow-md transition-all"
        aria-label={`Ver detalhes de ${produto.nome}`}
      >
        {produto.imagemUrl ? (
          <ImagemProduto
            src={`${API_URL}${produto.imagemUrl}`}
            alt={produto.nome}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 260px"
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">📷</div>
        )}

        <div className="absolute bottom-3 left-3 right-3">
          <span className={`block w-full ${semEstoque ? "bg-gray-500" : button} text-white font-bold py-3 px-2 rounded-xl shadow-lg`}>
            {semEstoque
              ? "SEM ESTOQUE"
              : modoChaAtivo
                ? "🎁 ESCOLHER PARA A LISTA"
                : "VER PRODUTO"}
          </span>
        </div>
      </Link>

      <Link href={`/produto/${produto.id}`}>
        <h3 className="text-sm font-medium text-gray-700 hover:text-[#BA68C8] transition-colors min-h-10 line-clamp-2">
          {produto.nome}
        </h3>
      </Link>
      <div className="mt-2 flex flex-col items-center">
        <span className={`text-2xl font-black ${accent}`}>
          R$ {Number(produto.preco).toFixed(2).replace(".", ",")}
        </span>
        <span className="text-xs text-gray-500 font-medium">
          {semEstoque ? "Produto indisponível" : `${produto.quantidadeEstoque} em estoque`}
        </span>
      </div>
    </article>
  );
}
