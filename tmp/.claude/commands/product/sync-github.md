# Sincronizar Features com GitHub Issues

Sincroniza a documentação de features em `docs/business-context/features/` com o repositório GitHub, criando ou atualizando issues e milestones automaticamente.

> **Pré-requisito:** as credenciais do GitHub devem estar configuradas em `.claude/.env` (via `/product:setup-github`). Veja a seção [Configuração](#configuração) abaixo.

---

## Fluxo de Execução

### Passo 1: Carregar Configuração GitHub

Antes de qualquer chamada, carregar credenciais de `.claude/.env`:

```bash
# Ler .claude/.env e extrair:
# GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO
```

**Ordem de prioridade para carregar credenciais:**
1. `.claude/.env` — fonte primária (configurado via `/product:setup-github`)
2. Variáveis de ambiente da sessão (`$GITHUB_TOKEN`, etc.) — fallback
3. `gh auth token` — fallback (se `gh` CLI estiver autenticado)
4. MCP GitHub tools (`mcp__github__*`) — fallback final (sem token necessário)

Se nenhuma das fontes estiver disponível, bloquear execução e informar:
```
SYNC BLOQUEADO
GitHub não conectado.

Opções para conectar:
  1. gh auth login                  (recomendado — sem configuração extra)
  2. /product:setup-github          (salva token em .claude/.env)

Se já usar gh CLI ou MCP GitHub, o sync funciona sem .claude/.env.
```

> Se `GITHUB_OWNER` e `GITHUB_REPO` não estiverem em `.claude/.env`, perguntar ao usuário antes de prosseguir.

---

### Passo 2: Seleção de Modo

Pergunte ao usuário qual modo de sincronização deseja:

**Opções:**
1. **Completo** — Sincronizar todas as features de todos os módulos
2. **Por Módulo** — Sincronizar apenas um módulo específico (módulos lidos de `docs/business-context/`)
3. **Por Escopo** — Sincronizar apenas um escopo específico (ex: MVP, Fase 2, Fase 3)
4. **Preview** — Apenas gerar relatório de diferenças, sem fazer alterações

Use o `AskUserQuestion` para apresentar essas opções.

---

### Passo 3: Análise de Features

Invoque o agente `@github-issues-sync` para executar a análise:

1. **Ler documentação**: Glob `docs/business-context/features/*.md`
2. **Ignorar arquivos**:
   - `_legacy*`
   - `index.md`
   - `README.md`
3. **Extrair metadata** de cada arquivo:
   - Título (H1)
   - Status, Prioridade, Escopo, Módulo
   - Requisitos Funcionais (RF-XX)

---

### Passo 4: Consultar GitHub Issues

Buscar issues e milestones existentes no repositório:

```bash
# Listar todas as issues (abertas e fechadas)
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues?state=all&per_page=100"

# Listar milestones
curl -s -H "Authorization: token $GITHUB_OWNER/$GITHUB_REPO" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/milestones?state=all"

# Listar labels
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/labels?per_page=100"
```

Ou via MCP tools (preferido):
```
mcp__github__list_issues — owner, repo, state: "all"
mcp__github__list_milestones — owner, repo
```

---

### Passo 5: Consultar GitHub PRs (implementação)

Use ferramentas MCP para verificar status de implementação:

- `mcp__github__list_pull_requests` — Verificar PRs com "Closes #<number>"
- `mcp__github__search_code` — Verificar código implementado relacionado à feature

---

### Passo 6: Gerar Relatório de Preview

Apresente o relatório de diferenças ao usuário:

```markdown
## 📊 Relatório de Sincronização GitHub Issues

### Resumo
| Métrica | Valor |
|---------|-------|
| Features Analisadas | XX |
| Novas (criar) | XX |
| A Atualizar | XX |
| Já Sincronizadas | XX |
| Órfãs no GitHub | XX |

### ➕ CRIAR (Novas features sem issue)
| Feature | Módulo | Escopo | Prioridade | Sub-issues |
|---------|--------|--------|------------|------------|
| <nome-feature> | <módulo> | <escopo> | <prioridade> | X RFs |

### 🔄 ATUALIZAR (Features com diferenças)
| Feature | Campo | Atual (GitHub) | Novo (Doc) |
|---------|-------|----------------|------------|
| <nome-feature> | Status | open | closed |

### ✅ SINCRONIZADAS (Sem alterações necessárias)
- [x] <feature> (#<number>)

### ⚠️ ÓRFÃS (Issues GitHub sem documentação correspondente)
- #<number>: [título] - Considerar fechar?
```

---

### Passo 7: Confirmação

Pergunte ao usuário como proceder:

**Opções:**
- `Executar tudo` — Criar novas e atualizar existentes
- `Apenas criar` — Criar novas, ignorar atualizações
- `Apenas atualizar` — Atualizar existentes, ignorar novas
- `Cancelar` — Não fazer alterações

---

### Passo 8: Execução

Se aprovado, o agente `@github-issues-sync` executa as operações:

#### Garantir Labels

Verificar e criar labels necessárias antes de criar issues:

```bash
# Verificar se label existe
curl -s -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/labels/priority:high"

# Criar label se não existir
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/labels" \
  -d '{"name": "priority:high", "color": "e4e669"}'
```

#### Garantir Milestones (por Módulo)

```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/milestones" \
  -d '{"title": "<module-name>"}'
```

#### Criar Issue (Feature pai)

```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues" \
  -d '{
    "title": "[Feature] <titulo>",
    "body": "## Descrição\n\n...\n\n<!-- cortex-feature: <arquivo.md> -->",
    "labels": ["feature", "priority:<p>", "scope:<s>", "status:<st>"],
    "milestone": <milestone-number>
  }'
```

#### Criar Sub-Issue (RF)

```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues" \
  -d '{
    "title": "RF<id> - <titulo>",
    "body": "...\n\n**Parent:** #<number>\n<!-- cortex-rf: <arquivo.md>:<rf-id> -->",
    "labels": ["sub-issue", "scope:<s>"]
  }'
```

#### Atualizar Issue existente

```bash
# Fechar issue (feature concluída)
curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues/<number>" \
  -d '{"state": "closed"}'

# Atualizar labels
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO/issues/<number>/labels" \
  -d '["feature", "priority:high", "status:in-progress"]'
```

---

### Passo 9: Relatório Final

Após execução, apresente o resultado:

```markdown
## ✅ Sincronização GitHub Issues Concluída

### Criados (X issues)
- #<number>: [Feature] <nome> - https://github.com/<OWNER>/<REPO>/issues/<number>
  - #<number>: RF01 - <título>
  - #<number>: RF02 - <título>

### Atualizados (X issues)
- #<number>: Status alterado open → closed

### Ignorados (X issues)
- #<number>: Já sincronizado

### Próximos Passos
1. Revisar issues criadas no GitHub
2. Atribuir responsáveis (assignees)
3. Adicionar issues ao GitHub Project (se aplicável)
```

---

## Configuração

As credenciais do GitHub são armazenadas em `.claude/.env` (gitignored) após executar `/product:setup-github`:

```bash
# .claude/.env — gerado automaticamente pelo setup-github
GITHUB_TOKEN=ghp_...
GITHUB_OWNER=meu-usuario
GITHUB_REPO=meu-repositorio
```

> O arquivo `.claude/.env` está no `.gitignore` — nunca será commitado ao repositório.
> Execute `/product:setup-github` para configurar ou reconfigurar.

---

## Mapeamentos

### Status → State + Label
| Doc Status         | GitHub State | Label              |
|--------------------|--------------|---------------------|
| Backlog            | open         | status:backlog      |
| Planejado          | open         | status:planned      |
| Em Desenvolvimento | open         | status:in-progress  |
| Concluída          | closed       | —                   |

### Prioridade → Label
| Doc Prioridade | GitHub Label       |
|----------------|--------------------|
| Crítica        | priority:critical  |
| Alta           | priority:high      |
| Média          | priority:medium    |
| Baixa          | priority:low       |

### Escopo → Label
| Doc Escopo | GitHub Label    |
|------------|-----------------|
| MVP        | scope:mvp       |
| Fase 2     | scope:phase-2   |
| Fase 3     | scope:phase-3   |

### Módulo → Milestone
Cada módulo único nos docs gera um Milestone no GitHub com o mesmo nome.

---

## Regras de Segurança

1. **Sempre preview primeiro** — Nunca executar sem aprovação
2. **Não duplicar** — Verificar marker `<!-- cortex-feature: <arquivo> -->` antes de criar
3. **Não fazer downgrade** — Não reabrir issues fechadas automaticamente
4. **Rate limiting** — Respeitar limites da API GitHub (200ms entre chamadas)
5. **Preservar edições manuais** — Não sobrescrever issues com `<!-- cortex-manual -->`
6. **Token somente em `.claude/.env`** — Nunca em arquivos versionados

---

## Uso

```
/product:sync-github
```

Ou com argumentos:

```
/product:sync-github modulo=<nome-modulo>
/product:sync-github escopo=MVP
/product:sync-github preview
```
