# F-04 — Player de Vídeo

**Status:** COMPLETO

---

## Contexto

O vídeo é a unidade principal de aprendizado. O colaborador assiste ao conteúdo, marca como concluído e pode interagir via comentários.

---

## Histórias de Usuário

### US-01 — Assistir a um vídeo
**Como** colaborador,
**quero** assistir aos vídeos da trilha diretamente na plataforma,
**para que** eu não precise sair para acessar o conteúdo.

**Critérios de aceitação:**
- [ ] Vídeo reproduzido com controles nativos (play, pausa, volume, tela cheia)
- [ ] Exibe título, nível (Iniciante / Intermediário / Avançado) e duração
- [ ] Exibe nome do curso ao qual o vídeo pertence

### US-02 — Marcar vídeo como concluído
**Como** colaborador,
**quero** marcar um vídeo como concluído ao terminar de assistir,
**para que** meu progresso na trilha seja atualizado.

**Critérios de aceitação:**
- [ ] Botão "Marcar como concluído" visível na tela
- [ ] Após marcar, botão muda para estado "Concluído" com visual diferenciado
- [ ] Progresso do curso é atualizado imediatamente

### US-03 — Navegar entre vídeos da trilha
**Como** colaborador,
**quero** ir para o próximo ou anterior sem voltar à listagem,
**para que** minha experiência de aprendizado seja contínua.

**Critérios de aceitação:**
- [ ] Navegação para próximo e vídeo anterior disponível
- [ ] No último vídeo, botão "Próximo" leva para a avaliação (se houver)

### US-04 — Comentar em um vídeo
**Como** colaborador,
**quero** deixar comentários nos vídeos,
**para que** eu possa compartilhar dúvidas ou impressões com a equipe.

**Critérios de aceitação:**
- [ ] Posso escrever e publicar um comentário
- [ ] Vejo comentários de outros em ordem cronológica
- [ ] Posso excluir apenas meus próprios comentários

### US-05 — Resetar progresso de um vídeo
**Como** colaborador,
**quero** desmarcar um vídeo como concluído,
**para que** eu possa reassistir e registrar que o revi.

**Critérios de aceitação:**
- [ ] Opção para resetar o progresso de vídeo concluído
- [ ] Após resetar, vídeo volta para estado "não concluído"
- [ ] Progresso do curso é recalculado imediatamente

### US-06 — Baixar material de apoio do vídeo
**Como** colaborador,
**quero** acessar e baixar documentos vinculados ao vídeo que estou assistindo,
**para que** eu tenha materiais de referência enquanto faço o treinamento.

**Critérios de aceitação:**
- [x] Card "Material de Apoio" aparece abaixo do título quando o vídeo tem documentos
- [x] Cada documento exibe: tipo colorido (PDF, Word, Excel, PPT), título e ícone de download
- [x] Clicar abre o documento em nova aba para visualização ou download
- [x] Card não aparece quando não há documentos vinculados ao vídeo

---

## Borda

- Vídeo obrigatório (`is_mandatory`) deve ser concluído antes de avançar no curso
- Se o vídeo não carregar, exibe mensagem de erro com opção de tentar novamente
- Documentos são vinculados individualmente a cada vídeo — um vídeo pode ter zero ou vários
