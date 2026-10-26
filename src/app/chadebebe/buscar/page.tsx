"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";

type ListaEncontrada = {
  id: number;
  nomeBebe: string;
  dataEvento: string;
  linkExclusivo: string;
  cliente: { nome: string };
};

export default function BuscarListaPage() {
  const [termoBusca, setTermoBusca] = useState("");
  const [listas, setListas] = useState<ListaEncontrada[]>([]);
  const [pesquisou, setPesquisou] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const handleBuscar = async (event: React.FormEvent) => {
    event.preventDefault();
    setCarregando(true);
    try {
      const response = await apiFetch(`/listas/buscar?q=${encodeURIComponent(termoBusca)}`);
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Não foi possível pesquisar as listas.");
        return;
      }
      setListas(data);
      setPesquisou(true);
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen bg-teal-50 flex items-center justify-center p-4 font-sans text-gray-900">
      <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-lg border border-teal-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm">🎁</div>
          <h1 className="text-2xl font-bold">Encontrar uma Lista</h1>
          <p className="text-gray-500 text-sm mt-1">Digite o nome do responsável, do bebê ou o código da lista.</p>
        </div>

        <form onSubmit={handleBuscar} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={termoBusca}
            onChange={(event) => setTermoBusca(event.target.value)}
            placeholder="Ex: Maria Silva, Enzo ou código da lista"
            className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-blue-400 text-center"
            required
          />
          <button disabled={carregando} className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-600 disabled:opacity-60">
            {carregando ? "Buscando..." : "Pesquisar"}
          </button>
        </form>

        {pesquisou && (
          <div className="mt-8 space-y-3">
            {listas.length === 0 ? (
              <p className="text-center text-gray-500 py-6">Nenhuma lista foi encontrada.</p>
            ) : listas.map((lista) => {
              const slug = lista.linkExclusivo.split("/").pop() || lista.linkExclusivo;
              return (
                <Link key={lista.id} href={`/chadebebe/lista/${encodeURIComponent(slug)}`} className="block border border-blue-100 rounded-2xl p-5 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <p className="font-black text-gray-800">Chá do(a) {lista.nomeBebe}</p>
                  <p className="text-sm text-gray-500">Responsável: {lista.cliente.nome}</p>
                  <p className="text-xs text-blue-500 mt-2 font-bold">Abrir lista de presentes →</p>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/chadebebe" className="text-gray-400 font-semibold hover:text-gray-600 text-sm">← Voltar</Link>
        </div>
      </div>
    </main>
  );
}
