# TicketFlow Frontend

Frontend completo em Next.js 14 (App Router) + Tailwind CSS + shadcn/ui para consumir a API de gerenciamento de tickets.

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes)
- **Radix UI** (componentes acessíveis)
- **Lucide React** (ícones)

## 📋 Funcionalidades

### Autenticação
- Login e registro de usuários
- JWT armazenado no localStorage
- Proteção de rotas (redirect para /login se não autenticado)

### Gestão de Tickets

#### Cliente (CLIENT)
- ✅ Criar novos tickets
- ✅ Ver apenas seus próprios tickets
- ✅ Adicionar comentários
- ❌ Não pode editar tickets com status DONE

#### Técnico (TECH)
- ✅ Ver todos os tickets
- ✅ Alterar status, prioridade e técnico responsável
- ✅ Adicionar comentários
- ❌ Não pode editar tickets com status DONE
- ✅ Excluir tickets

### Interface
- 📊 Tabela de tickets com paginação (10 por página)
- 🔍 Busca por texto
- 🎯 Filtros por status e prioridade
- 🏷️ Badges coloridos para status e prioridades
- 💬 Sistema de comentários
- 📱 Design responsivo
- ⚡ Loading states e empty states
- 🎨 Toast notifications

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/                     # App Router
│   │   ├── layout.tsx          # Layout raiz
│   │   ├── page.tsx            # Home (redirect para /tickets)
│   │   ├── login/
│   │   │   └── page.tsx        # Página de login
│   │   ├── register/
│   │   │   └── page.tsx        # Página de cadastro
│   │   └── tickets/
│   │       ├── page.tsx        # Listagem de tickets
│   │       ├── new/
│   │       │   └── page.tsx    # Criar novo ticket
│   │       └── [id]/
│   │           └── page.tsx    # Detalhes do ticket
│   ├── components/
│   │   └── ui/                 # Componentes shadcn/ui
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── textarea.tsx
│   │       ├── select.tsx
│   │       ├── badge.tsx
│   │       ├── card.tsx
│   │       ├── table.tsx
│   │       ├── dialog.tsx
│   │       ├── label.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       └── use-toast.ts
│   ├── lib/
│   │   ├── api.ts              # Fetch wrapper com auth
│   │   ├── auth.ts             # Serviços de autenticação
│   │   ├── tickets.ts          # Serviços de tickets
│   │   └── utils.ts            # Utilitários (cn)
│   └── types/
│       └── index.ts            # Tipos TypeScript
├── .env.example                # Variáveis de ambiente
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🔧 Instalação

1. **Clone o repositório e entre na pasta:**

```bash
cd frontend
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Configure as variáveis de ambiente:**

```bash
cp .env.example .env
```

Edite o arquivo `.env` e configure a URL da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚀 Executando o Projeto

### Modo Desenvolvimento

```bash
npm run dev
```

O aplicativo estará disponível em [http://localhost:3000](http://localhost:3000)

### Build de Produção

```bash
npm run build
npm start
```

## 📡 API

O frontend consome os seguintes endpoints da API:

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/register` - Registro
- `GET /users/me` - Dados do usuário autenticado

### Tickets
- `GET /tickets?page=1&limit=10&status=&priority=&search=` - Listar tickets
- `POST /tickets` - Criar ticket
- `GET /tickets/:id` - Obter ticket por ID
- `PATCH /tickets/:id` - Atualizar ticket
- `DELETE /tickets/:id` - Excluir ticket
- `POST /tickets/:id/comments` - Adicionar comentário

## 🎨 Componentes Principais

### Páginas

- **Login** (`/login`) - Autenticação de usuários
- **Registro** (`/register`) - Cadastro de novos usuários
- **Lista de Tickets** (`/tickets`) - Tabela com paginação e filtros
- **Novo Ticket** (`/tickets/new`) - Formulário de criação
- **Detalhes do Ticket** (`/tickets/[id]`) - Visualização e edição

### Componentes UI

Todos os componentes seguem o padrão shadcn/ui:
- Button, Input, Textarea, Label
- Select (dropdown)
- Badge (status e prioridade)
- Card (containers)
- Table (listagem)
- Dialog (confirmações)
- Toast (notificações)

## 🔐 Autenticação

O sistema usa JWT armazenado no `localStorage`:
- Token incluído automaticamente em requisições protegidas
- Redirect automático para `/login` se não autenticado
- Logout limpa o token e redireciona

## 🎯 Regras de Negócio

### Permissões por Role

**CLIENT:**
- Pode criar tickets
- Vê apenas seus próprios tickets
- Pode comentar em seus tickets
- Não pode editar se status = DONE

**TECH:**
- Vê todos os tickets
- Pode alterar status, prioridade e técnico
- Pode comentar em qualquer ticket
- Pode excluir tickets
- Não pode editar se status = DONE

## 🎨 Estilização

### Status
- 🔵 **OPEN** - Azul
- 🟡 **IN_PROGRESS** - Amarelo
- 🟢 **DONE** - Verde

### Prioridades
- ⚪ **LOW** - Cinza
- 🔵 **MEDIUM** - Azul
- 🟠 **HIGH** - Laranja
- 🔴 **URGENT** - Vermelho

## 📝 Lint

```bash
npm run lint
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Desenvolvido por

Sistema de gerenciamento de tickets - TicketFlow
