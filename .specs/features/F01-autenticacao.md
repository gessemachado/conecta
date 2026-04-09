# F-01 — Autenticação

**Status:** COMPLETO

---

## Contexto

Todo acesso à plataforma é protegido. Colaborador e admin usam o mesmo formulário de login, e o sistema os direciona automaticamente para a área correta com base no perfil.

---

## Histórias de Usuário

### US-01 — Login com e-mail e senha
**Como** colaborador ou admin,
**quero** fazer login com meu e-mail e senha,
**para que** eu acesse minha área personalizada na plataforma.

**Critérios de aceitação:**
- [ ] Campos de e-mail e senha são obrigatórios
- [ ] Credenciais válidas: admin vai para `/admin`, colaborador vai para `/`
- [ ] Credenciais inválidas: exibe mensagem "E-mail ou senha inválidos"
- [ ] Usuário inativo recebe mensagem específica de conta inativa
- [ ] Botão mostra indicador de carregamento durante a requisição

### US-02 — Sessão persistente entre visitas
**Como** colaborador,
**quero** que minha sessão seja mantida ao fechar e reabrir o browser,
**para que** eu não precise fazer login toda vez que acesso a plataforma.

**Critérios de aceitação:**
- [ ] Ao reabrir o browser, o usuário continua logado
- [ ] Nome e role do usuário estão disponíveis sem nova requisição

### US-03 — Proteção de rotas por role
**Como** sistema,
**quero** que colaboradores não acessem rotas de admin e vice-versa,
**para que** cada persona veja apenas o que é pertinente ao seu papel.

**Critérios de aceitação:**
- [ ] Colaborador tentando acessar `/admin/*` é redirecionado para `/`
- [ ] Usuário não autenticado tentando acessar rota protegida vai para `/login`
- [ ] Admin pode acessar tanto `/admin/*` quanto as rotas de colaborador

### US-04 — Logout
**Como** colaborador ou admin,
**quero** encerrar minha sessão,
**para que** outros não acessem minha conta no mesmo dispositivo.

**Critérios de aceitação:**
- [ ] Ao clicar em "Sair", sessão é encerrada imediatamente
- [ ] Usuário é redirecionado para `/login`
- [ ] Dados de sessão são removidos do dispositivo

---

## Fluxo Principal

```
Usuário acessa URL protegida
  └─► Não autenticado → /login
        └─► Preenche e-mail + senha → Submete
              ├─► Inválido → exibe erro, permanece na tela
              ├─► Inativo → mensagem de conta inativa
              └─► Válido → salva sessão
                    ├─► admin → /admin
                    └─► employee → /
```

---

## Borda

- E-mail não cadastrado → mesma mensagem genérica (não revelar se o e-mail existe)
- Token corrompido no localStorage → limpa e redireciona para login
