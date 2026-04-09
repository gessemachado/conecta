# F-05 — Avaliação

**Status:** COMPLETO

---

## Contexto

Cada curso pode ter uma avaliação de múltipla escolha ao final. O colaborador precisa atingir a nota mínima para ser aprovado e ter direito ao certificado.

---

## Histórias de Usuário

### US-01 — Responder a avaliação do curso
**Como** colaborador,
**quero** responder às questões da avaliação após concluir os vídeos,
**para que** eu possa demonstrar o que aprendi e ser aprovado.

**Critérios de aceitação:**
- [ ] Avaliação exibe todas as questões em sequência
- [ ] Cada questão tem entre 2 e 5 opções (múltipla escolha, apenas uma correta)
- [ ] Não é possível enviar sem responder todas as questões
- [ ] Gabarito não é exibido durante a resposta

### US-02 — Ver o resultado imediatamente após enviar
**Como** colaborador,
**quero** saber minha nota e se fui aprovado ou reprovado assim que enviar,
**para que** eu saiba se posso pegar o certificado.

**Critérios de aceitação:**
- [ ] Exibe: nota obtida (%), total de questões e status (Aprovado / Reprovado)
- [ ] Aprovado: exibe botão para emitir o certificado
- [ ] Reprovado: exibe mensagem de encorajamento e nota mínima necessária
- [ ] Resultado é salvo e pode ser consultado novamente

### US-03 — Admin vê gabarito e resultados de todos
**Como** admin,
**quero** ver as questões com o gabarito e os resultados de todos os colaboradores,
**para que** eu possa revisar a avaliação e acompanhar o desempenho da equipe.

**Critérios de aceitação:**
- [ ] Admin vê qual opção é correta em cada questão
- [ ] Admin vê resultados de todos os colaboradores que fizeram a avaliação
- [ ] Resultados filtráveis por usuário ou data

---

## Fluxo Principal

```
Colaborador acessa avaliação do curso
  └─► Sistema carrega questões (sem gabarito)
        └─► Colaborador responde todas as questões → Envia
              └─► Sistema calcula nota
                    ├─► Nota >= mínima → Aprovado
                    │     └─► Resultado + botão "Emitir Certificado"
                    └─► Nota < mínima → Reprovado
                          └─► Resultado + nota necessária
```

---

## Borda

- Se o colaborador já fez a avaliação, exibe resultado anterior ao abrir
- Avaliação sem questões não é exibida ao colaborador
