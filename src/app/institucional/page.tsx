import { Cabecalho } from "../../components/Cabecalho";
import { Rodape } from "../../components/Rodape";

export default function InstitucionalPage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Cabecalho />
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-black text-[#E85D75]">Conheça a Pegada Kids</h1>
          <p className="text-gray-600 mt-3">Informações importantes para comprar com tranquilidade.</p>
        </header>

        <section id="quem-somos" className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 scroll-mt-40">
          <h2 className="text-2xl font-black text-[#BA68C8] mb-3">Quem Somos</h2>
          <p className="text-gray-600 leading-relaxed">
            A Pegada Kids é uma loja de moda infantil de Paraguaçu Paulista, criada para aproximar famílias de roupas e acessórios infantis com atendimento acolhedor. A loja virtual reúne catálogo, estoque, pedidos e listas de Chá de Bebê em um só lugar.
          </p>
        </section>

        <section id="trocas" className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 scroll-mt-40">
          <h2 className="text-2xl font-black text-[#42AFC1] mb-3">Trocas e Devoluções</h2>
          <p className="text-gray-600 leading-relaxed">
            Caso precise trocar uma peça, entre em contato com a loja pelo WhatsApp informando o número do pedido e o motivo da solicitação. A equipe orientará sobre disponibilidade, condições da peça e forma de entrega ou retirada.
          </p>
        </section>

        <section id="privacidade" className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100 scroll-mt-40">
          <h2 className="text-2xl font-black text-[#E85D75] mb-3">Privacidade</h2>
          <p className="text-gray-600 leading-relaxed">
            Os dados de cadastro são utilizados para autenticação, pedidos, pagamento e entrega. O sistema não exibe CPF nem senha nas áreas públicas e utiliza links exclusivos para compartilhar listas de presentes.
          </p>
        </section>
      </div>
      <Rodape />
    </main>
  );
}
