# F-03 — Cursos

**Status:** COMPLETO

---

## Contexto

Os cursos organizam os vídeos em uma sequência de aprendizado. O colaborador avança progressivamente, e cada curso concluído desbloqueia o próximo. Cursos são agrupados em trilhas.

---

## Histórias de Usuário

### US-01 — Ver todos os cursos disponíveis
**Como** colaborador,
**quero** ver a lista de cursos disponíveis para o meu perfil,
**para que** eu saiba o que posso aprender na plataforma.

**Critérios de aceitação:**
- [ ] Exibe apenas cursos publicados e direcionados ao meu perfil
- [ ] Cada curso mostra: thumbnail, título, trilha, duração total e progresso %
- [ ] Cursos são exibidos na ordem definida pelo admin

### US-02 — Desbloqueio sequencial de cursos
**Como** colaborador,
**quero** que os cursos sejam desbloqueados conforme avanço,
**para que** eu siga o caminho de aprendizado na ordem correta.

**Critérios de aceitação:**
- [ ] Curso N+1 só é acessível quando curso N estiver 100% concluído
- [ ] Cursos bloqueados são exibidos com visual diferenciado (escurecido + cadeado)
- [ ] Clicar em curso bloqueado não navega — exibe mensagem "Conclua o curso anterior"

### US-03 — Ver detalhe de um curso
**Como** colaborador,
**quero** ver os vídeos e a avaliação de um curso,
**para que** eu saiba o que me espera nesse percurso.

**Critérios de aceitação:**
- [ ] Exibe título, descrição, lista de vídeos e avaliação (se houver)
- [ ] Cada vídeo na lista mostra: título, duração, nível e se já foi concluído
- [ ] Progresso geral do curso (%) é exibido no topo
- [ ] Botão de acesso direto à avaliação do curso

### US-04 — Dar feedback de um curso
**Como** colaborador,
**quero** avaliar o curso após concluí-lo,
**para que** o time de RH saiba o que achei do conteúdo.

**Critérios de aceitação:**
- [ ] Apenas colaboradores que concluíram o curso podem enviar feedback
- [ ] Feedback: nota (1-10) + comentário opcional
- [ ] Cada colaborador envia feedback apenas uma vez por curso
- [ ] Após envio, botão muda para "Avaliação enviada"

---

## Fluxo Principal

```
Colaborador acessa /cursos
  └─► Lista de cursos do seu perfil (na ordem correta)
        ├─► Desbloqueados → clicáveis
        └─► Bloqueados → visual cinza + cadeado

Colaborador clica em curso desbloqueado
  └─► Detalhe do curso
        ├─► Clica em vídeo → player
        └─► Clica em avaliação → tela de avaliação
```
