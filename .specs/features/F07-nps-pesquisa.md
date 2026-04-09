# F-07 — Pesquisa de Satisfação (NPS)

**Status:** COMPLETO

---

## Contexto

A plataforma coleta feedback de satisfação dos colaboradores para que o time de RH entenda a percepção sobre o treinamento. A pesquisa aparece uma única vez no início do uso.

---

## Histórias de Usuário

### US-01 — Responder pesquisa na primeira visita
**Como** colaborador que usa a plataforma pela primeira vez,
**quero** poder compartilhar minha opinião sobre o treinamento,
**para que** a empresa saiba minha percepção.

**Critérios de aceitação:**
- [ ] Modal aparece automaticamente na primeira visita à home
- [ ] 3 dimensões: qualidade do treinamento (1-10), experiência na plataforma (1-10), NPS (0-10)
- [ ] Cada dimensão tem campo de comentário opcional
- [ ] É possível fechar o modal sem responder (aparece novamente na próxima visita)
- [ ] Após responder, o modal nunca mais aparece

### US-02 — Admin vê médias globais de satisfação
**Como** admin,
**quero** ver as médias de satisfação de todos os colaboradores,
**para que** eu entenda como a rede está percebendo o programa de treinamento.

**Critérios de aceitação:**
- [ ] Exibe média de nota para cada dimensão (treinamento, plataforma, NPS)
- [ ] Dados agregados de todos os colaboradores que responderam

### US-03 — Admin vê resposta individual de cada colaborador
**Como** admin,
**quero** ver a resposta da pesquisa de um colaborador específico,
**para que** eu entenda a percepção individual antes de uma conversa de acompanhamento.

**Critérios de aceitação:**
- [ ] Na tela de detalhes do usuário, exibe a resposta da pesquisa (se preenchida)
- [ ] Exibe notas e comentários de cada dimensão
- [ ] Se não respondeu, exibe "Não respondido"

---

## Borda

- A resposta não pode ser editada após o envio
- Colaborador pode responder mesmo sem ter assistido nenhum vídeo ainda
