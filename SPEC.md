# BuyHelp Conecta — Especificação do Produto

> Versão: 1.0 | Data: 2026-03-30 | Autor: Gesse Machado

---

## 1. Visão Geral

**BuyHelp Conecta** é uma plataforma de treinamento corporativo para redes de varejo. Permite que administradores criem trilhas de aprendizado com vídeos, avaliações e certificados, e que colaboradores de múltiplas lojas consumam esse conteúdo com progresso rastreado.

### 1.1 Objetivos do Produto

- Centralizar o treinamento de colaboradores em múltiplas lojas
- Rastrear o progresso individual e por loja
- Garantir certificação após conclusão das trilhas
- Coletar NPS e feedback de satisfação dos colaboradores
- Oferecer dashboards analíticos para gestores

### 1.2 Personas

| Persona | Papel | Acesso |
|---------|-------|--------|
| **Admin** | Gestor de treinamentos / RH | Painel completo: CRUD de conteúdo, usuários, lojas, relatórios |
| **Colaborador** | Funcionário de loja | Consome trilhas, assiste vídeos, faz avaliações, recebe certificados |

---

## 2. Stack Tecnológica

### 2.1 Frontend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| React | 19.2.4 | Framework UI |
| TypeScript / JSX | ES2023 | Linguagem |
| Vite | 8.0.1 | Build tool |
| React Router DOM | 7.13.2 | Roteamento SPA |
| Tailwind CSS | 3.4.19 | Estilização (dark theme) |
| Lucide React | 1.7.0 | Ícones |
| Zod | 3.23.8 | Validação de formulários |
| Supabase JS | 2.100.1 | Cliente de banco de dados |

### 2.2 Backend

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Node.js + TypeScript | — | Runtime |
| Express | 4.19.2 | Framework HTTP |
| Helmet | 7.1.0 | Headers de segurança |
| JWT (jsonwebtoken) | 9.0.2 | Autenticação stateless |
| bcryptjs | 2.4.3 | Hash de senhas |
| Multer | 2.1.1 | Upload de arquivos em memória |
| Zod | 3.23.8 | Validação de entrada |
| tsup | — | Build (CommonJS output) |

### 2.3 Infraestrutura

| Componente | Solução |
|-----------|---------|
| Banco de dados | Supabase PostgreSQL |
| Storage | Supabase Buckets (`images`, `videos`) |
| Hospedagem frontend | Vercel (site estático) |
| Hospedagem API | Vercel Functions (serverless Node.js) |
| CI/CD | Vercel (deploy automático via Git) |

---

## 3. Arquitetura

```
┌────────────────────────────────────────────────────────┐
│                     VERCEL EDGE                        │
│  ┌─────────────────────┐   ┌──────────────────────┐   │
│  │  Frontend (React)   │   │   API (Express via   │   │
│  │  dist/ — SPA        │   │   Vercel Functions)  │   │
│  │  Rota: /*           │   │   Rota: /api/*       │   │
│  └────────┬────────────┘   └──────────┬───────────┘   │
└───────────┼──────────────────────────┼───────────────┘
            │  HTTP REST               │  Supabase SDK
            ▼                          ▼
     Browser do usuário          Supabase PostgreSQL
                                 + Supabase Storage
```

### 3.1 Fluxo de Requisição

1. Browser carrega SPA via Vercel CDN
2. Autenticação: `POST /api/auth/login` → JWT armazenado em localStorage
3. Todas as chamadas subsequentes enviam `Authorization: Bearer <token>`
4. Middleware valida JWT e injeta `req.user` com `{ id, role }`
5. Route handlers consultam Supabase via RPC ou queries diretas
6. Responses em JSON

### 3.2 Estrutura de Diretórios

