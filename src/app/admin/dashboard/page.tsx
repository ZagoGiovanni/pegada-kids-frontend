"use client";

import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_URL, apiFetch } from "../../../lib/api";
import { AdminShell } from "../../../components/admin/AdminShell";
import { ImagemProduto } from "../../../components/ImagemProduto";

type Produto = {
  id: number;
  nome: string;
  descricao: string | null;
  preco: string | number;
  categoria: string | null;
  tamanhos: string | null;
  quantidadeEstoque: number;
  imagemUrl: string | null;
  estoquesPorTamanho?: Array<{
    tamanho: string;
    quantidade: number;
    ordem?: number;
  }>;
};

const categorias: Record<string, string> = {
  meninos: "Meninos",
  meninas: "Meninas",
  acessorios: "Acessórios",
  exclusivas: "Exclusivas",
};

const formatarPreco = (valor: string | number) =>
  Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const extrairTamanhos = (valor: string, usarPadrao = false) => {
  const tamanhos = valor
    .split(",")
    .map((tamanho) => tamanho.trim())
    .filter(Boolean);
  const unicos = tamanhos.filter(
    (tamanho, indice) =>
      tamanhos.findIndex(
        (candidato) =>
          candidato.toLocaleLowerCase("pt-BR") === tamanho.toLocaleLowerCase("pt-BR"),
      ) === indice,
  );
  return unicos.length > 0 ? unicos : usarPadrao ? ["Único"] : [];
};

const estoquesIniciais = (produto: Produto) => {
  const tamanhosDoProduto = extrairTamanhos(produto.tamanhos || "", true);
  if (produto.estoquesPorTamanho?.length) {
    return Object.fromEntries(
      tamanhosDoProduto.map((tamanho) => [
        tamanho,
        String(
          produto.estoquesPorTamanho?.find(
            (estoque) =>
              estoque.tamanho.toLocaleLowerCase("pt-BR") ===
              tamanho.toLocaleLowerCase("pt-BR"),
          )?.quantidade ?? 0,
        ),
      ]),
    );
  }

  const base = Math.floor((produto.quantidadeEstoque || 0) / tamanhosDoProduto.length);
  const restante = (produto.quantidadeEstoque || 0) % tamanhosDoProduto.length;
  return Object.fromEntries(
    tamanhosDoProduto.map((tamanho, indice) => [
      tamanho,
      String(base + (indice < restante ? 1 : 0)),
    ]),
  );
};

