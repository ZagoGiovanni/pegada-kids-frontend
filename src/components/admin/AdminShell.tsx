"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import toast from "react-hot-toast";

type AreaAdmin = "estoque" | "listas" | "pedidos" | "clientes";

const itens = [
  { id: "estoque" as const, href: "/admin/dashboard", icone: "📦", curto: "Estoque", texto: "Controle de Estoque" },
  { id: "listas" as const, href: "/admin/chadebebe", icone: "🎁", curto: "Chá de Bebê", texto: "Chá de Bebê" },
  { id: "pedidos" as const, href: "/admin/pedidos", icone: "🛒", curto: "Pedidos", texto: "Pedidos Recebidos" },
  { id: "clientes" as const, href: "/admin/clientes", icone: "👥", curto: "Clientes", texto: "Clientes" },
];

export function AdminShell({ areaAtiva, children }: { areaAtiva: AreaAdmin; children: ReactNode }) {
  const router = useRouter();
  const [mostrarSaida, setMostrarSaida] = useState(false);

  const sair = () => {
    sessionStorage.removeItem("pegada_kids_admin_token");
    sessionStorage.removeItem("pegada_kids_admin");
    toast.success("Você saiu do sistema com segurança.");
    router.push("/admin");
  };

  return (
    <div className="flex min-h-screen bg-[#f6f8fb] font-sans text-gray-900">
      <aside className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col bg-gray-950 p-6 text-white md:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00BFA6] text-xl shadow-md">👶</div>
          <span className="text-lg font-bold tracking-wide">Painel Loja</span>
        </div>

        <nav className="flex-1 space-y-2">
          {itens.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                areaAtiva === item.id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              {item.icone} {item.texto}
            </Link>
          ))}
        </nav>

        <Link href="/" className="mb-3 mt-auto flex items-center justify-center gap-2 rounded-xl bg-gray-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-700">
          👁️ Ver Loja Pública
        </Link>
        <button type="button" onClick={() => setMostrarSaida(true)} className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white shadow-md transition hover:bg-red-700">
          🚪 Sair do Sistema
        </button>
      </aside>

      <div className="h-screen min-w-0 flex-1 overflow-y-auto">
        <nav className="sticky top-0 z-30 flex gap-2 overflow-x-auto border-b border-white/10 bg-gray-950 p-2 text-xs font-bold text-gray-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:hidden">
          {itens.map((item) => (
            <Link key={item.id} href={item.href} className={`whitespace-nowrap rounded-xl px-3 py-2.5 ${areaAtiva === item.id ? "bg-[#00BFA6] text-white" : "hover:bg-white/5"}`}>
              {item.icone} {item.curto}
            </Link>
          ))}
        </nav>
        {children}
      </div>

      {mostrarSaida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-red-100 bg-red-50 text-3xl">🚪</div>
            <h2 className="text-xl font-black text-gray-800">Sair do painel?</h2>
            <p className="mb-8 mt-2 text-sm leading-relaxed text-gray-500">Sua sessão administrativa será encerrada neste navegador.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setMostrarSaida(false)} className="flex-1 rounded-xl bg-gray-100 px-4 py-3 font-bold text-gray-600 hover:bg-gray-200">Cancelar</button>
              <button type="button" onClick={sair} className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-bold text-white shadow-md hover:bg-red-700">Sim, sair</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
