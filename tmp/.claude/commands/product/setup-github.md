# Configurar Integração GitHub Issues

Configura a integração do GitHub Issues no projeto atual, guiando o usuário para obter e validar as credenciais necessárias, e persistindo a configuração em `.claude/.env`.

> **Pré-requisito recomendado:** ter rodado `/docs-commands:build-tech-docs` para que `tech-stack.md` já exista. O agente avisa caso o arquivo não seja encontrado.

---

## O que este comando faz

1. Verifica se já existe configuração GitHub em `.claude/.env`
2. Verifica se `gh` CLI está autenticado (alternativa ao token manual)
3. Guia o usuário para obter um Personal Access Token (PAT)
4. Valida as credenciais via API antes de salvar
5. Lista repositórios disponíveis para o usuário selecionar
6. Salva `GITHUB_TOKEN`, `GITHUB_OWNER` e `GITHUB_REPO` em `.claude/.env` — que está no `.gitignore`
7. Opcionalmente registra owner/repo (sem o token) em `tech-stack.md` como referência
8. Confirma que `/product:sync-github` está pronto para uso

---

## Credenciais necessárias

| Campo | Onde obter | Armazenamento |
|-------|-----------|---------------|
| `GITHUB_TOKEN` | [github.com/settings/tokens](https://github.com/settings/tokens) ou `gh auth token` | `.claude/.env` (gitignored) |
| `GITHUB_OWNER` | Usuário ou organização dona do repo | `.claude/.env` + `tech-stack.md` |
| `GITHUB_REPO` | Nome do repositório | `.claude/.env` + `tech-stack.md` |

---

## Fluxo de Execução

### PASSO 1 — Verificar Estado Atual

1. Verificar se `.claude/.env` existe e já contém configuração GitHub:
   ```bash
   grep -E "^GITHUB_" .claude/.env 2>/dev/null
   ```
   - Se sim: exibir variáveis presentes (sem mostrar o valor do TOKEN) e perguntar se deseja atualizar.
   - Se não: prosseguir.

2. Verificar se `gh` CLI está disponível e autenticado:
   ```bash
   gh auth status 2>/dev/null && gh auth token 2>/dev/null | head -c 10
   ```
   - Se autenticado: oferecer usar o token do `gh` CLI automaticamente (mais seguro).
   - Se não: guiar o usuário para criar um PAT manualmente.

Se configuração já existir:
```
✅ Configuração GitHub encontrada em .claude/.env

  GITHUB_TOKEN=*** (configurado)
  GITHUB_OWNER=<valor>
  GITHUB_REPO=<valor>

Deseja atualizar a configuração? [s/n]
```

---

### PASSO 2 — Coletar e Validar Token

**Opção A — Via `gh` CLI (recomendado):**
```
O GitHub CLI está autenticado. Posso usar seu token automaticamente.
Isso é mais seguro do que criar um novo token manualmente.

Usar token do gh CLI? [s/n]
```
Se sim: extrair token via `gh auth token` e continuar para PASSO 3.

**Opção B — Token manual:**
```
Onde obter seu Personal Access Token (PAT):
  1. Acesse: https://github.com/settings/tokens
  2. Clique em "Generate new token (classic)"
  3. Dê um nome (ex: "cortex-framework")
  4. Selecione os escopos: repo (ou apenas issues para repos públicos)
  5. Copie o token gerado (começa com "ghp_..." ou "github_pat_...")

O token será salvo em .claude/.env (que está no .gitignore).
Cole seu GitHub Token aqui:
```

Após receber o token, validar antes de salvar:

```bash
curl -s -H "Authorization: token <GITHUB_TOKEN>" \
  "https://api.github.com/user" | grep -E '"login"|"name"'
```

**Se retornar erro:**
```
❌ Token inválido.
Verifique se o token está correto (começa com "ghp_" ou "github_pat_").
Gere um novo em: https://github.com/settings/tokens
```

**Se retornar sucesso:** exibir login/name do usuário como confirmação.

---

### PASSO 3 — Detectar Owner Automaticamente

Extrair o owner do usuário autenticado:

```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/user" | grep '"login"'
```

Confirmar com o usuário se o repositório pertence a esse usuário ou a uma organização.

Se organização, listar organizações disponíveis:
```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/user/orgs" | grep '"login"'
```

---

### PASSO 4 — Listar e Selecionar Repositório

Listar repositórios disponíveis para o owner selecionado:

```bash
# Repos do usuário
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/user/repos?per_page=50&sort=updated" | grep '"full_name"'

# Repos da organização
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/orgs/<ORG>/repos?per_page=50&sort=updated" | grep '"full_name"'
```

Apresentar lista via `AskUserQuestion` para o usuário selecionar.

Se apenas um repositório relevante: sugerir automaticamente e confirmar.

---

### PASSO 5 — Confirmar Configuração

Exibir resumo antes de salvar:

```
✅ CONFIGURAÇÃO PRONTA PARA SALVAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Owner:  <owner>
Repo:   <repo>
Token:  *** (mantido apenas em GITHUB_TOKEN)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arquivo: .claude/.env

Deseja salvar? [s/n]
```

---

### PASSO 6 — Persistir em `.claude/.env`

Com aprovação do usuário, criar ou atualizar `.claude/.env`:

```bash
# GitHub Issues Integration — gerado por /product:setup-github
# ⚠️  Este arquivo está no .gitignore — NUNCA commitar
GITHUB_TOKEN=<token>
GITHUB_OWNER=<owner>
GITHUB_REPO=<repo>
```

Se `.claude/.env` já existir: preservar as demais variáveis (LINEAR_*, JIRA_*, etc.), substituir apenas as `GITHUB_*`.

**Adicionalmente**, se `docs/technical-context/briefing/tech-stack.md` existir, adicionar seção de referência (sem o token):

```markdown

## Integrações

### GitHub Issues

- **Owner:** <owner>
- **Repo:** <repo>
- **URL:** https://github.com/<owner>/<repo>/issues
- **Credenciais:** Armazenadas em `.claude/.env` (gitignored)

> Execute `/product:setup-github` para reconfigurar.
```

---

### PASSO 7 — Verificação Final

Validar a configuração salva:

```bash
# Testar acesso ao repositório
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO" | grep '"name"'
```

Exibir resultado:

```
✅ INTEGRAÇÃO GITHUB ISSUES CONFIGURADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Credenciais salvas em:
  .claude/.env  (gitignored — nunca será commitado)

Variáveis configuradas:
  GITHUB_TOKEN=***
  GITHUB_OWNER=<valor>
  GITHUB_REPO=<valor>

Repositório verificado:
  https://github.com/<owner>/<repo>

Para sincronizar features com GitHub Issues:
  /product:sync-github
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Segurança

- Token salvo somente em `.claude/.env` — nunca em arquivos versionados
- `.claude/.env` está no `.gitignore` — verificar antes de salvar
- Se usar CI/CD, configure `GITHUB_TOKEN` como secret no seu provedor
- Para repositórios públicos, use um token com escopo mínimo (`public_repo`)
- Para repositórios privados, use o escopo `repo`

---

## Após a configuração

```bash
/product:sync-github          # Sincronizar features com GitHub Issues
/product:sync-github preview  # Ver diff sem fazer alterações
```

---

## Resolução de Problemas

| Problema | Solução |
|---------|---------|
| `401 Unauthorized` | Token inválido ou expirado — execute novamente `/product:setup-github` |
| `404 Not Found` | Repo incorreto ou sem acesso — verifique owner/repo |
| `403 Forbidden` | Token sem escopos necessários — gere novo com escopo `repo` |
| `tech-stack.md` não encontrado | Execute `/docs-commands:build-tech-docs` primeiro |
| Repositório não listado | Verifique se tem acesso ao repo ou use token com escopo `repo` |

---

## Uso

```
/product:setup-github
```
