"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { apiFetch } from "../../lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await apiFetch("/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "E-mail ou senha incorretos.");
        setSenha("");
        return;
      }
      sessionStorage.setItem("pegada_kids_admin_token", data.token);
      sessionStorage.setItem("pegada_kids_admin", JSON.stringify(data.usuario));
      toast.success("Bem-vindo ao painel de controle!");
      router.push("/admin/dashboard");
    } catch {
      toast.error("Não foi possível conectar ao servidor.");
      setSenha("");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 font-sans text-gray-900">
      
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-gray-500 font-bold hover:text-[#BA68C8] transition-colors flex items-center gap-2">
          <span>←</span> Voltar para a Loja
        </Link>
      </div>

      <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-20 h-20 bg-[#BA68C8] rounded-2xl flex items-center justify-center text-4xl shadow-lg mb-4 transform -rotate-3">
            🔐
          </div>
          <h1 className="text-2xl font-black text-gray-800">Acesso Restrito</h1>
          <p className="text-sm text-gray-500 mt-2">Área exclusiva para a gestão da Pegada Kids.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">E-mail Administrativo</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pegadakids.com.br" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#BA68C8] focus:bg-white transition-all"
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
            <input 
              type="password" 
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••" 
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:border-[#BA68C8] focus:bg-white transition-all"
              required 
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#BA68C8] text-white px-8 py-4 rounded-2xl font-black hover:bg-purple-600 shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-4"
          >
            Entrar no Sistema
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <Link
            href="/recuperar-senha?perfil=admin"
            className="text-xs font-bold text-[#BA68C8] hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </main>
  );
}
