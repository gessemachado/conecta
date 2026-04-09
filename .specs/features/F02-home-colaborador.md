# F-02 — Home do Colaborador

**Status:** COMPLETO

---

## Contexto

A home é a primeira tela que o colaborador vê ao entrar. Deve motivar a continuidade, dar uma visão clara do progresso e facilitar o acesso ao próximo passo na jornada de aprendizado.

---

## Histórias de Usuário

### US-01 — Ver curso em andamento e continuar
**Como** colaborador,
**quero** ver o curso que estou fazendo logo na tela inicial,
**para que** eu possa continuar de onde parei com um clique.

**Critérios de aceitação:**
- [ ] Card "Curso Atual" exibe título e percentual de progresso
- [ ] Barra de progresso reflete o percentual real de vídeos concluídos
- [ ] Botão "Continuar" leva para o próximo vídeo não assistido do curso
- [ ] Se não há curso em andamento, exibe o primeiro curso disponível

### US-02 — Ver estatísticas pessoais de aprendizado
**Como** colaborador,
**quero** ver um resumo do meu progresso na plataforma,
**para que** eu saiba quanto já aprendi.

**Critérios de aceitação:**
- [ ] Exibe tempo total assistido (em horas e minutos)
- [ ] Exibe número de cursos concluídos
- [ ] Exibe número de cursos ainda por concluir

### US-03 — Ver cursos recomendados
**Como** colaborador,
**quero** ver sugestões de cursos para fazer a seguir,
**para que** eu saiba quais conteúdos estão disponíveis para mim.

**Critérios de aceitação:**
- [ ] Exibe até 4 cursos: em andamento > não iniciados > concluídos > bloqueados
- [ ] Cada card mostra thumbnail, título, duração e nota média (se houver)
- [ ] Cursos bloqueados aparecem com cadeado e mensagem "Conclua o curso anterior"
- [ ] Cursos 100% concluídos mostram botão de acesso ao certificado
- [ ] Clicar em curso desbloqueado navega para o primeiro vídeo do curso

### US-04 — Ver evolução semanal
**Como** colaborador,
**quero** ver quantos vídeos assisti em cada dia da semana,
**para que** eu acompanhe minha regularidade de estudo.

**Critérios de aceitação:**
- [ ] Gráfico de barras com os 7 dias anteriores (Seg → Dom)
- [ ] O dia atual é destacado visualmente com cor diferente
- [ ] Tooltip mostra o número exato de vídeos no dia atual

### US-05 — Pesquisa de onboarding na primeira visita
**Como** colaborador,
**quero** ser convidado a dar minha opinião ao entrar pela primeira vez,
**para que** a empresa saiba minha expectativa sobre o treinamento.

**Critérios de aceitação:**
- [ ] Modal de pesquisa aparece automaticamente na primeira visita
- [ ] Nas visitas seguintes, o modal não aparece mais
- [ ] O colaborador pode fechar o modal sem responder (e será exibido novamente na próxima visita)

---

## Fluxo Principal

```
Colaborador faz login
  └─► Carrega home
        ├─► Verifica pesquisa de onboarding
        │     └─► Não respondida → exibe modal
        └─► Exibe:
              ├─► Hero: curso atual + botão continuar
              ├─► Stats: tempo total, concluídos, restantes
              ├─► Grid: 4 cursos recomendados
              └─► Gráfico: evolução dos últimos 7 dias
```
