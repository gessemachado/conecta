# F-06 — Certificado

**Status:** COMPLETO

---

## Contexto

O certificado é o reconhecimento formal de que o colaborador concluiu todos os vídeos de um curso. Não depende de avaliação — basta 100% dos vídeos assistidos. Deve ser acessível a qualquer momento e verificável com um código único.

---

## Histórias de Usuário

### US-01 — Emitir certificado ao concluir o curso
**Como** colaborador que assistiu todos os vídeos de um curso,
**quero** emitir meu certificado de conclusão,
**para que** eu tenha um comprovante formal do treinamento realizado.

**Critérios de aceitação:**
- [ ] O botão "Emitir Certificado" aparece quando o colaborador atingiu 100% dos vídeos do curso
- [ ] Ao clicar, o sistema gera o documento
- [ ] Certificado exibe: nome do colaborador, nome do curso, data de emissão e código de verificação
- [ ] Se o certificado já existe, o mesmo documento é retornado (sem criar duplicata)
- [ ] Código de verificação no formato `BH-{ANO}-{CÓDIGO}-CERT`

### US-02 — Acessar certificado emitido anteriormente
**Como** colaborador,
**quero** acessar meus certificados já emitidos a qualquer momento,
**para que** eu possa compartilhá-los ou imprimi-los quando precisar.

**Critérios de aceitação:**
- [ ] Certificados aparecem com botão de acesso na listagem de cursos concluídos
- [ ] Tela exibe todos os dados mesmo dias ou meses depois

---

## Borda

- Colaborador com menos de 100% dos vídeos concluídos não vê o botão de emissão
- Cada colaborador tem no máximo 1 certificado por curso
- Se o curso for excluído, o certificado continua acessível
