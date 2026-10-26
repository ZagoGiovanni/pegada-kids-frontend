"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { opcoesTemaLista, type TemaLista } from "../../../lib/temaLista";

const agora = new Date();
const DATA_MINIMA_EVENTO = new Date(agora.getTime() - agora.getTimezoneOffset() * 60_000)
  .toISOString()
  .split("T")[0];

export default function CriarListaPage() {
  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [nomeBebe, setNomeBebe] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [tema, setTema] = useState<TemaLista>("NEUTRO");
  const router = useRouter();

  useEffect(() => {
    const token = sessionStorage.getItem("pegada_kids_cliente_token");
    const clientData = sessionStorage.getItem("pegada_kids_cliente");
    if (!token || !clientData) {
      toast.error("Entre na sua conta para criar uma lista.");
      router.push("/entrar");
      return;
    }
    const timer = window.setTimeout(() => setNomeResponsavel(JSON.parse(clientData).nome), 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  const handleCriarLista = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const resposta = await apiFetch('/listas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeBebe,
          dataEvento,
          tema,
        }),
      }, "cliente");

      if (resposta.ok) {
        const dadosSalvos = await resposta.json().catch(() => ({}));
        localStorage.setItem("minhaListaId", String(dadosSalvos.id));
        localStorage.setItem("minhaListaLink", dadosSalvos.linkExclusivo);
        toast.success(`Lista do(a) ${nomeBebe} criada com sucesso!`);
        router.push('/chadebebe/painel');
      } else {
        const data = await resposta.json().catch(() => ({}));
        toast.error(data.error || "Não foi possível criar a lista.");
      }
    } catch (error) {
      console.error("Erro na conexão com o servidor:", error);
        toast.error("Erro ao conectar com o back-end.");
    }
  };

  return (
    <main className="min-h-screen bg-teal-50 flex items-center justify-center p-4 font-sans text-gray-900">
      
      <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-lg border border-teal-100">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-sm">
            📝
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar Minha Lista</h1>
          <p className="text-gray-500 text-sm mt-1">Preencha os dados para gerar o link do seu Chá de Bebê.</p>
        </div>

        <form onSubmit={handleCriarLista} className="space-y-5">
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome da Mamãe (ou Responsável)</label>
            <input
              type="text"
              value={nomeResponsavel}
              disabled
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-pink-400 focus:bg-white transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Bebê</label>
            <input
              type="text"
              value={nomeBebe}
              onChange={(e) => setNomeBebe(e.target.value)}
              placeholder="Ex: Enzo ou Valentina"
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-pink-400 focus:bg-white transition-all text-sm"
              required
            />
          </div>

          <fieldset>
            <legend className="block text-sm font-semibold text-gray-700 mb-1.5">Tema da lista</legend>
            <p className="mb-3 text-xs text-gray-500">Escolha as cores que aparecerão para a família e os convidados.</p>
            <div className="grid grid-cols-3 gap-2">
              {opcoesTemaLista.map((opcao) => {
                const selecionado = tema === opcao.valor;
                return (
                  <button
                    key={opcao.valor}
                    type="button"
                    aria-pressed={selecionado}
                    onClick={() => setTema(opcao.valor)}
                    className={`rounded-2xl border-2 px-2 py-3 text-center transition ${opcao.cartao} ${selecionado ? opcao.selecionado : "opacity-75 hover:opacity-100"}`}
                  >
                    <span className="block text-2xl" aria-hidden="true">{opcao.emoji}</span>
                    <span className="mt-1 block text-xs font-black">{opcao.titulo}</span>
                    <span className="mt-0.5 block text-[10px] font-medium opacity-70">{opcao.descricao}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data do Evento</label>
            <input
              type="date"
              min={DATA_MINIMA_EVENTO}
              value={dataEvento}
              onChange={(e) => setDataEvento(e.target.value)}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-pink-400 focus:bg-white transition-all text-sm text-gray-600"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-pink-500 text-white py-4 rounded-2xl font-bold hover:bg-pink-600 shadow-md transition-all mt-4 cursor-pointer"
          >
            Gerar Link e Salvar
          </button>
          
        </form>

        <div className="text-center mt-6">
          <Link href="/chadebebe" className="text-gray-400 font-semibold hover:text-gray-600 text-sm">
            ← Voltar
          </Link>
        </div>

      </div>

    </main>
  );
}
