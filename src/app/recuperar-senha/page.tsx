"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

type Perfil = "CLIENTE" | "ADMIN";

function RecuperarSenhaConteudo() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [perfil, setPerfil] = useState<Perfil>(
    searchParams.get("perfil") === "admin" ? "ADMIN" : "CLIENTE",
  );
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const solicitarRecuperacao = async (event: React.FormEvent) => {
    event.preventDefault();
    setEnviando(true);
    setResetUrl("");
    try {
      const response = await apiFetch("/auth/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, perfil }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Não foi possível solicitar a recuperação.");
        return;
      }
      setResetUrl(data.resetUrl || "");
      toast.success("Solicitação registrada!");
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const redefinirSenha = async (event: React.FormEvent) => {
    event.preventDefault();
    if (novaSenha.length < 8) {
      toast.error("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (novaSenha !== confirmacao) {
      toast.error("As senhas digitadas não são iguais.");
      return;
    }

    setEnviando(true);
    try {
      const response = await apiFetch("/auth/redefinir-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Não foi possível redefinir a senha.");
        return;
      }
      setPerfil(data.perfil === "ADMIN" ? "ADMIN" : "CLIENTE");
      setConcluido(true);
      toast.success("Senha alterada com sucesso!");
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  };

  const loginUrl = perfil === "ADMIN" ? "/admin" : "/entrar";

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 px-4 py-10 text-gray-900">
      <div className="mx-auto w-full max-w-md">
        <Link href={loginUrl} className="mb-6 inline-flex text-sm font-bold text-gray-500 hover:text-[#BA68C8]">
          ← Voltar para o login
        </Link>

        <section className="rounded-3xl border border-purple-100 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <span className="mb-4 block text-5xl">🔑</span>
            <h1 className="text-2xl font-black text-gray-800">
              {concluido ? "Senha atualizada!" : token ? "Crie uma nova senha" : "Recupere sua senha"}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {concluido
                ? "Sua nova senha já está valendo."
                : token
                  ? "Use pelo menos 8 caracteres e escolha uma senha que você consiga lembrar."
                  : `Informe o e-mail da conta ${perfil === "ADMIN" ? "administrativa" : "de cliente"}.`}
            </p>
          </div>

          {concluido ? (
            <Link
              href={loginUrl}
              className="block w-full rounded-2xl bg-[#BA68C8] px-6 py-4 text-center font-black text-white shadow-md transition hover:bg-purple-600"
            >
              Entrar com a nova senha
            </Link>
          ) : token ? (
            <form onSubmit={redefinirSenha} className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-700">Nova senha</label>
                <input
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={novaSenha}
                  onChange={(event) => setNovaSenha(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-[#BA68C8] focus:bg-white"
                  placeholder="Mínimo de 8 caracteres"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-700">Confirme a nova senha</label>
                <input
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmacao}
                  onChange={(event) => setConfirmacao(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-[#BA68C8] focus:bg-white"
                  placeholder="Digite novamente"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-2xl bg-[#BA68C8] px-6 py-4 font-black text-white shadow-md transition hover:bg-purple-600 disabled:cursor-wait disabled:opacity-60"
              >
                {enviando ? "Alterando..." : "Salvar nova senha"}
              </button>
            </form>
          ) : (
            <form onSubmit={solicitarRecuperacao} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-700">E-mail cadastrado</label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition focus:border-[#BA68C8] focus:bg-white"
                  placeholder="seu@email.com.br"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-2xl bg-[#BA68C8] px-6 py-4 font-black text-white shadow-md transition hover:bg-purple-600 disabled:cursor-wait disabled:opacity-60"
              >
                {enviando ? "Gerando link..." : "Gerar link de recuperação"}
              </button>

              {resetUrl && (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                  <p className="font-bold">Link gerado para o ambiente local.</p>
                  <p className="mt-1 text-xs leading-relaxed text-green-700">Ele é válido por 30 minutos e só pode ser usado uma vez.</p>
                  <a
                    href={resetUrl}
                    className="mt-3 block rounded-xl bg-green-600 px-4 py-3 text-center font-black text-white hover:bg-green-700"
                  >
                    Criar minha nova senha
                  </a>
                </div>
              )}
            </form>
          )}

          {!token && !concluido && (
            <p className="mt-6 border-t border-gray-100 pt-5 text-center text-xs leading-relaxed text-gray-400">
              Por segurança, o sistema não informa se um e-mail está ou não cadastrado.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default function RecuperarSenha() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-gray-50" />}>
      <RecuperarSenhaConteudo />
    </Suspense>
  );
}