export default function DashboardAdmin() {
  const router = useRouter();
  const [autenticado, setAutenticado] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tamanhos, setTamanhos] = useState("");
  const [estoquePorTamanho, setEstoquePorTamanho] = useState<Record<string, string>>({});
  const [foto, setFoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [atualizarLista, setAtualizarLista] = useState(0);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroEstoque, setFiltroEstoque] = useState<"todos" | "baixo" | "zerado">("todos");

  useEffect(() => {
    const token = sessionStorage.getItem("pegada_kids_admin_token");
    if (!token) {
      toast.error("Acesso Negado! Faça login para acessar o estoque.");
      router.push("/admin");
    } else {
      const timer = window.setTimeout(() => setAutenticado(true), 0);
      return () => window.clearTimeout(timer);
    }
  }, [router]);

  useEffect(() => {
    let ativo = true;
    apiFetch('/produtos')
      .then((res) => {
        if (!res.ok) throw new Error("Não foi possível carregar o catálogo.");
        return res.json();
      })
      .then((data) => {
        if (ativo) setProdutos(data);
      })
      .catch((err) => {
        console.error("Erro ao buscar estoque", err);
        if (ativo) toast.error("Não foi possível carregar o estoque.");
      })
      .finally(() => {
        if (ativo) setCarregandoProdutos(false);
      });
    return () => {
      ativo = false;
    };
  }, [atualizarLista]);


  const handleSelecionarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const arquivo = e.target.files[0];
      if (!arquivo.type.startsWith("image/")) {
        toast.error("Selecione um arquivo de imagem.");
        e.target.value = "";
        return;
      }
      if (arquivo.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5 MB.");
        e.target.value = "";
        return;
      }
      if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setFoto(arquivo);
      setPreview(URL.createObjectURL(arquivo));
    }
  };

  const handleTamanhosChange = (valor: string) => {
    setTamanhos(valor);
    const tamanhosAtuais = extrairTamanhos(valor);
    setEstoquePorTamanho((estoqueAnterior) =>
      Object.fromEntries(
        tamanhosAtuais.map((tamanho) => {
          const chaveAnterior = Object.keys(estoqueAnterior).find(
            (chave) =>
              chave.toLocaleLowerCase("pt-BR") === tamanho.toLocaleLowerCase("pt-BR"),
          );
          return [tamanho, chaveAnterior ? estoqueAnterior[chaveAnterior] : "0"];
        }),
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (salvando) return;

    const tamanhosDoFormulario = extrairTamanhos(tamanhos, true);
    const estoques = tamanhosDoFormulario.map((tamanho, ordem) => ({
      tamanho,
      quantidade: Number(estoquePorTamanho[tamanho] || 0),
      ordem,
    }));
    if (estoques.some((estoque) => !Number.isInteger(estoque.quantidade) || estoque.quantidade < 0)) {
      toast.error("Informe uma quantidade inteira, igual ou maior que zero, para cada tamanho.");
      return;
    }
    const quantidadeTotal = estoques.reduce((total, estoque) => total + estoque.quantidade, 0);
    setSalvando(true);

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("preco", preco);
    formData.append("descricao", descricao);
    formData.append("quantidadeEstoque", String(quantidadeTotal));
    formData.append("estoquesPorTamanho", JSON.stringify(estoques));
    formData.append("categoria", categoria);
    formData.append("tamanhos", tamanhos);
    if (foto) {
      formData.append("foto", foto);
    }

    try {
      const url = editandoId 
        ? `/produtos/${editandoId}` 
        : "/produtos";
        
      const metodo = editandoId ? "PUT" : "POST";

      const resposta = await apiFetch(url, {
        method: metodo,
        body: formData,
      }, "admin");

      const data = await resposta.json().catch(() => ({}));
      if (resposta.ok) {
        toast.success(editandoId ? "Peça atualizada com sucesso!" : "Peça salva no banco de dados!");
        cancelarEdicao();
        setAtualizarLista(old => old + 1);
      } else {
        if (resposta.status === 401 || resposta.status === 403) {
          sessionStorage.removeItem("pegada_kids_admin_token");
          router.push("/admin");
        }
        toast.error(data.error || "Não foi possível salvar a peça.");
      }
    } catch (error) {
      console.error("Erro na conexão:", error);
      toast.error("Erro ao conectar com o servidor.");
    } finally {
      setSalvando(false);
    }
  };

  const iniciarEdicao = (produto: Produto) => {
    setEditandoId(produto.id);
    setNome(produto.nome);
    setDescricao(produto.descricao || "");
    setPreco(produto.preco.toString());
    setCategoria(produto.categoria || "");
    setTamanhos(produto.tamanhos || "");
    setEstoquePorTamanho(estoquesIniciais(produto));
    setFoto(null);
    setPreview(produto.imagemUrl ? `${API_URL}${produto.imagemUrl}` : "");
    document.getElementById("formulario-produto")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cancelarEdicao = () => {
    if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    setEditandoId(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setCategoria("");
    setTamanhos("");
    setEstoquePorTamanho({});
    setFoto(null);
    setPreview("");
  };

  const handleExcluir = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta roupinha do sistema?")) {
      try {
        const resposta = await apiFetch(`/produtos/${id}`, {
          method: "DELETE",
        }, "admin");
        const data = await resposta.json().catch(() => ({}));

        if (resposta.ok) {
          toast.success("Peça excluída com sucesso!");
          setAtualizarLista(old => old + 1);
        } else {
          toast.error(data.error || "Não foi possível excluir o produto.");
        }
      } catch {
        toast.error("Erro de conexão.");
      }
    }
  };

  const buscaNormalizada = busca.trim().toLocaleLowerCase("pt-BR");
  const produtosFiltrados = produtos.filter((produto) => {
    const correspondeBusca =
      !buscaNormalizada ||
      produto.nome.toLocaleLowerCase("pt-BR").includes(buscaNormalizada) ||
      (produto.categoria || "").toLocaleLowerCase("pt-BR").includes(buscaNormalizada) ||
      (produto.tamanhos || "").toLocaleLowerCase("pt-BR").includes(buscaNormalizada);
    const correspondeEstoque =
      filtroEstoque === "todos" ||
      (filtroEstoque === "baixo" &&
        (produto.estoquesPorTamanho?.length
          ? produto.estoquesPorTamanho.some(
              (estoque) => estoque.quantidade > 0 && estoque.quantidade <= 3,
            )
          : produto.quantidadeEstoque > 0 && produto.quantidadeEstoque <= 3)) ||
      (filtroEstoque === "zerado" && produto.quantidadeEstoque === 0);
    return correspondeBusca && correspondeEstoque;
  });
  const unidadesEmEstoque = produtos.reduce((total, produto) => total + produto.quantidadeEstoque, 0);
  const produtosComEstoqueBaixo = produtos.filter(
    (produto) =>
      produto.estoquesPorTamanho?.length
        ? produto.estoquesPorTamanho.some(
            (estoque) => estoque.quantidade > 0 && estoque.quantidade <= 3,
          )
        : produto.quantidadeEstoque > 0 && produto.quantidadeEstoque <= 3,
  ).length;
  const produtosSemEstoque = produtos.filter((produto) => produto.quantidadeEstoque === 0).length;
  const totalCategorias = new Set(produtos.map((produto) => produto.categoria).filter(Boolean)).size;
  const tamanhosDoFormulario = extrairTamanhos(tamanhos);
  const quantidadeTotalFormulario = tamanhosDoFormulario.reduce(
    (total, tamanho) => total + Number(estoquePorTamanho[tamanho] || 0),
    0,
  );


  if (!autenticado) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-[#00BFA6] font-bold text-xl animate-pulse">Verificando credenciais...</p>
      </div>
    );
  }

  return (
    <AdminShell areaAtiva="estoque">
      <main className="mx-auto max-w-[1600px] p-4 md:p-8 lg:p-10">
          <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#008f7d]">
                <span className="h-2 w-2 rounded-full bg-[#00BFA6]" />
                Catálogo e estoque
              </div>
              <h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">Gestão de produtos</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-500 md:text-base">
                Cadastre as peças, acompanhe as quantidades e mantenha a vitrine da Pegada Kids organizada.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                cancelarEdicao();
                document.getElementById("formulario-produto")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-gray-200 transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              <span className="text-lg text-[#00BFA6]">＋</span> Novo produto
            </button>
          </header>

          <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4" aria-label="Resumo do estoque">
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Produtos</p>
                  <p className="mt-1 text-2xl font-black text-gray-900">{produtos.length}</p>
                </div>
                <span className="rounded-xl bg-teal-50 p-2.5 text-xl">🏷️</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Itens diferentes no catálogo</p>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Unidades</p>
                  <p className="mt-1 text-2xl font-black text-gray-900">{unidadesEmEstoque}</p>
                </div>
                <span className="rounded-xl bg-blue-50 p-2.5 text-xl">📦</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Quantidade total disponível</p>
            </div>
            <button
              type="button"
              onClick={() => setFiltroEstoque("baixo")}
              className="rounded-2xl border border-amber-100 bg-white p-4 text-left shadow-sm transition hover:border-amber-300 md:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Estoque baixo</p>
                  <p className="mt-1 text-2xl font-black text-gray-900">{produtosComEstoqueBaixo}</p>
                </div>
                <span className="rounded-xl bg-amber-50 p-2.5 text-xl">⚠️</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Peças com 1 a 3 unidades</p>
            </button>
            <button
              type="button"
              onClick={() => setFiltroEstoque("zerado")}
              className="rounded-2xl border border-red-100 bg-white p-4 text-left shadow-sm transition hover:border-red-300 md:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-red-500">Sem estoque</p>
                  <p className="mt-1 text-2xl font-black text-gray-900">{produtosSemEstoque}</p>
                </div>
                <span className="rounded-xl bg-red-50 p-2.5 text-xl">🚫</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">Clique para localizar e repor</p>
            </button>
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(350px,0.8fr)_minmax(0,1.2fr)]">
            <section
              id="formulario-produto"
              className={`scroll-mt-6 overflow-hidden rounded-3xl border bg-white shadow-sm transition ${
                editandoId ? "border-[#00BFA6] ring-4 ring-teal-50" : "border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5 md:px-7">
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl text-xl ${editandoId ? "bg-blue-50" : "bg-teal-50"}`}>
                    {editandoId ? "✏️" : "＋"}
                  </span>
                  <div>
                    <h2 className="font-black text-gray-900">{editandoId ? "Editar produto" : "Cadastrar produto"}</h2>
                    <p className="text-xs text-gray-500">{editandoId ? `Alterando o item #${editandoId}` : "Preencha os dados da nova peça"}</p>
                  </div>
                </div>
                {editandoId && <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-black uppercase text-[#008f7d]">Em edição</span>}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 p-6 md:p-7">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Nome da peça</label>
                  <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Conjunto Infantil Festa Junina" className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm outline-none transition focus:border-[#00BFA6] focus:bg-white focus:ring-4 focus:ring-teal-50" required />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label className="text-sm font-bold text-gray-700">Descrição</label>
                    <span className="text-[11px] text-gray-400">{descricao.length} caracteres</span>
                  </div>
                  <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Conte os detalhes, material e ocasiões de uso." rows={3} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm leading-relaxed outline-none transition focus:border-[#00BFA6] focus:bg-white focus:ring-4 focus:ring-teal-50" required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Preço</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">R$</span>
                      <input type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} placeholder="89,90" className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-3 text-sm outline-none transition focus:border-[#00BFA6] focus:bg-white focus:ring-4 focus:ring-teal-50" required />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-700">Categoria</label>
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)} required className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm outline-none transition focus:border-[#00BFA6] focus:bg-white focus:ring-4 focus:ring-teal-50">
                      <option value="" disabled>Selecione...</option>
                      <option value="meninos">Mundo dos Meninos</option>
                      <option value="meninas">Mundo das Meninas</option>
                      <option value="acessorios">Acessórios & Calçados</option>
                      <option value="exclusivas">Coleção Exclusiva</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Tamanhos disponíveis</label>
                  <input type="text" value={tamanhos} onChange={(e) => handleTamanhosChange(e.target.value)} placeholder="P, M, G" className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm outline-none transition focus:border-[#00BFA6] focus:bg-white focus:ring-4 focus:ring-teal-50" />
                  <span className="mt-1.5 block text-[11px] text-gray-400">Separe por vírgulas. Depois informe o estoque de cada tamanho abaixo.</span>
                </div>

                <div className="rounded-2xl border border-teal-100 bg-teal-50/40 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-gray-800">Estoque por tamanho</h3>
                      <p className="mt-0.5 text-[11px] text-gray-500">O total é calculado automaticamente.</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-[#008f7d] shadow-sm">
                      Total: {quantidadeTotalFormulario}
                    </span>
                  </div>

                  {tamanhosDoFormulario.length === 0 ? (
                    <div className="mt-4 rounded-xl border border-dashed border-teal-200 bg-white/70 px-4 py-5 text-center text-xs font-medium text-gray-500">
                      Digite os tamanhos acima para preencher as quantidades.
                    </div>
                  ) : (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {tamanhosDoFormulario.map((tamanho) => (
                        <label key={tamanho} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                          <span className="mb-2 block text-xs font-black text-gray-600">Tamanho {tamanho}</span>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            inputMode="numeric"
                            value={estoquePorTamanho[tamanho] ?? "0"}
                            onChange={(event) =>
                              setEstoquePorTamanho((estoqueAtual) => ({
                                ...estoqueAtual,
                                [tamanho]: event.target.value,
                              }))
                            }
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-bold outline-none transition focus:border-[#00BFA6] focus:bg-white focus:ring-4 focus:ring-teal-50"
                            required
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-700">Foto do produto</label>
                  <label className="group flex cursor-pointer flex-col gap-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-3 transition hover:border-[#00BFA6] hover:bg-teal-50/40 sm:flex-row sm:items-center">
                    <input type="file" accept="image/*" className="hidden" onChange={handleSelecionarFoto} />
                    <span className="flex h-36 w-full flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white sm:w-28">
                      {preview ? <ImagemProduto src={preview} alt="Prévia da foto selecionada" className="h-full w-full object-cover" sizes="112px" /> : <span className="text-3xl">📸</span>}
                    </span>
                    <span className="px-2 pb-2 text-center sm:pb-0 sm:text-left">
                      <span className="block text-sm font-black text-gray-700">{preview ? "Trocar fotografia" : "Selecionar fotografia"}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-gray-500">Prefira uma imagem vertical, clara e com a peça inteira visível.</span>
                      <span className="mt-2 inline-block rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#008f7d] shadow-sm">Escolher arquivo</span>
                    </span>
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                  {editandoId && <button type="button" onClick={cancelarEdicao} className="rounded-xl bg-gray-100 px-5 py-3.5 text-sm font-bold text-gray-600 transition hover:bg-gray-200">Cancelar edição</button>}
                  <button type="submit" disabled={salvando} className="flex-1 rounded-xl bg-[#00BFA6] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-teal-100 transition hover:-translate-y-0.5 hover:bg-[#00ac96] disabled:cursor-wait disabled:opacity-60">
                    {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Cadastrar produto"}
                  </button>
                </div>
              </form>
            </section>

            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5 md:px-7">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-black text-gray-900">Produtos cadastrados</h2>
                    <p className="text-xs text-gray-500">{produtosFiltrados.length === produtos.length ? `${produtos.length} itens no catálogo` : `Mostrando ${produtosFiltrados.length} de ${produtos.length} itens`}</p>
                  </div>
                  <span className="mt-2 inline-flex w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-black text-gray-600 sm:mt-0">{totalCategorias} categorias</span>
                </div>

                <div className="mt-5 flex flex-col gap-3 lg:flex-row">
                  <label className="relative flex-1">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">⌕</span>
                    <span className="sr-only">Buscar produto</span>
                    <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por nome, categoria ou tamanho..." className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#00BFA6] focus:bg-white focus:ring-4 focus:ring-teal-50" />
                  </label>
                  <div className="flex gap-1 rounded-xl bg-gray-100 p-1 text-xs font-bold">
                    {(["todos", "baixo", "zerado"] as const).map((filtro) => (
                      <button key={filtro} type="button" onClick={() => setFiltroEstoque(filtro)} className={`rounded-lg px-3 py-2.5 transition ${filtroEstoque === filtro ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}>
                        {filtro === "todos" ? "Todos" : filtro === "baixo" ? "Baixo" : "Zerado"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-5">
                {carregandoProdutos ? (
                  <div className="space-y-3" aria-label="Carregando produtos">
                    {[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-100" />)}
                  </div>
                ) : produtosFiltrados.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-500">
                    <span className="mb-3 block text-4xl">🔎</span>
                    <p className="font-bold text-gray-700">Nenhum produto encontrado</p>
                    <p className="mt-1 text-xs">Tente outra busca ou limpe os filtros.</p>
                    {(busca || filtroEstoque !== "todos") && <button type="button" onClick={() => { setBusca(""); setFiltroEstoque("todos"); }} className="mt-4 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white">Limpar filtros</button>}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {produtosFiltrados.map((produto) => {
                      const semEstoque = produto.quantidadeEstoque === 0;
                      const estoqueBaixo = produto.estoquesPorTamanho?.length
                        ? produto.estoquesPorTamanho.some(
                            (estoque) => estoque.quantidade > 0 && estoque.quantidade <= 3,
                          )
                        : produto.quantidadeEstoque > 0 && produto.quantidadeEstoque <= 3;
                      return (
                        <article key={produto.id} className={`group rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${editandoId === produto.id ? "border-[#00BFA6] bg-teal-50/40" : "border-gray-100 bg-white hover:border-gray-200"}`}>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 flex-1 gap-4">
                              <div className="flex h-24 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                                {produto.imagemUrl ? <ImagemProduto src={`${API_URL}${produto.imagemUrl}`} alt={produto.nome} className="h-full w-full object-cover" sizes="80px" /> : <span className="text-2xl">📷</span>}
                              </div>
                              <div className="min-w-0 py-0.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-black text-gray-900">{produto.nome}</h3>
                                  <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-gray-500">{categorias[produto.categoria || ""] || produto.categoria || "Geral"}</span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{produto.descricao || "Produto sem descrição cadastrada."}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-bold">
                                  {(produto.estoquesPorTamanho?.length
                                    ? produto.estoquesPorTamanho
                                    : Object.entries(estoquesIniciais(produto)).map(([tamanho, quantidade]) => ({ tamanho, quantidade: Number(quantidade) }))
                                  ).map((estoque) => (
                                    <span key={estoque.tamanho} className={`rounded-lg px-2.5 py-1 ${estoque.quantidade === 0 ? "bg-red-50 text-red-600" : estoque.quantidade <= 3 ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                                      {estoque.tamanho}: {estoque.quantidade}
                                    </span>
                                  ))}
                                  <span className={`rounded-lg px-2.5 py-1 ${semEstoque ? "bg-red-50 text-red-600" : estoqueBaixo ? "bg-amber-50 text-amber-700" : "bg-teal-50 text-[#008f7d]"}`}>
                                    {semEstoque ? "Sem estoque" : estoqueBaixo ? `Total: ${produto.quantidadeEstoque} · há tamanho baixo` : `Total: ${produto.quantidadeEstoque}`}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
                              <span className="whitespace-nowrap text-lg font-black text-gray-900">{formatarPreco(produto.preco)}</span>
                              <div className="flex gap-2">
                                <button type="button" onClick={() => iniciarEdicao(produto)} className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-black text-blue-700 transition hover:bg-blue-600 hover:text-white" aria-label={`Editar ${produto.nome}`}>✏️ Editar</button>
                                <button type="button" onClick={() => handleExcluir(produto.id)} className="rounded-lg bg-red-50 px-3 py-2 text-xs font-black text-red-600 transition hover:bg-red-600 hover:text-white" aria-label={`Excluir ${produto.nome}`}>🗑️</button>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </div>
      </main>
    </AdminShell>
  );
}
