# F-09 — Gestão de Usuários (Admin)

**Status:** COMPLETO

---

## Contexto

O admin visualiza a lista de colaboradores ativos da rede para acompanhar quem está cadastrado e consultado o desempenho individual de cada pessoa. Não há criação, edição ou exclusão de usuários nesta tela.

---

## Histórias de Usuário

### US-01 — Ver lista de colaboradores ativos
**Como** admin,
**quero** visualizar todos os colaboradores ativos da rede,
**para que** eu saiba quem está cadastrado e acompanhe o time.

**Critérios de aceitação:**
- [ ] Exibe apenas usuários com status ativo
- [ ] Lista mostra: nome, e-mail, loja e role de cada colaborador
- [ ] Busca por nome ou e-mail filtra em tempo real
- [ ] Filtro por loja disponível

### US-02 — Ver detalhes de um colaborador
**Como** admin,
**quero** ver o histórico de feedbacks e a pesquisa NPS de um colaborador,
**para que** eu entenda a experiência individual de cada pessoa com o treinamento.

**Critérios de aceitação:**
- [ ] Modal de detalhes exibe: feedbacks enviados por curso (nota + comentário)
- [ ] Exibe resposta da pesquisa NPS (notas e comentários por dimensão)
- [ ] Se não respondeu o NPS, exibe "Não respondido"
