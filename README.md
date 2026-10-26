# Pegada Kids - Front-end

Interface web da plataforma Pegada Kids, desenvolvida como Trabalho de Conclusão de Curso em Análise e Desenvolvimento de Sistemas.

A aplicação oferece uma vitrine virtual de roupas infantis, busca e categorias, carrinho de compras, checkout por WhatsApp ou Pix, área do cliente, listas de presentes de chá de bebê e painel administrativo.

## Tecnologias

- Next.js
- React
- TypeScript
- CSS responsivo

## Requisitos

- Node.js
- npm
- API Pegada Kids em execução

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env.local` e configure o endereço da API.

3. Execute em desenvolvimento:

   ```bash
   npm run dev
   ```

A aplicação ficará disponível em `http://localhost:3000`.

## Execução de produção local

```bash
npm run build
npm start
```

## Verificação

```bash
npm run lint
npm run build
```

## Projetos relacionados

Este front-end utiliza a API do projeto `pegada-kids-backend`.
