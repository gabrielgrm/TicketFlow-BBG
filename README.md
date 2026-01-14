# TicketFlow - Sistema de Gerenciamento de Tickets de Suporte

> **Desafio Técnico - Vaga Desenvolvedor JR**  
> Aplicação Full Stack para gerenciamento de Tickets de suporte técnico

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológica](#-stack-tecnológica)
- [Funcionalidades Implementadas](#-funcionalidades-implementadas)
- [Arquitetura do Projeto](#-arquitetura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Como Executar](#-como-executar)
- [Estrutura do Banco de Dados](#-estrutura-do-banco-de-dados)
- [Endpoints da API](#-endpoints-da-api)
- [Diferenciais Implementados](#-diferenciais-implementados)
- [Regras de Negócio](#-regras-de-negócio)

---

## 🎯 Visão Geral

O **TicketFlow** é uma aplicação completa para gerenciamento de tickets de suporte, permitindo que clientes abram chamados e técnicos gerenciem essas solicitações de forma eficiente. O sistema implementa controle de acesso baseado em roles, fluxo de status, priorização de tickets e auditoria completa de ações.

### Características Principais:
- ✅ **Separação de Repositórios**: Backend (API REST) e Frontend (Next.js) em pastas independentes
- ✅ **Banco de Dados em Nuvem**: PostgreSQL hospedado no Prisma Data Platform
- ✅ **Autenticação Segura**: JWT com refresh token e guards de autorização
- ✅ **Sistema de Roles**: CLIENT, TECH e SUPERVISOR com permissões específicas
- ✅ **Paginação Implementada**: Listagem eficiente de tickets com metadata
- ✅ **Dashboard Analytics**: Métricas e estatísticas em tempo real
- ✅ **Auditoria Completa**: Log de todas as ações realizadas no sistema

---

## 🚀 Stack Tecnológica

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **ORM**: Prisma 6.19.2
- **Banco de Dados**: PostgreSQL (Prisma Cloud - Hospedado)
- **Autenticação**: JWT (passport-jwt)
- **Validação**: class-validator + class-transformer
- **Hash de Senhas**: bcrypt

### Frontend
- **Framework**: Next.js 14.2 (App Router)
- **Linguagem**: TypeScript 5.3
- **Estilização**: Tailwind CSS 3.3
- **Componentes UI**: Radix UI (Dialog, Select, Label, Toast)
- **Ícones**: Lucide React
- **Gráficos**: Recharts 3.6

### Ferramentas de Desenvolvimento
- **Migrations**: Prisma Migrate
- **Linting**: ESLint
- **Package Manager**: npm

---

## ✨ Funcionalidades Implementadas

### 1. Gestão de Acesso
- [x] Registro de usuários (Clientes)
- [x] Login com JWT
- [x] Criação de usuários TECH/SUPERVISOR (apenas Supervisores)
- [x] Sistema de roles: CLIENT, TECH, SUPERVISOR
- [x] Guards de autenticação e autorização

### 2. Gestão de Tickets (CRUD Completo)
- [x] **Criar** ticket (Clientes e Técnicos)
- [x] **Listar** tickets com filtros e paginação
- [x] **Visualizar** detalhes do ticket
- [x] **Editar** ticket (status, prioridade, atribuição)
- [x] **Deletar** ticket (Técnicos e Supervisores)
- [x] Sistema de comentários em tickets

### 3. Fluxo de Status
- [x] OPEN (Aberto)
- [x] IN_PROGRESS (Em Progresso)
- [x] DONE (Concluído)
- [x] Validação: ticket concluído não pode ser editado

### 4. Priorização
- [x] LOW (Baixa)
- [x] MEDIUM (Média)
- [x] HIGH (Alta)
- [x] URGENT (Urgente)

### 5. Dashboard e Relatórios
- [x] Tickets abertos hoje
- [x] Tickets pendentes
- [x] Tickets resolvidos
- [x] Urgências pendentes
- [x] Taxa de resolução
- [x] Tempo médio de resposta
- [x] Gráficos de status e prioridade

### 6. Auditoria
- [x] Log de criação de tickets
- [x] Log de atualizações
- [x] Log de deleções
- [x] Listagem de logs com filtros

### 7. Perfil de Usuário
- [x] Visualizar dados do perfil
- [x] Editar perfil (nome, email)
- [x] Alterar senha

---

## 📁 Arquitetura do Projeto

O projeto está organizado em dois repositórios independentes dentro do monorepo:

```
TicketFlow-BBG/
│
├── backend/                          # API REST (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma            # Schema do banco de dados
│   │   └── migrations/              # Histórico de migrations
│   │
│   ├── src/
│   │   ├── auth/                    # Autenticação (JWT, Guards)
│   │   ├── users/                   # Gestão de usuários
│   │   ├── tickets/                 # CRUD de tickets
│   │   ├── comments/                # Sistema de comentários
│   │   ├── audit-log/               # Auditoria de ações
│   │   ├── dashboard/               # Métricas e estatísticas
│   │   ├── profile/                 # Perfil do usuário
│   │   ├── prisma/                  # Serviço do Prisma
│   │   ├── common/                  # Decorators, Filters, Guards
│   │   ├── app.module.ts            # Módulo raiz
│   │   └── main.ts                  # Entry point
│   │
│   ├── .env                         # Variáveis de ambiente
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                         # Interface Web (Next.js)
    ├── src/
    │   ├── app/                     # Pages (App Router)
    │   │   ├── page.tsx             # Home/Landing
    │   │   ├── login/               # Login
    │   │   ├── register/            # Registro
    │   │   ├── dashboard/           # Dashboard
    │   │   ├── tickets/             # Listagem e CRUD de tickets
    │   │   ├── users/               # Gestão de usuários
    │   │   ├── logs/                # Logs de auditoria
    │   │   └── profile/             # Perfil do usuário
    │   │
    │   ├── components/              # Componentes reutilizáveis
    │   │   ├── ui/                  # Componentes base (Radix UI)
    │   │   ├── sidebar.tsx          # Menu lateral
    │   │   ├── theme-toggle.tsx     # Alternador de tema
    │   │   └── profile-sidebar.tsx  # Sidebar do perfil
    │   │
    │   ├── lib/                     # Utilitários e API client
    │   │   ├── api.ts               # Cliente HTTP
    │   │   ├── auth.ts              # Funções de autenticação
    │   │   ├── tickets.ts           # API de tickets
    │   │   ├── users.ts             # API de usuários
    │   │   ├── dashboard.ts         # API de dashboard
    │   │   ├── logs.ts              # API de logs
    │   │   └── utils.ts             # Helpers
    │   │
    │   └── types/
    │       └── index.ts             # TypeScript types
    │
    ├── .env.local                   # Variáveis de ambiente
    ├── package.json
    ├── tailwind.config.ts
    └── tsconfig.json
```

### Arquitetura em Camadas (Backend)

O backend segue os princípios de Clean Architecture do NestJS:

1. **Controllers**: Recebem requisições HTTP e retornam respostas
2. **Services**: Contêm a lógica de negócio
3. **Repositories**: Acesso aos dados via Prisma ORM
4. **DTOs**: Data Transfer Objects para validação
5. **Guards**: Proteção de rotas (Auth, Roles)
6. **Filters**: Tratamento global de exceções

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js**: versão 18.x ou superior
- **npm**: versão 9.x ou superior
- **Git**: para clonar o repositório

> **Nota**: Não é necessário instalar PostgreSQL localmente, pois o banco de dados está hospedado na nuvem (Prisma Data Platform).

---

## 🔧 Instalação e Configuração

### 1. Clonar o Repositório

```bash
git clone https://github.com/gabrielgrm/TicketFlow-BBG.git
cd TicketFlow-BBG
```

### 2. Configurar o Backend

```bash
cd backend
npm install
npx prisma genarate
```

#### Configurar Variáveis de Ambiente

O projeto inclui um arquivo `.env.example` com as credenciais de teste já configuradas:

```env
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19VOEV5Nkk4N0dLanpsQk5jODU4V2YiLCJhcGlfa2V5IjoiMDFLRVdYSlZDSEdURDVOSlQ0MTBSNjQ1SlIiLCJ0ZW5hbnRfaWQiOiJmODM2M2Y0YTU2ZGVlMzZlNGYyODVlNjFjMmI2Mjk2ZDg5YWFmOTJjMWNkNTgyYTQyOTBkOWY5OGRhZGMwYzI2IiwiaW50ZXJuYWxfc2VjcmV0IjoiZDBhNWRmOGQtNGJhNS00NjUwLTliNjctNDdjNDRmZWRjNjM4In0.tgsYaLNzLJfXyeEMaQz4VvKTxCaLA9Otk3Dx5C9iGfI"
JWT_SECRET="0eabe18c55c11086"
JWT_EXPIRATION="24h"
```

Renomeie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

> **⚠️ Aviso Importante sobre Segurança**:  
> As credenciais incluídas no arquivo `.env.example` são de uma **conta de teste** e estão sendo compartilhadas apenas para fins de avaliação deste desafio técnico. **Estou ciente de que essa NÃO é uma prática recomendada em produção**

> **ℹ️ Banco de Dados**: O banco de dados está hospedado em nuvem (Prisma Data Platform) e já possui dados de teste pré-carregados. **Não é necessário executar scripts de seed ou migrations** - o banco está pronto para uso imediato!

### 3. Configurar o Frontend

```bash
cd ../frontend
npm install
```

#### Configurar Variáveis de Ambiente

O projeto inclui um arquivo `.env.example` com a configuração da API:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Renomeie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

---

## ▶️ Como Executar

### Executar Backend (API)

```bash
cd backend
npm run start:dev
```

A API estará disponível em: **http://localhost:3000**

### Executar Frontend

Em outro terminal:

```bash
cd frontend
npm run dev
```

A aplicação web estará disponível em: **http://localhost:3003**

### Acessar a Aplicação

1. Abra o navegador em `http://localhost:3003`
2. Registre uma nova conta ou utilize usuarios de teste (lâmpada no canto inferior direito da tela)
3. Explore as funcionalidades do sistema

---

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza um banco de dados PostgreSQL hospedado no **Prisma Data Platform**, garantindo alta disponibilidade e performance.

### Modelos Principais

#### User (Usuários)
```prisma
model User {
  id              String     @id @default(cuid())
  email           String     @unique
  passwordHash    String
  name            String
  role            UserRole   @default(CLIENT)
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt
}

enum UserRole {
  CLIENT      // Clientes que abrem tickets
  TECH        // Técnicos que resolvem tickets
  SUPERVISOR  // Supervisores com acesso total
}
```

#### Ticket (Chamados)
```prisma
model Ticket {
  id           String          @id @default(cuid())
  title        String
  description  String
  status       TicketStatus    @default(OPEN)
  priority     TicketPriority?
  createdById  String
  assignedToId String?
  resolvedAt   DateTime?
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt
}

enum TicketStatus {
  OPEN         // Ticket aberto
  IN_PROGRESS  // Em atendimento
  DONE         // Concluído
}

enum TicketPriority {
  LOW          // Baixa prioridade
  MEDIUM       // Média prioridade
  HIGH         // Alta prioridade
  URGENT       // Urgente
}
```

#### Comment (Comentários)
```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String
  ticketId  String
  userId    String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### AuditLog (Auditoria)
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  action     String
  entityType String
  entityId   String
  changes    Json?
  userId     String
  metadata   Json?
  createdAt  DateTime @default(now())
}
```

### Relacionamentos

- Um **User** pode criar múltiplos **Tickets** (createdBy)
- Um **User** pode ser atribuído a múltiplos **Tickets** (assignedTo)
- Um **Ticket** pode ter múltiplos **Comments**
- Cada **Comment** pertence a um **User** e a um **Ticket**
- Cada **AuditLog** registra ações de um **User**

---

## 🔌 Endpoints da API

### Base URL
```
http://localhost:3000
```

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|------|
| POST | `/auth/register` | Registrar novo usuário (CLIENT) |
| POST | `/auth/login` | Login e obtenção do JWT |

**Exemplo de Registro:**
```json
POST /auth/register
{
  "email": "cliente@example.com",
  "password": "senha123",
  "name": "João Silva"
}
```

**Exemplo de Login:**
```json
POST /auth/login
{
  "email": "admin@ticketflow.com",
  "password": "admin123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@ticketflow.com",
    "name": "Admin",
    "role": "SUPERVISOR"
  }
}
```

### Tickets

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|------|-------|
| GET | `/tickets` | Listar tickets (paginado) | ✅ | Todos |
| GET | `/tickets/:id` | Buscar ticket por ID | ✅ | Todos |
| POST | `/tickets` | Criar novo ticket | ✅ | Todos |
| PATCH | `/tickets/:id` | Atualizar ticket | ✅ | TECH, SUPERVISOR |
| DELETE | `/tickets/:id` | Deletar ticket | ✅ | TECH, SUPERVISOR |
| POST | `/tickets/:id/comments` | Adicionar comentário | ✅ | Todos |

**Exemplo de Listagem com Paginação:**
```
GET /tickets?page=1&limit=10&status=OPEN&priority=HIGH
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": "...",
      "title": "Problema no sistema",
      "description": "Descrição detalhada",
      "status": "OPEN",
      "priority": "HIGH",
      "createdBy": {
        "id": "...",
        "name": "João Silva",
        "email": "joao@example.com"
      },
      "assignedTo": null,
      "createdAt": "2026-01-13T10:30:00Z",
      "comments": []
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

**Exemplo de Criação:**
```json
POST /tickets
Authorization: Bearer {token}
{
  "title": "Sistema fora do ar",
  "description": "O sistema apresentou erro 500 ao tentar fazer login",
  "priority": "URGENT"
}
```

**Exemplo de Atualização:**
```json
PATCH /tickets/:id
Authorization: Bearer {token}
{
  "status": "IN_PROGRESS",
  "assignedToId": "user-tech-id",
  "priority": "HIGH"
}
```

### Usuários

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|------|-------|
| GET | `/users/me` | Obter perfil do usuário logado | ✅ | Todos |
| GET | `/users/technicians` | Listar técnicos | ✅ | TECH |
| POST | `/users` | Criar usuário TECH/SUPERVISOR | ✅ | SUPERVISOR |

### Dashboard

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|------|-------|
| GET | `/dashboard/stats` | Estatísticas gerais | ✅ | TECH, SUPERVISOR |
| GET | `/dashboard/ticket-status-distribution` | Distribuição por status | ✅ | TECH, SUPERVISOR |
| GET | `/dashboard/priority-distribution` | Distribuição por prioridade | ✅ | TECH, SUPERVISOR |
| GET | `/dashboard/recent-activity` | Atividades recentes | ✅ | TECH, SUPERVISOR |
| GET | `/dashboard/top-clients` | Clientes com mais tickets | ✅ | TECH, SUPERVISOR |
| GET | `/dashboard/tech-workload` | Carga de trabalho dos técnicos | ✅ | TECH, SUPERVISOR |

### Perfil

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/profile` | Obter perfil completo | ✅ |
| PUT | `/profile` | Atualizar perfil | ✅ |
| PUT | `/profile/password` | Alterar senha | ✅ |

### Auditoria

| Método | Endpoint | Descrição | Auth | Roles |
|--------|----------|-----------|------|-------|
| GET | `/audit-log` | Listar logs de auditoria | ✅ | TECH, SUPERVISOR |

---

## 🌟 Diferenciais Implementados

### ✅ Obrigatórios Cumpridos

- [x] **API RESTful**: Implementada com NestJS seguindo boas práticas REST
- [x] **Banco Relacional**: PostgreSQL com migrations versionadas
- [x] **Frontend Funcional**: Next.js 14 com interface responsiva
- [x] **Regras de Negócio**: Validações completas e tratamento de exceções

### ⭐ Diferenciais Extras

#### 1. Frontend Bem Estruturado e Responsivo
- Design moderno com Tailwind CSS
- Componentes reutilizáveis (Radix UI)
- Tema claro/escuro
- Interface adaptativa para mobile e desktop
- Feedback visual (toasts, loading states)

#### 2. Listagem Paginada
- **Backend**: Endpoint com suporte a `?page=1&limit=10`
- **Frontend**: Componente de paginação com navegação entre páginas
- **Performance**: Retorno otimizado com metadata (total, totalPages)

#### 3. Versionamento de Banco (Migrations)
- **Prisma Migrate**: Todas as alterações versionadas

#### 4. Arquitetura em Camadas
- **Controllers**: Rotas e validação
- **Services**: Lógica de negócio isolada
- **Repositories**: Acesso a dados via Prisma
- **DTOs**: Validação com class-validator
- **Guards**: Autenticação e autorização
- **Filters**: Tratamento global de exceções

#### 5. Tratamento de Erros Profissional
- **HTTP Status Codes Semânticos**:
  - 200: Sucesso
  - 201: Criado
  - 204: Sem conteúdo
  - 400: Bad Request (validação)
  - 401: Não autenticado
  - 403: Não autorizado
  - 404: Não encontrado
  - 409: Conflito (email duplicado, etc.)
  - 500: Erro interno
- **Mensagens Descritivas**: Feedback claro ao usuário
- **Validação de Campos**: class-validator no backend
- **Global Exception Filter**: Tratamento centralizado

#### 6. Sistema de Auditoria
- Log de todas as ações CRUD
- Rastreabilidade completa
- Interface de visualização de logs

#### 7. Dashboard Analytics
- Estatísticas em tempo real
- Gráficos interativos (Recharts)
- Métricas de performance
- Distribuição de tickets por status e prioridade

#### 8. Sistema de Comentários
- Comunicação entre cliente e técnico
- Histórico completo no ticket
- Timestamps e autor registrados

#### 9. Segurança
- Hash de senhas com bcrypt
- JWT com expiração configurável
- Guards de autenticação e autorização
- Validação de roles em nível de rota
- CORS configurado

---

## 📜 Regras de Negócio

### Controle de Acesso

#### CLIENT (Cliente)
- ✅ Pode criar tickets
- ✅ Pode visualizar apenas seus próprios tickets
- ✅ Pode adicionar comentários em seus tickets
- ❌ Não pode editar ou deletar tickets
- ❌ Não pode alterar status ou prioridade
- ❌ Não pode atribuir tickets a técnicos

#### TECH (Técnico)
- ✅ Pode visualizar todos os tickets
- ✅ Pode criar tickets
- ✅ Pode editar tickets (status, prioridade, atribuição)
- ✅ Pode deletar tickets
- ✅ Pode se auto-atribuir ou atribuir a outros técnicos
- ✅ Pode adicionar comentários
- ✅ Acesso ao dashboard
- ❌ Não pode criar outros usuários

#### SUPERVISOR
- ✅ Todas as permissões de TECH
- ✅ Pode criar usuários TECH e SUPERVISOR
- ✅ Acesso a página de logs

### Validações de Ticket

1. **Criação**:
   - Título e descrição são obrigatórios
   - Clientes criam tickets com status OPEN automaticamente
   - Técnicos podem definir status e prioridade na criação

2. **Edição**:
   - **Tickets DONE não podem ser editados** (regra de negócio obrigatória)
   - Apenas técnicos podem alterar status
   - Apenas técnicos podem definir prioridade
   - Apenas técnicos podem atribuir a outros usuários

3. **Deleção**:
   - Apenas técnicos e supervisores podem deletar
   - Deleção em cascade remove comentários relacionados

4. **Listagem**:
   - Clientes veem apenas seus próprios tickets
   - Técnicos e supervisores veem todos os tickets
   - Suporte a filtros: status, prioridade, técnico atribuído

### Validações de Usuário

1. **Registro**:
   - Email único (validação no backend)
   - Senha mínima de 6 caracteres
   - Registro público cria apenas usuários CLIENT

2. **Criação de TECH/SUPERVISOR**:
   - Apenas supervisores podem criar
   - Email não pode estar em uso

---

## 🧪 Testando a Aplicação

### Credenciais para Teste

**Senha (todas as contas abaixo):** `123456`

#### Supervisor
- Email: `supervisor@empresa.com`

#### Técnicos
- Email: `rafael.tech@empresa.com`
- Email: `juliana.tech@empresa.com`
- Email: `lucas.tech@empresa.com`

#### Clientes
- Email: `maria.silva@empresa.com`
- Email: `joao.santos@empresa.com`
- Email: `ana.oliveira@empresa.com`
- Email: `pedro.costa@empresa.com`
- Email: `carla.souza@empresa.com`
---

## 🐛 Troubleshooting

### Backend não inicia

**Erro: "Cannot find module"**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Frontend não conecta à API

**Verificar variáveis de ambiente:**

Certifique-se de que o arquivo `frontend/.env.local` está configurado corretamente:

```env
# Porta onde o backend está rodando (padrão: 3000)
# Se a porta 3000 estiver ocupada, o backend iniciará em outra porta
# Nesse caso, atualize a URL abaixo
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> **💡 Aviso**: Se a porta 3000 estiver ocupada, você pode:
> - Finalizar o processo que está usando a porta 3000
> - Ou deixar o backend iniciar em outra porta e atualizar a variável acima

**Verificar CORS:**
- O backend está configurado para aceitar requisições de `http://localhost:3003` (porta padrão do frontend)
- Se o frontend rodar em outra porta, edite [main.ts](backend/src/main.ts) no backend para adicionar a nova origem

### Erro de autenticação

**Token expirado:**
- Faça logout e login novamente
- Tokens JWT expiram em 24h por padrão

**CORS error:**
- Certifique-se de que o backend está rodando
- Verifique se a URL da API está correta no `.env.local`

---

## 📝 Notas Técnicas

### Decisões Arquiteturais

1. **Separação Backend/Frontend**: Facilita escalabilidade e deploy independente
2. **NestJS**: Framework robusto com injeção de dependências e arquitetura modular
3. **Prisma ORM**: Type-safe, migrations automáticas e excelente DX
4. **Next.js App Router**: SSR, otimizações automáticas e melhor SEO
5. **Banco em Nuvem**: Reduz complexidade de setup local
6. **JWT**: Autenticação stateless e escalável
7. **Radix UI**: Componentes acessíveis e personalizáveis

---
**Desenvolvido usando NestJS + Next.js + Prisma**
