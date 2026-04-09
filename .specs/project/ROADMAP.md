# Roadmap

**Milestone atual:** M1 — MVP Funcional
**Status:** Em andamento

---

## M1 — MVP Funcional

**Objetivo:** Colaborador consegue fazer login, assistir trilhas, ser avaliado e receber certificado. Admin consegue criar conteúdo e ver o desempenho da rede.

### Funcionalidades

**Autenticação** — COMPLETO
- Colaborador e admin fazem login com e-mail e senha
- Sistema redireciona cada role para sua área correta
- Sessão persiste entre visitas

**Home do Colaborador** — COMPLETO
- Colaborador vê o curso que estava fazendo e pode continuar com um clique
- Estatísticas pessoais: tempo assistido, cursos concluídos, cursos restantes
- Sugestões de cursos para fazer a seguir
- Gráfico com vídeos assistidos nos últimos 7 dias

**Catálogo de Cursos** — COMPLETO
- Lista de cursos disponíveis filtrados pelo perfil do colaborador
- Desbloqueio sequencial (curso N só abre após 100% no N-1)
- Detalhe do curso com lista de vídeos e acesso à avaliação

**Player de Vídeo** — COMPLETO
- Reprodução do vídeo com marcação de progresso
- Comentários por vídeo
- Navegação entre vídeos da trilha

**Avaliação** — COMPLETO
- Questões de múltipla escolha sem gabarito visível para o colaborador
- Resultado imediato com nota e status (aprovado/reprovado)

**Certificado** — COMPLETO
- Emissão após aprovação com código único de verificação
- Acesso ao certificado a qualquer momento

**Pesquisa de Satisfação (NPS)** — COMPLETO
- Modal de onboarding na primeira visita
- Dimensões: treinamento, plataforma, NPS

**Dashboard Admin** — COMPLETO
- KPIs: lojas, usuários ativos, vídeos, progresso médio
- Ranking de lojas por desempenho

**Gestão de Usuários** — COMPLETO
- CRUD de colaboradores com vínculo a lojas
- Ver feedback e NPS individual por colaborador

**Gestão de Trilhas e Cursos** — EM ANDAMENTO
- Criar trilhas como agrupadores de cursos
- Criar e editar cursos com upload de imagem de capa
- Adicionar vídeos com upload direto
- Criar avaliações com questões e gabarito

---

## M2 — Estabilização

**Objetivo:** Tornar a plataforma segura e confiável para produção com usuários reais.

- Remoção de credenciais expostas no código
- Proteção de dados: cada colaborador vê apenas o que é dele
- Sessão com expiração automática

---

## M3 — Crescimento

**Objetivo:** Funcionalidades que aumentam o valor percebido por gestores e o engajamento dos colaboradores.

- Notificações in-app (novo conteúdo disponível)
- Relatórios exportáveis por loja ou período
- Múltiplas tentativas em avaliações
- Feedback por questão após submissão da avaliação
