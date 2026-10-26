export type Produto = {
  id: number;
  nome: string;
  descricao?: string | null;
  preco: number | string;
  quantidadeEstoque: number;
  imagemUrl: string | null;
  categoria?: string | null;
  tamanhos?: string | null;
  estoquesPorTamanho?: Array<{
    tamanho: string;
    quantidade: number;
    ordem?: number;
  }>;
};

export type ClienteSessao = {
  id: number;
  nome: string;
  email: string;
  cpf?: string | null;
  telefone?: string | null;
  cep?: string | null;
  rua?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
};