```
buyhelp-conecta/
├── src/                     # Frontend React
│   ├── pages/
│   │   ├── admin/           # Dashboard, Usuarios, Videos, CreateTrail, CreateEvaluation
│   │   ├── Home.jsx         # Home do colaborador (lista de trilhas)
│   │   ├── Login.jsx
│   │   ├── TrailDetail.jsx
│   │   ├── VideoPlayer.jsx
│   │   ├── Evaluation.jsx
│   │   └── Certificate.jsx
│   ├── components/
│   │   ├── ui/              # Button, Input, Card, Badge, Avatar
│   │   ├── Layout/          # Header, Footer, AppLayout
│   │   ├── modals/          # SurveyModal
│   │   ├── admin/           # UserFeedbackModal
│   │   ├── VideoCard.jsx
│   │   └── VideoDrawer.jsx
│   ├── contexts/            # AuthContext
│   ├── lib/                 # api.js, supabase.js, utils.js
│   └── App.jsx
├── server/                  # Backend Express
│   └── src/
│       ├── index.ts         # Setup do servidor
│       ├── database.ts      # Cliente Supabase
│       ├── middleware/auth.ts
│       ├── routes/          # 12 grupos de rotas
│       └── db/              # SQL: funções, surveys, certificates, seed
├── api/
│   └── index.ts             # Wrapper para Vercel Functions
├── vercel.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 4. Design System

### 4.1 Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#FF6600` | CTA, destaques, ações principais |
| `primary-hover` | `#E55C00` | Hover em botões primários |
| `primary-muted` | `rgba(255,102,0,0.15)` | Backgrounds de badge, seleção |
| `bg-base` | `#0A0A0A` | Background root |
| `bg-surface` | `#111111` | Cards, modais |
| `bg-elevated` | `#181818` → `#1E1E1E` | Inputs, hover states |
| `text-primary` | `#FFFFFF` | Textos principais |
| `text-secondary` | `#A0A0A0` | Labels, descrições |
| `text-tertiary` | `#5A5A5A` | Placeholders, metadados |
| `border` | `rgba(255,255,255,0.08)` | Bordas sutis |
| `status-active` | `#22C55E` | Badge "ativo" |
| `status-inactive` | `#EF4444` | Badge "inativo" |

### 4.2 Tipografia

- **Família**: Inter (sans-serif)
- **Pesos**: 400 (body), 500 (labels), 600 (headings), 700 (títulos)

### 4.3 Componentes Base

- `Button` — variantes: primary, secondary, ghost, destructive
- `Input` — dark background com borda sutil, focus em laranja
- `Card` — bg-surface com border e rounded-card
- `Badge` — status, nível de dificuldade, categoria
- `Avatar` — iniciais do usuário em círculo colorido

---

## 5. Banco de Dados

### 5.1 Tabelas

#### `users`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
name         text NOT NULL
email        text UNIQUE NOT NULL
password_hash text NOT NULL
role         text NOT NULL CHECK (role IN ('admin', 'employee'))
is_active    boolean DEFAULT true
store_id     uuid REFERENCES stores(id)
created_at   timestamptz DEFAULT now()
```

#### `stores`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
name       text NOT NULL
city       text
state      text
created_at timestamptz DEFAULT now()
```

#### `trails`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
title        text NOT NULL
description  text
category     text
thumbnail    text  -- URL do Supabase Storage
target_roles text[]
order_index  integer DEFAULT 0
created_at   timestamptz DEFAULT now()
```

#### `videos`
```sql
id           uuid PRIMARY KEY DEFAULT gen_random_uuid()
trail_id     uuid REFERENCES trails(id) ON DELETE CASCADE
title        text NOT NULL
description  text
url          text NOT NULL  -- URL do Supabase Storage
duration_min numeric
level        text CHECK (level IN ('INICIANTE','INTERMEDIÁRIO','AVANÇADO'))
is_mandatory boolean DEFAULT false
order_index  integer DEFAULT 0
created_at   timestamptz DEFAULT now()
```

#### `evaluations`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
trail_id   uuid REFERENCES trails(id) ON DELETE CASCADE
title      text NOT NULL
pass_score integer NOT NULL  -- % mínimo para aprovação
created_at timestamptz DEFAULT now()
```

#### `questions`
```sql
id             uuid PRIMARY KEY DEFAULT gen_random_uuid()
evaluation_id  uuid REFERENCES evaluations(id) ON DELETE CASCADE
text           text NOT NULL
order_index    integer DEFAULT 0
```

