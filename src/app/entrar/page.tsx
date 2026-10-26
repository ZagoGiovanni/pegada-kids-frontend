"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Cabecalho } from "../../components/Cabecalho";
import { Rodape } from "../../components/Rodape";
import { apiFetch } from "../../lib/api";
import { validarCpf } from "../../lib/validacoes";

export default function EntrarCliente() {
  const router = useRouter();
  
  const [isLogin, setIsLogin] = useState(true);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cpf, setCpf] = useState("");

  const mascaraCPF = (valor: string) => {
    return valor
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .slice(0, 14);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin) {
      const cpfLimpo = cpf.replace(/\D/g, "");
      if (!validarCpf(cpfLimpo)) {
        toast.error("Por favor, digite um CPF válido.");
        return;
      }
    }

    const loadingToast = toast.loading(isLogin ? "Entrando..." : "Criando sua conta...");
    try {
      const resposta = await apiFetch(isLogin ? "/auth/clientes/login" : "/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          senha,
          cpf: cpf.replace(/\D/g, ""),
        }),
      });
      const dados = await resposta.json();
      toast.dismiss(loadingToast);
      if (!resposta.ok) {
        toast.error(dados.error || "Não foi possível acessar a conta.");
        return;
      }

      sessionStorage.setItem("pegada_kids_cliente", JSON.stringify(dados.cliente));
      sessionStorage.setItem("pegada_kids_cliente_token", dados.token);
      toast.success(isLogin ? "Login realizado com sucesso!" : "Conta criada com sucesso! 🎉");
      router.push("/");
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("Erro na requisição:", error);
      toast.error("Servidor indisponível. Verifique se o back-end está rodando.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Cabecalho />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          
          <div className="flex bg-gray-100">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${isLogin ? 'bg-white text-[#BA68C8] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Já tenho conta
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 text-sm font-bold transition-colors ${!isLogin ? 'bg-white text-[#BA68C8] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Criar conta nova
            </button>
          </div>

          <div className="p-8">
            <div className="text-center mb-8">
              <span className="text-5xl block mb-4">{isLogin ? "👋" : "✨"}</span>
              <h1 className="text-2xl font-black text-gray-800">
                {isLogin ? "Bem-vindo(a) de volta!" : "Junte-se à Pegada Kids"}
              </h1>
              <p className="text-sm text-gray-500 mt-2">
                {isLogin ? "Acesse sua conta para ver seus pedidos e finalizar compras." : "Crie sua conta para comprar com rapidez e segurança."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Nome Completo</label>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required={!isLogin} placeholder="Ex: Ana Maria Silva" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#BA68C8] focus:bg-white transition-all text-sm" />
                </div>
              )}

              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">CPF <span className="text-gray-400 font-normal lowercase">(Necessário para pagamentos)</span></label>
                  <input 
                    type="text" 
                    value={cpf} 
                    onChange={(e) => setCpf(mascaraCPF(e.target.value))} 
                    maxLength={14} 
                    required={!isLogin} 
                    placeholder="000.000.000-00" 
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#BA68C8] focus:bg-white transition-all text-sm" 
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">E-mail</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com.br" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#BA68C8] focus:bg-white transition-all text-sm" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase">Senha</label>
                <input type="password" minLength={8} value={senha} onChange={(e) => setSenha(e.target.value)} required placeholder="Mínimo de 8 caracteres" className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#BA68C8] focus:bg-white transition-all text-sm" />
              </div>

              {isLogin && (
                <div className="flex justify-end pt-1">
                  <Link href="/recuperar-senha" className="text-xs font-bold text-[#BA68C8] hover:underline">
                    Esqueci minha senha
                  </Link>
                </div>
              )}

              <button type="submit" className="w-full bg-[#BA68C8] text-white px-8 py-4 rounded-xl font-black hover:bg-purple-600 shadow-md transition-transform hover:scale-[1.02] mt-4">
                {isLogin ? "Entrar na Conta" : "Criar minha Conta"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Rodape />
    </main>
  );
}
