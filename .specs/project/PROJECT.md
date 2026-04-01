# BuyHelp Conecta

**Vision:** Plataforma de treinamento corporativo para redes de varejo que permite criar trilhas de aprendizado com vídeos, avaliações e certificados, com rastreamento de progresso por colaborador e loja.
**For:** Administradores de RH/treinamento e colaboradores de lojas de varejo
**Solves:** Centralizar e rastrear o treinamento de colaboradores em múltiplas lojas, eliminando processos manuais e garantindo certificação formal.

## Goals

- Colaboradores concluem trilhas e recebem certificados verificáveis
- Admins visualizam progresso por loja e colaborador em tempo real
- NPS e feedback coletados após cada trilha concluída

## Tech Stack

**Core:**
- Framework UI: React 19.2.4 + Vite 8.0.1
- Language: JSX / TypeScript
- API: Express 4.19.2 (Vercel Functions)
- Database: Supabase PostgreSQL + Storage

**Key dependencies:** React Router DOM 7, Tailwind CSS 3, Lucide React, Zod, Supabase JS 2, JWT, bcryptjs

## Scope

**v1 includes:**
- Autenticação JWT (admin + colaborador)
- Trilhas de aprendizado com vídeos ordenados
- Player de vídeo com marcação de progresso e comentários
- Avaliações de múltipla escolha com nota e aprovação
- Emissão de certificados (código único BH-YYYY-UUID-CERT)
- Pesquisa de satisfação NPS (3 dimensões, 1x por usuário)
- Dashboard admin: KPIs + ranking de lojas
- CRUD de usuários, lojas, trilhas, vídeos, avaliações
- Upload de imagens (≤10 MB) e vídeos (≤2 GB) via Supabase Storage
- Deploy frontend (Vercel static) + API (Vercel Functions)

**Explicitly out of scope:**
- Refresh tokens / sessões longas
- Notificações in-app
- Exportação de relatórios PDF/Excel
- SCORM / integração LMS
- PWA offline
- Multi-tenant por franquia
- Testes automatizados

## Constraints

- Technical: Vercel Functions stateless — sem filesystem persistente; Multer em memória
- Technical: CommonJS no backend para compatibilidade Vercel
- Technical: JWT em localStorage (sem SSR)
