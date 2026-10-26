export type TemaLista = "MENINO" | "MENINA" | "NEUTRO";

export const opcoesTemaLista: Array<{
  valor: TemaLista;
  titulo: string;
  descricao: string;
  emoji: string;
  cartao: string;
  selecionado: string;
}> = [
  {
    valor: "MENINO",
    titulo: "Menino",
    descricao: "Tema azul",
    emoji: "👦",
    cartao: "border-sky-200 bg-sky-50 text-sky-800",
    selecionado: "ring-4 ring-sky-100 border-sky-500",
  },
  {
    valor: "MENINA",
    titulo: "Menina",
    descricao: "Tema rosa",
    emoji: "👧",
    cartao: "border-pink-200 bg-pink-50 text-pink-800",
    selecionado: "ring-4 ring-pink-100 border-pink-500",
  },
  {
    valor: "NEUTRO",
    titulo: "Neutro",
    descricao: "Tema verde",
    emoji: "🧸",
    cartao: "border-teal-200 bg-teal-50 text-teal-800",
    selecionado: "ring-4 ring-teal-100 border-teal-500",
  },
];

export function temaLista(tema?: string | null) {
  if (tema === "MENINO") {
    return {
      valor: "MENINO" as const,
      rotulo: "Menino",
      emoji: "👦",
      fundo: "bg-sky-50",
      cabecalho: "bg-sky-500",
      textoCabecalho: "text-sky-100",
      textoDestaque: "text-sky-600",
      borda: "border-sky-100",
      trilha: "bg-sky-100",
      progresso: "bg-sky-500",
      botao: "bg-sky-500 hover:bg-sky-600",
      botaoContorno: "border-sky-500 text-sky-600 hover:bg-sky-50",
    };
  }
  if (tema === "MENINA") {
    return {
      valor: "MENINA" as const,
      rotulo: "Menina",
      emoji: "👧",
      fundo: "bg-pink-50",
      cabecalho: "bg-pink-500",
      textoCabecalho: "text-pink-100",
      textoDestaque: "text-pink-600",
      borda: "border-pink-100",
      trilha: "bg-pink-100",
      progresso: "bg-pink-500",
      botao: "bg-pink-500 hover:bg-pink-600",
      botaoContorno: "border-pink-500 text-pink-600 hover:bg-pink-50",
    };
  }
  return {
    valor: "NEUTRO" as const,
    rotulo: "Neutro",
    emoji: "🧸",
    fundo: "bg-teal-50",
    cabecalho: "bg-teal-500",
    textoCabecalho: "text-teal-100",
    textoDestaque: "text-teal-700",
    borda: "border-teal-100",
    trilha: "bg-teal-100",
    progresso: "bg-teal-500",
    botao: "bg-teal-500 hover:bg-teal-600",
    botaoContorno: "border-teal-500 text-teal-700 hover:bg-teal-50",
  };
}