#### `options`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
question_id uuid REFERENCES questions(id) ON DELETE CASCADE
text        text NOT NULL
is_correct  boolean DEFAULT false
```

#### `video_progress`
```sql
user_id      uuid REFERENCES users(id)
video_id     uuid REFERENCES videos(id)
completed_at timestamptz DEFAULT now()
PRIMARY KEY (user_id, video_id)
```

#### `evaluation_results`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id         uuid REFERENCES users(id)
evaluation_id   uuid REFERENCES evaluations(id)
score           integer NOT NULL   -- % de acertos
total_questions integer NOT NULL
passed          boolean NOT NULL
completed_at    timestamptz DEFAULT now()
```

#### `comments`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
video_id   uuid REFERENCES videos(id) ON DELETE CASCADE
user_id    uuid REFERENCES users(id)
content    text NOT NULL
created_at timestamptz DEFAULT now()
```

#### `trail_feedback`
```sql
id         uuid PRIMARY KEY DEFAULT gen_random_uuid()
trail_id   uuid REFERENCES trails(id) ON DELETE CASCADE
user_id    uuid REFERENCES users(id)
rating     integer CHECK (rating BETWEEN 1 AND 10)
comment    text
created_at timestamptz DEFAULT now()
UNIQUE (trail_id, user_id)
```

#### `certificates`
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id           uuid REFERENCES users(id)
trail_id          uuid REFERENCES trails(id)
verification_code text UNIQUE NOT NULL  -- formato: BH-YYYY-UUID-CERT
issued_at         timestamptz DEFAULT now()
UNIQUE (user_id, trail_id)
```

#### `user_surveys`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES users(id) UNIQUE
training_rating     integer CHECK (training_rating BETWEEN 1 AND 10)
training_comment    text
platform_rating     integer CHECK (platform_rating BETWEEN 1 AND 10)
platform_comment    text
nps_rating          integer CHECK (nps_rating BETWEEN 0 AND 10)
nps_comment         text
created_at          timestamptz DEFAULT now()
```

### 5.2 Funções RPC PostgreSQL

| Função | Retorna | Uso |
|--------|---------|-----|
| `auth_get_user(email)` | user record | Login |
| `users_list(search, store_id, is_active)` | users + stats | Admin: lista de usuários |
| `dashboard_stats()` | KPIs + ranking | Admin: dashboard |
| `trails_list()` | trails + counts | Lista de trilhas |
| `trail_detail(trail_id)` | trail + videos + evals | Detalhe da trilha |
| `videos_list(trail_id?, user_id)` | videos + completion | Lista de vídeos |
| `video_detail(video_id, user_id)` | video + trail meta | Player de vídeo |
| `user_progress(user_id)` | progress % + last video | Home do colaborador |
| `evaluation_detail(eval_id, role)` | questions + options | Avaliação (role-aware) |
| `stores_with_count()` | stores + user count | Admin: lojas |

---

## 6. API REST

### 6.1 Autenticação

Todas as rotas (exceto `/api/auth/login` e `/api/health`) exigem:
```
Authorization: Bearer <jwt_token>
```

Rotas marcadas como **[Admin]** exigem `role === 'admin'` no JWT.

### 6.2 Endpoints

#### Auth
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/auth/login` | — | Login; retorna JWT + dados do usuário |
| `GET` | `/api/health` | — | Health check |

#### Usuários
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/users` | Admin | Lista usuários (filtro: search, store, is_active) |
| `GET` | `/api/users/:id` | Admin | Detalhes do usuário |
| `GET` | `/api/users/:id/feedback` | Admin | Feedbacks de trilha do usuário |
| `GET` | `/api/users/:id/survey` | Admin | Resposta da pesquisa NPS |
| `GET` | `/api/users/survey-stats` | Admin | Médias globais das pesquisas |
| `POST` | `/api/users` | Admin | Criar usuário |
| `PUT` | `/api/users/:id` | Admin | Atualizar usuário |

#### Lojas
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/stores` | Admin | Lista lojas com contagem de usuários |
| `POST` | `/api/stores` | Admin | Criar loja |
| `PUT` | `/api/stores/:id` | Admin | Atualizar loja |
| `DELETE` | `/api/stores/:id` | Admin | Excluir loja |

