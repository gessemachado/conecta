# F-10 — Gestão de Trilhas e Cursos (Admin)

**Status:** EM ANDAMENTO

---

## Contexto

O admin cria e organiza todo o conteúdo de treinamento: trilhas, cursos, vídeos e avaliações. Uma trilha é o agrupador (ex: "Onboarding"); dentro dela existem cursos com seus vídeos e avaliações. É o módulo mais complexo do painel administrativo e está atualmente em desenvolvimento.

---

## Histórias de Usuário

### US-01 — Ver todas as trilhas e seus cursos
**Como** admin,
**quero** ver a lista de trilhas e os cursos de cada uma,
**para que** eu tenha uma visão geral do conteúdo disponível na plataforma.

**Critérios de aceitação:**
- [ ] Lista de trilhas com: título e número de cursos
- [ ] Ao expandir uma trilha, vê os cursos na ordem definida
- [ ] Cada curso mostra: título, número de vídeos e status (publicado/rascunho)
- [ ] Indica se o curso tem avaliação associada

### US-02 — Gerenciar trilhas (agrupadores)
**Como** admin,
**quero** criar e renomear trilhas diretamente na tela de criação de curso,
**para que** eu organize os cursos sem precisar sair do fluxo.

**Critérios de aceitação:**
- [ ] Trilhas existentes são exibidas como chips (ex: Vendas, Atendimento, Produto, Gestão, Compliance, Operações, Auditoria)
- [ ] Clicar em "+ Nova" cria uma nova trilha inline (sem modal separado)
- [ ] Cada chip tem ícone de edição (lápis) para renomear a trilha diretamente
- [ ] Trilha selecionada fica destacada em laranja
- [ ] Trilha é campo obrigatório para salvar o curso

### US-03 — Criar um novo curso
**Como** admin,
**quero** criar um curso com título, descrição e imagem de capa,
**para que** eu organize um novo conjunto de vídeos dentro de uma trilha.

**Critérios de aceitação:**
- [ ] Campo trilha: seleção via chips com opção "+ Nova" para criar trilha inline
- [ ] Campo ordem de exibição: número que define a posição do curso dentro da trilha
- [ ] Demais campos: título, descrição, imagem de capa (upload), público-alvo
- [ ] Upload de imagem com preview antes de salvar
- [ ] Curso criado começa como rascunho (não visível para colaboradores)
- [ ] Admin pode publicar o curso quando estiver pronto

### US-04 — Editar um curso existente
**Como** admin,
**quero** alterar os dados de um curso já criado,
**para que** eu mantenha o conteúdo atualizado.

**Critérios de aceitação:**
- [ ] Todos os campos da criação podem ser editados
- [ ] Posso trocar a imagem de capa (a antiga é removida)
- [ ] Alterações refletidas imediatamente para colaboradores (se publicado)

### US-05 — Excluir um curso
**Como** admin,
**quero** remover um curso que não é mais relevante,
**para que** o catálogo de treinamento fique atualizado.

**Critérios de aceitação:**
- [ ] Confirmação antes de excluir ("Essa ação é irreversível")
- [ ] Ao excluir, todos os vídeos e a avaliação associados são removidos
- [ ] Colaboradores que já concluíram mantêm seus certificados

### US-06 — Adicionar vídeo a um curso
**Como** admin,
**quero** fazer upload de um vídeo e adicioná-lo a um curso,
**para que** os colaboradores tenham acesso ao conteúdo.

**Critérios de aceitação:**
- [ ] Aceita formatos: MP4, MOV, AVI, WebM, MKV
- [ ] Aceita link externo: YouTube e Vimeo (embed automático)
- [ ] Campos obrigatórios: título e nível (Iniciante / Intermediário / Avançado)
- [ ] Campos opcionais: descrição, duração em minutos, se é obrigatório, ordem de exibição
- [ ] Barra de progresso visível durante o upload
- [ ] Após upload, vídeo aparece na lista do curso

### US-07 — Editar ou excluir um vídeo
**Como** admin,
**quero** alterar os dados de um vídeo ou removê-lo,
**para que** eu corrija informações ou retire conteúdo desatualizado.

**Critérios de aceitação:**
- [ ] Posso editar: título, descrição, nível, obrigatoriedade e ordem
- [ ] Posso substituir o arquivo de vídeo por um novo
- [ ] Confirmação antes de excluir

### US-10 — Adicionar material de apoio a um vídeo
**Como** admin,
**quero** anexar documentos (PDF, Word, Excel, PowerPoint) a um vídeo específico,
**para que** os colaboradores possam baixar tutoriais e materiais complementares enquanto assistem.

**Critérios de aceitação:**
- [x] Cada vídeo na lista da seção tem um botão "Recursos"
- [x] Clicar no botão abre modal de upload de documento
- [x] Aceita formatos: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (até 50 MB)
- [x] O documento exibe: ícone colorido por tipo, título e tamanho
- [x] Posso remover um documento antes de salvar o curso
- [x] Quando há documentos, o botão "Recursos" fica roxo com contagem (ex: "2 rec.")
- [x] Documentos são salvos junto com o curso ao publicar ou salvar rascunho
- [x] Documentos persistem ao editar o curso novamente

### US-08 — Definir público-alvo de um curso
**Como** admin,
**quero** selecionar para quais públicos o curso é destinado,
**para que** cada colaborador veja apenas o conteúdo relevante para sua função.

**Critérios de aceitação:**
- [ ] A tela exibe os públicos disponíveis como chips selecionáveis: Gerente Credenciado, Adm Credenciado, Auditor Credenciado, Influencer, Promotor, Frente de Caixa, Buyhelp
- [ ] Posso selecionar um ou mais públicos — o chip selecionado fica destacado em laranja
- [ ] Colaborador só vê o curso se seu perfil corresponde a um dos públicos selecionados
- [ ] Alterar o público-alvo de um curso já publicado reflete imediatamente

### US-09 — Criar avaliação para um curso
**Como** admin,
**quero** criar uma avaliação com questões de múltipla escolha,
**para que** os colaboradores sejam avaliados ao final do percurso.

**Critérios de aceitação:**
- [ ] Avaliação tem: título e nota mínima de aprovação (%)
- [ ] Posso adicionar múltiplas questões com texto e entre 2 e 5 opções cada
- [ ] Indico qual opção é a correta (gabarito)
- [ ] Posso adicionar, editar e reordenar questões antes de salvar
- [ ] Cada curso tem no máximo uma avaliação

---

## Borda

- Curso sem vídeos não pode ser publicado (exibe aviso ao tentar)
- Excluir a avaliação não revoga certificados já emitidos
- Alterar a ordem dos vídeos afeta o progresso sequencial dos colaboradores
