# F-11 — Material de Apoio por Vídeo

**Status:** COMPLETO

---

## Contexto

Além dos vídeos, o admin pode anexar documentos de referência a cada vídeo individualmente (PDFs, planilhas, apresentações, documentos Word). O colaborador acessa esses materiais diretamente na página do player — sem precisar procurar em outro lugar — e pode fazer download para consultar offline.

---

## Modelo de Dados

**Tabela:** `documents`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | bigint (PK) | Auto-gerado |
| `trail_id` | integer (FK → trails) | Curso ao qual pertence |
| `video_id` | integer (FK → videos) | Vídeo ao qual o documento está vinculado |
| `title` | text | Nome exibido para o colaborador |
| `file_url` | text | URL pública no Supabase Storage |
| `file_type` | text | Extensão: pdf, doc, docx, xls, xlsx, ppt, pptx |
| `file_size` | bigint | Tamanho em bytes |
| `order_index` | int | Ordem de exibição |
| `created_at` | timestamptz | Data de criação |

**Storage:** bucket `documents` (público) no Supabase Storage.

---

## Histórias de Usuário

### US-01 — Adicionar documento a um vídeo (Admin)
**Como** admin,
**quero** anexar arquivos a um vídeo ao criar ou editar um curso,
**para que** os colaboradores tenham material de apoio junto ao conteúdo.

**Critérios de aceitação:**
- [x] Cada vídeo na lista da seção exibe botão "Recursos"
- [x] Clicar abre modal de upload com drag-and-drop
- [x] Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (até 50 MB)
- [x] Após upload, exibe: ícone colorido por tipo, título editável e tamanho
- [x] Botão "Recursos" fica roxo com contagem quando há documentos (ex: "2 rec.")
- [x] Posso remover documentos antes de salvar
- [x] Documentos são salvos ao publicar ou salvar rascunho
- [x] Ao editar o curso, documentos existentes são carregados corretamente

### US-02 — Baixar material de apoio (Colaborador — lista do curso)
**Como** colaborador,
**quero** ver quais vídeos têm material de apoio antes de assistir,
**para que** eu saiba que há documentos disponíveis.

**Critérios de aceitação:**
- [x] Na página do curso, vídeos com documentos exibem botão "Recursos ▾" em roxo
- [x] Clicar abre dropdown com lista de documentos para download
- [x] Cada item exibe: tipo (badge colorido), título e ícone de download
- [x] Clicar abre o documento em nova aba
- [x] Clicar fora do dropdown fecha

### US-03 — Baixar material de apoio (Colaborador — player)
**Como** colaborador,
**quero** acessar os documentos enquanto assisto ao vídeo,
**para que** eu possa consultar o material sem sair da tela.

**Critérios de aceitação:**
- [x] Card "Material de Apoio" exibido abaixo do título do vídeo (quando há documentos)
- [x] Cada documento exibe badge de tipo colorido, título e ícone de download roxo
- [x] Clicar abre o arquivo em nova aba
- [x] Card não aparece quando o vídeo não tem documentos

---

## Cores por tipo de documento

| Tipo | Cor |
|---|---|
| PDF | Vermelho `#EF4444` |
| Word (doc/docx) | Azul `#3B82F6` |
| Excel (xls/xlsx) | Verde `#22C55E` |
| PowerPoint (ppt/pptx) | Amarelo `#F59E0B` |
| Outros | Cinza `#A0A0A0` |

---

## Borda

- Um vídeo pode ter zero ou vários documentos
- Ao salvar o curso, todos os documentos antigos do trail são deletados e reinseridos (operação atômica)
- O delete de documentos ocorre após o insert dos vídeos para evitar apagar docs recém-inseridos
- Documentos de cursos deletados são removidos em cascata (`ON DELETE CASCADE`)