#### Trilhas
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/trails` | Auth | Lista todas as trilhas |
| `GET` | `/api/trails/:id` | Auth | Trilha com vídeos e avaliações |
| `POST` | `/api/trails` | Admin | Criar trilha |
| `PUT` | `/api/trails/:id` | Admin | Atualizar trilha |
| `DELETE` | `/api/trails/:id` | Admin | Excluir trilha (cascade) |
| `GET` | `/api/trails/:id/feedback` | Auth | Feedback da trilha |
| `POST` | `/api/trails/:id/feedback` | Auth | Enviar feedback (1 por usuário) |

#### Vídeos
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/videos` | Auth | Lista vídeos (filtro: trail_id) |
| `GET` | `/api/videos/:id` | Auth | Detalhe + status de conclusão |
| `POST` | `/api/videos` | Admin | Criar vídeo |
| `PUT` | `/api/videos/:id` | Admin | Atualizar vídeo |
| `DELETE` | `/api/videos/:id` | Admin | Excluir vídeo |

#### Avaliações
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/evaluations/:id` | Auth | Questões (respostas corretas ocultas para colaborador) |
| `POST` | `/api/evaluations` | Admin | Criar avaliação |
| `POST` | `/api/evaluations/:id/submit` | Auth | Submeter respostas e calcular nota |
| `GET` | `/api/evaluations/:id/results` | Admin | Resultados de todos os usuários |

#### Progresso
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/progress` | Auth | Progresso do usuário autenticado |
| `POST` | `/api/progress` | Auth | Marcar vídeo como concluído |
| `DELETE` | `/api/progress/:videoId` | Auth | Resetar progresso de um vídeo |

#### Comentários
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/comments` | Auth | Buscar comentários (por video_id ou trail_id) |
| `POST` | `/api/comments` | Auth | Postar comentário |
| `DELETE` | `/api/comments/:id` | Auth | Excluir próprio comentário |

#### Certificados
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/certificates/issue` | Auth | Emitir certificado (idempotente) |
| `GET` | `/api/certificates/trail/:trailId` | Auth | Buscar certificado da trilha |

#### Pesquisas (NPS)
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/surveys/check` | Header `x-user-id` | Verificar se pesquisa foi respondida |
| `POST` | `/api/surveys` | Header `x-user-id` | Submeter pesquisa (1 por usuário) |

#### Dashboard
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/dashboard` | Admin | KPIs + ranking de lojas |

