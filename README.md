# Aplicação de Gestão de Encomendas de Natal

Uma aplicação web Next.js para gerir encomendas de Natal com integração Supabase.

## Funcionalidades

- **Ver Encomendas**: Navegue por todas as encomendas registadas com informações do cliente, detalhes de recolha e listas de produtos
- **Criar Encomendas**: Registe novas encomendas com:
  - Nome e número do cliente
  - Local de recolha (3 opções)
  - Hora de recolha (opcional)
  - Múltiplos produtos com quantidades e preços

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Supabase

1. Crie um projeto Supabase em [supabase.com](https://supabase.com)
2. Copie o URL do projeto e a chave anon do painel do Supabase
3. Crie um ficheiro `.env.local` no diretório raiz:

```env
NEXT_PUBLIC_SUPABASE_URL=seu_url_do_projeto_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_supabase
```

### 3. Configurar Esquema da Base de Dados

1. Abra o painel do seu projeto Supabase
2. Vá ao Editor SQL
3. Execute o script SQL de `supabase-schema.sql` para criar as tabelas necessárias:
   - `products` - Lista de produtos disponíveis
   - `orders` - Informações das encomendas
   - `order_products` - Produtos associados a cada encomenda

O esquema inclui produtos de exemplo que pode modificar ou remover conforme necessário.

### 4. Executar o Servidor de Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## Estrutura do Projeto

- `app/` - Páginas do Next.js app router
  - `page.tsx` - Página inicial
  - `orders/page.tsx` - Visualização da lista de encomendas
  - `orders/new/page.tsx` - Formulário de nova encomenda
- `components/` - Componentes React
  - `Navigation.tsx` - Menu de navegação principal
- `lib/` - Funções utilitárias
  - `supabase/` - Clientes Supabase
    - `server.ts` - Cliente para Server Components
    - `client.ts` - Cliente para Client Components
  - `orders.ts` - Operações de base de dados para Server Components
  - `orders-client.ts` - Operações de base de dados para Client Components
- `types/` - Definições de tipos TypeScript
  - `order.ts` - Tipos de encomenda e produto
- `supabase-schema.sql` - Script SQL do esquema da base de dados

## Tecnologias

- [Next.js](https://nextjs.org) - Framework React
- [Supabase](https://supabase.com) - Backend como serviço
- [TypeScript](https://www.typescriptlang.org) - Segurança de tipos
- [Tailwind CSS](https://tailwindcss.com) - Estilização
