# State

**Última atualização:** 2026-04-08

---

## Decisões

- **Desbloqueio sequencial:** curso N só abre quando N-1 está 100% concluído — garante a ordem de aprendizado definida pelo admin
- **Público-alvo de cursos:** `target_roles` (array no curso) × `target_role` (campo no usuário) — curso aparece apenas se o role do usuário está no array do curso
- **NPS único por usuário:** pesquisa de satisfação aparece na primeira visita e nunca mais
- **Certificado idempotente:** re-emitir retorna o mesmo documento, sem duplicata
- **Cursos sem `order_index`** não participam do sistema de bloqueio (ficam sempre desbloqueados)
- **`is_published`** controla visibilidade dos cursos para colaboradores — rascunhos não aparecem
- **Hierarquia:** Trilha (agrupador) → Curso (unidade de conteúdo) → Seções → Vídeos + Avaliação
- **Material de apoio por vídeo:** tabela `documents` com `video_id` (FK para `videos`) — documentos são salvos após o insert dos vídeos em um único batch para evitar delete prematuro; bucket `documents` no Supabase Storage (público)
- **Tipos suportados de documentos:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX — até 50 MB por arquivo

## Pendências

- Remover credenciais de dev hardcoded no Login antes de ir a produção
- Definir quais cursos correspondem a cada perfil de acesso

## Lições aprendidas

- Dropdown dentro de container com `overflow:hidden` causa bug — usar datalist ou modal
- Sessões antigas não contêm `target_role`; buscar do banco na renderização

## Ideias adiadas

- Múltiplas tentativas em avaliações com cooldown
- Exportação de relatórios PDF/Excel por loja
- PWA para uso offline
- Notificações push para novo conteúdo