#### Upload
| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/upload/image` | Admin | Upload de imagem (JPG/PNG/WebP/GIF, max 10 MB) |
| `POST` | `/api/upload/video` | Admin | Upload de vídeo (MP4/MOV/AVI/WebM/MKV, max 2 GB) |
| `DELETE` | `/api/upload/image/:filename` | Admin | Excluir imagem |
| `DELETE` | `/api/upload/video/:filename` | Admin | Excluir vídeo |

---

## 7. Funcionalidades por Módulo

### 7.1 Autenticação

**Requisitos:**
- Login via email + senha
- JWT com 8h de expiração
- Token armazenado em localStorage (`bhc_token`, `bhc_user`)
- Auto-logout em 401 (token expirado/inválido)
- Usuários inativos recebem 403 ao tentar fazer login

**Fluxo:**
```
1. POST /api/auth/login { email, password }
2. Backend: busca usuário via RPC auth_get_user(email)
3. Backend: valida hash bcrypt
4. Backend: verifica is_active
5. Backend: retorna JWT + { id, name, role, store_id }
6. Frontend: armazena em localStorage
7. Frontend: redireciona (admin → /admin, employee → /)
```

---

### 7.2 Trilhas de Aprendizado

**Requisitos:**
- Trilhas organizam vídeos e avaliações em sequência
- Cada trilha tem: título, descrição, categoria, thumbnail, índice de ordem
- Colaborador vê listagem com progresso % e última atividade
- Trilha detalha vídeos + avaliação associada
- Feedback de satisfação (1-10 + comentário) por trilha por usuário

---

### 7.3 Player de Vídeos

**Requisitos:**
- Vídeos com níveis: INICIANTE / INTERMEDIÁRIO / AVANÇADO
- Flag `is_mandatory`: vídeos obrigatórios bloqueiam avanço se não assistidos
- Progresso marcado ao concluir (POST /api/progress)
- Comentários por vídeo (ver, postar, excluir o próprio)
- Botão para resetar progresso de um vídeo

---

### 7.4 Avaliações

**Requisitos:**
- Questões de múltipla escolha com uma opção correta
- `pass_score`: percentual mínimo para aprovação (ex: 70)
- Colaboradores não veem qual opção é correta ao responder
- Admin vê gabarito completo
- Resultado: nota %, status aprovado/reprovado, data
- Admin vê todos os resultados com filtro por usuário/data

---

### 7.5 Certificados

**Requisitos:**
- Emitido ao aprovar avaliação da trilha
- Código único de verificação: `BH-{ANO}-{UUID_PARCIAL}-CERT`
- Endpoint idempotente: re-emissão retorna o mesmo certificado
- Exibição: nome do colaborador, trilha, data, código verificável
- 1 certificado por usuário por trilha

---

### 7.6 Pesquisa de Satisfação (NPS)

**Requisitos:**
- 3 dimensões: treinamento (1-10), plataforma (1-10), NPS (0-10)
- Campo de comentário opcional para cada dimensão
- 1 resposta por usuário (única)
- Admin: ver médias globais e respostas individuais
- Exibição no modal do usuário na tela de gestão

---

### 7.7 Dashboard Admin

**Métricas exibidas:**
- Total de lojas cadastradas
- Total de usuários ativos
- Total de vídeos disponíveis
- Progresso médio (%) de todos os colaboradores
- Ranking de lojas por score de progresso

---

### 7.8 Gestão de Usuários (Admin)

**Requisitos:**
- Listar com busca por nome/email, filtro por loja, filtro por status ativo/inativo
- Criar usuário (nome, email, senha, role, loja)
- Editar usuário (todos os campos, exceto senha via este endpoint)
- Ativar / desativar usuário
- Ver detalhes: feedbacks de trilhas, resposta da pesquisa NPS
- Ver cards de média de mídias assistidas

---

### 7.9 Upload de Arquivos

**Requisitos:**
- Imagens: JPG, PNG, WebP, GIF — máx 10 MB → bucket `images`
- Vídeos: MP4, MOV, AVI, WebM, MKV — máx 2 GB → bucket `videos`
- Processamento via Multer (memória) → Supabase Storage
- Retorna URL pública para uso nos formulários
- Exclusão de arquivo por filename

---

## 8. Roteamento Frontend

### 8.1 Rotas Públicas
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/login` | `Login.jsx` | Formulário de autenticação |

### 8.2 Rotas do Colaborador (autenticado)
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/` | `Home.jsx` | Lista de trilhas com progresso |
| `/trilha/:id` | `TrailDetail.jsx` | Detalhe da trilha: vídeos + avaliação |
| `/video/:id` | `VideoPlayer.jsx` | Player + comentários |
| `/avaliacao/:id` | `Evaluation.jsx` | Questionário com múltipla escolha |
| `/certificado/:id` | `Certificate.jsx` | Exibição do certificado emitido |

### 8.3 Rotas Admin (role = admin)
| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/admin` | `admin/Dashboard` | KPIs e ranking de lojas |
| `/admin/usuarios` | `admin/Users` | CRUD de usuários |
| `/admin/videos` | `admin/Videos` | Lista de trilhas e vídeos |
| `/admin/videos/criar-trilha` | `admin/CreateTrail` | Formulário de criação de trilha |
| `/admin/videos/editar-trilha/:id` | `admin/CreateTrail` | Edição de trilha existente |
| `/admin/videos/criar-avaliacao` | `admin/CreateEvaluation` | Formulário de criação de avaliação |

---

## 9. Segurança

