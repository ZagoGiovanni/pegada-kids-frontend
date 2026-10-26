import Link from "next/link";

export default function ListaSemCodigoPage() {
  return (
    <main className="min-h-screen bg-blue-50 flex items-center justify-center p-6 text-gray-900">
      <div className="bg-white max-w-lg w-full rounded-3xl p-10 text-center shadow-lg">
        <div className="text-6xl mb-4">🎁</div>
        <h1 className="text-2xl font-black mb-3">Abra uma lista pelo link exclusivo</h1>
        <p className="text-gray-500 mb-8">Cada chá de bebê possui um endereço próprio para evitar que você acesse a lista errada.</p>
        <Link href="/chadebebe/buscar" className="inline-block bg-blue-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-600">Encontrar uma Lista</Link>
      </div>
    </main>
  );
}
