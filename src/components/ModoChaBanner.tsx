"use client";

import Link from "next/link";
import { useContext } from "react";
import { CarrinhoContext } from "../contexts/CarrinhoContext";

export function ModoChaBanner() {
  const { modoChaAtivo, setModoChaAtivo } = useContext(CarrinhoContext);
  if (!modoChaAtivo) return null;

  return (
    <aside className="bg-pink-50 border-y border-pink-200 px-4 py-4" aria-live="polite">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <p className="font-black text-pink-700">🎁 Você está montando sua lista de Chá de Bebê</p>
          <p className="text-sm text-pink-600">Abra uma roupa, escolha o tamanho e adicione à lista.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/chadebebe/painel" className="bg-pink-500 text-white px-4 py-2 rounded-xl font-bold">
            Ver minha lista
          </Link>
          <button
            type="button"
            onClick={() => setModoChaAtivo(false)}
            className="border border-pink-300 text-pink-700 px-4 py-2 rounded-xl font-bold bg-white"
          >
            Sair do modo lista
          </button>
        </div>
      </div>
    </aside>
  );
}
