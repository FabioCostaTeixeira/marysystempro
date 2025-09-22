# Mary System Pro

## 🚀 Visão Geral

**Mary System Pro** é uma aplicação web moderna e robusta, desenhada para atuar como um sistema de gerenciamento completo. A plataforma é focada em administrar clientes, matrículas e transações financeiras, ideal para academias, estúdios, cursos e outros negócios baseados em serviços e assinaturas.

A arquitetura do projeto é construída sobre um stack de tecnologias de ponta, garantindo uma experiência de usuário fluida, alta performance e escalabilidade.

---

## 👤 Autor

- **Fabio Costa Teixeira**

---

## 🛠️ Stack de Tecnologias

O núcleo do projeto é composto por tecnologias modernas que garantem performance, manutenibilidade e uma excelente experiência de desenvolvimento.

- **Framework Frontend:** [**React 18**](https://react.dev/) com [**TypeScript**](https://www.typescriptlang.org/) para uma base de código robusta, tipada e escalável.
- **Build Tool:** [**Vite**](https://vitejs.dev/) para um ambiente de desenvolvimento ultra-rápido com Hot Module Replacement (HMR) e um processo de build otimizado.
- **Backend as a Service (BaaS):** [**Supabase**](https://supabase.com/) para gerenciar o banco de dados PostgreSQL, autenticação de usuários, e APIs em tempo real.
- **Estilização:** [**Tailwind CSS**](https://tailwindcss.com/) para uma abordagem utility-first que permite a criação de interfaces complexas e customizadas de forma eficiente.
- **Componentes de UI:** [**shadcn/ui**](https://ui.shadcn.com/) para uma coleção de componentes de UI reusáveis, acessíveis e estilizáveis, construídos sobre Radix UI.
- **Gerenciamento de Estado do Servidor:** [**TanStack Query (React Query)**](https://tanstack.com/query/latest) para fetching, caching, e sincronização de dados de forma declarativa e eficiente.
- **Gerenciamento de Formulários:** [**React Hook Form**](https://react-hook-form.com/) para gerenciamento de formulários performático e flexível.
- **Validação de Esquemas:** [**Zod**](https://zod.dev/) para validação de dados e esquemas, garantindo a integridade dos dados desde o frontend até o backend.
- **Roteamento:** [**React Router**](https://reactrouter.com/) para navegação e roteamento declarativo no lado do cliente.

---

## ✨ Funcionalidades Principais

- **Dashboard Central:** Visualização rápida de métricas importantes, como novos clientes, matrículas ativas e receita recente.
- **Gestão de Clientes:** CRUD completo para clientes, com perfis detalhados incluindo informações de contato, histórico de matrículas e status financeiro.
- **Gestão de Matrículas:** Criação e administração de matrículas, associando clientes a planos ou serviços específicos.
- **Controle Financeiro:** Registro e acompanhamento de pagamentos, com a capacidade de visualizar o histórico financeiro de cada cliente.
- **Relatórios:** Geração de relatórios para análise de dados e tomada de decisões estratégicas.
- **Interface Responsiva:** Design totalmente adaptável para uma experiência consistente em desktops, tablets e dispositivos móveis.

---

## 📂 Estrutura do Projeto

A estrutura de diretórios foi organizada para promover a modularidade e a escalabilidade do código.

```
/
├── public/              # Arquivos estáticos
├── src/
│   ├── assets/          # Imagens e outros assets
│   ├── components/      # Componentes React reutilizáveis (UI e de features)
│   │   ├── ui/          # Componentes base do shadcn/ui
│   │   └── ClientProfile/ # Componentes específicos do perfil do cliente
│   ├── hooks/           # Hooks customizados
│   ├── integrations/    # Módulos de integração com serviços externos (Supabase)
│   ├── lib/             # Funções utilitárias
│   ├── pages/           # Componentes de página (rotas principais)
│   └── types/           # Definições de tipos TypeScript
├── supabase/            # Configurações e migrações do Supabase
├── vite.config.ts       # Configuração do Vite
├── tailwind.config.ts   # Configuração do Tailwind CSS
└── package.json         # Dependências e scripts do projeto
```

---

## 🏁 Como Começar

Siga os passos abaixo para configurar e executar o projeto em seu ambiente local.

**Pré-requisitos:**
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [npm](https://www.npmjs.com/) (ou um gerenciador de pacotes compatível)

**Instalação e Execução:**

1.  **Clone o repositório:**
    ```sh
    git clone <URL_DO_SEU_REPOSITORIO>
    cd marysystempro-main
    ```

2.  **Instale as dependências:**
    ```sh
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Crie um arquivo `.env` na raiz do projeto.
    - Adicione suas chaves do Supabase (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) ao arquivo `.env`.

4.  **Execute o servidor de desenvolvimento:**
    ```sh
    npm run dev
    ```

A aplicação estará disponível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).