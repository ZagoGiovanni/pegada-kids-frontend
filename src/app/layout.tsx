import type { Metadata } from "next";
import "./globals.css";


import { CarrinhoProvider } from "../contexts/CarrinhoContext";

import { Toaster } from "react-hot-toast";


export const metadata: Metadata = {
  title: "Pegada Kids | Moda Infantil",
  description: "As melhores roupinhas e acessórios para os pequenos com muito estilo e conforto. Loja em Paraguaçu Paulista!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white text-gray-900">
        
        <Toaster position="top-right" reverseOrder={false} />
        
        <CarrinhoProvider>
          {children}
        </CarrinhoProvider>

      </body>
    </html>
  );
}