### 9.1 Autenticação & Autorização
- JWT assinado com `JWT_SECRET` (variável de ambiente)
- Expiração: 8 horas
- Middleware `requireAuth`: valida assinatura + extrai payload
- Middleware `requireAdmin`: verifica `role === 'admin'`
- Senhas hasheadas com bcryptjs (salt rounds padrão)

### 9.2 Headers HTTP (via Helmet)
- Content Security Policy
- X-Content-Type-Options
- X-Frame-Options
- Strict-Transport-Security
- CORS configurável via `CORS_ORIGIN` env (padrão: `*`)

### 9.3 Validação de Entrada
- Todos os inputs validados com Zod (frontend e backend)
- Tamanhos máximos de upload impostos pelo Multer antes de enviar ao storage
- Role-based filtering: colaboradores não recebem gabarito de avaliações

---

## 10. Variáveis de Ambiente

### Frontend (`.env`)
```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_key>
```

### Backend (`server/.env`)
```env
PORT=3001
NODE_ENV=development
JWT_SECRET=<segredo_forte>
DATABASE_URL=<postgres_connection_string>
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
CORS_ORIGIN=https://buyhelp-conecta.vercel.app
```

---

## 11. Deploy

### 11.1 Configuração Vercel (`vercel.json`)
```json
{
  "builds": [
    { "src": "dist/**", "use": "@vercel/static" },
    { "src": "api/index.ts", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.ts" },
    { "src": "/(.*)", "dest": "/dist/index.html" }
  ]
}
```

### 11.2 Scripts
```json
// Frontend
"build": "vite build"
"dev": "vite"

// Backend
"dev": "tsx watch src/index.ts"
"build": "tsup src/index.ts --format cjs"
"start": "node dist/index.js"
"seed": "tsx src/db/seed.ts"
```

---

## 12. Fluxos de Usuário

### 12.1 Jornada do Colaborador
```
Login
  └─► Home (trilhas disponíveis + progresso %)
        └─► Trilha Detail (lista de vídeos + avaliação)
              ├─► Video Player (assistir + comentar)
              │     └─► Marcar como concluído
              └─► Avaliação (responder questões)
                    └─► Aprovado ─► Emitir Certificado
                                      └─► Dar Feedback da Trilha
                                            └─► Pesquisa NPS (1x por usuário)
```

### 12.2 Jornada do Admin
```
Login
  └─► Dashboard (KPIs + ranking de lojas)
        ├─► Usuários (CRUD + ver feedback + NPS)
        ├─► Lojas (CRUD + contagem de usuários)
        └─► Vídeos
              ├─► Criar/Editar Trilha (título, categoria, thumbnail)
              │     └─► Adicionar Vídeos (upload + metadados)
              └─► Criar Avaliação (questões + opções + gabarito)
```

---

## 13. Limitações & Decisões Técnicas

| Decisão | Motivação |
|---------|-----------|
| JWT em localStorage | Simplicidade de implementação; não há SSR |
| Supabase RPC para queries complexas | Evita N+1 queries e centraliza lógica no banco |
| Multer em memória + Supabase Storage | Vercel Functions não têm sistema de arquivos persistente |
| Sem refresh token | Expiração de 8h balanceia segurança e UX para uso diário |
| Pesquisa NPS via header `x-user-id` | Endpoint legado; ideal migrar para JWT |
| CORS `*` como fallback | Facilita desenvolvimento local; produção usa `CORS_ORIGIN` |
| CommonJS no backend | Compatibilidade com Vercel Functions (Node.js) |

---

## 14. Roadmap / Melhorias Futuras

- [ ] Refresh tokens para sessões mais longas
- [ ] Notificações in-app (novo conteúdo disponível)
- [ ] Relatórios exportáveis em PDF/Excel
- [ ] Suporte a SCORM para integração com LMS externos
- [ ] PWA com suporte offline para áreas com conectividade limitada
- [ ] Multi-tenant: separar dados por rede de franquia
- [ ] Migrar pesquisa NPS para autenticação JWT padrão
- [ ] Testes automatizados (unit + integration)
- [ ] Observabilidade com OpenTelemetry via `@vercel/otel`
