# Sincronizar Features com Linear

Sincroniza a documentação de features em `docs/business-context/features/` com o projeto Linear, criando ou atualizando épicos e sub-issues automaticamente.

> **Pré-requisito:** as credenciais do Linear devem estar configuradas em `.claude/.env` (via `/product:setup-linear`). Veja a seção [Configuração](#configuração) abaixo.

---

## Fluxo de Execução

### Passo 1: Carregar Configuração Linear

Antes de qualquer chamada, carregar credenciais de `.claude/.env`:

```bash
# Carregar variáveis do arquivo .claude/.env
# Usar Read para ler .claude/.env e extrair os valores:
# LINEAR_API_KEY, LINEAR_TEAM_ID, LINEAR_PROJECT_ID, LINEAR_ORG_SLUG
```

**Ordem de prioridade para carregar credenciais:**
1. `.claude/.env` — fonte primária (configurado via `/product:setup-linear`)
2. Variáveis de ambiente da sessão (`$LINEAR_API_KEY`, etc.) — fallback

Se qualquer configuração estiver ausente, bloquear execução e informar:
```
SYNC BLOQUEADO
Credenciais Linear não encontradas.

Execute o setup para configurar:
  /product:setup-linear

Ou verifique se .claude/.env contém:
  LINEAR_API_KEY=...
  LINEAR_TEAM_ID=...
  LINEAR_PROJECT_ID=...
  LINEAR_ORG_SLUG=...
```

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

Invoque o agente @linear-project-sync para executar a análise:

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

### Passo 4: Consultar Linear

Buscar issues existentes no projeto usando as configurações carregadas no Passo 1:

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: $LINEAR_API_KEY" \
  -d '{
    "query": "query { project(id: \"$LINEAR_PROJECT_ID\") { issues(first: 200) { nodes { id identifier title state { name } priority labels { nodes { name } } children { nodes { identifier title state { name } } } } } } }"
  }'
```

---

### Passo 5: Consultar GitHub

Use ferramentas MCP para verificar status de implementação:

- `mcp__github__search_issues` — Buscar issues relacionadas
- `mcp__github__list_pull_requests` — Verificar PRs com "Closes <ISSUE-ID>"

---

### Passo 6: Gerar Relatório de Preview

Apresente o relatório de diferenças ao usuário:

```markdown
## 📊 Relatório de Sincronização Linear

### Resumo
| Métrica | Valor |
|---------|-------|
| Features Analisadas | XX |
| Novas (criar) | XX |
| A Atualizar | XX |
| Já Sincronizadas | XX |
| Órfãs no Linear | XX |

### ➕ CRIAR (Novas features sem issue Linear)
| Feature | Módulo | Escopo | Prioridade | Sub-issues |
|---------|--------|--------|------------|------------|
| <nome-feature> | <módulo> | <escopo> | <prioridade> | X RFs |

### 🔄 ATUALIZAR (Features com diferenças)
| Feature | Campo | Atual (Linear) | Novo (Doc) |
|---------|-------|----------------|------------|
| <nome-feature> | Status | Backlog | Em Desenvolvimento |

### ✅ SINCRONIZADAS (Sem alterações necessárias)
- [x] <feature> (<ISSUE-ID>)

### ⚠️ ÓRFÃS (Issues Linear sem documentação correspondente)
- <ISSUE-ID>: [título] - Considerar arquivar?
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

Se aprovado, execute as mutations GraphQL usando as configurações do Passo 1:

#### Criar Epic (Issue pai)
```graphql
mutation {
  issueCreate(input: {
    teamId: "<LINEAR_TEAM_ID>"
    projectId: "<LINEAR_PROJECT_ID>"
    title: "[Feature] Nome da Feature"
    description: "Descrição completa..."
    priority: 1
  }) {
    success
    issue { id identifier url }
  }
}
```

#### Criar Sub-Issue (RF)
```graphql
mutation {
  issueCreate(input: {
    teamId: "<LINEAR_TEAM_ID>"
    parentId: "<id-do-epic>"
    title: "RF01 - Título do Requisito"
    description: "Descrição..."
  }) {
    success
    issue { id identifier }
  }
}
```

#### Atualizar Issue
```graphql
mutation {
  issueUpdate(id: "<issue-id>", input: {
    stateId: "<state-id>"
    priority: 2
  }) {
    success
  }
}
```

---

### Passo 9: Relatório Final

Após execução, apresente o resultado:

```markdown
## ✅ Sincronização Concluída

### Criados (X issues)
- <ISSUE-ID>: [Feature] <nome> - https://linear.app/<LINEAR_ORG_SLUG>/issue/<ISSUE-ID>
  - <ISSUE-ID>: RF01 - <título>
  - <ISSUE-ID>: RF02 - <título>

### Atualizados (X issues)
- <ISSUE-ID>: Status alterado Backlog → In Progress

### Ignorados (X issues)
- <ISSUE-ID>: Já sincronizado

### Próximos Passos
1. Revisar issues criadas no Linear
2. Atribuir responsáveis às tarefas
3. Adicionar estimativas se necessário
```

---

## Configuração

As credenciais do Linear são armazenadas em `.claude/.env` (gitignored) após executar `/product:setup-linear`:

```bash
# .claude/.env — gerado automaticamente pelo setup-linear
LINEAR_API_KEY=lin_api_...
LINEAR_ORG_SLUG=minha-empresa
LINEAR_TEAM_ID=<uuid>
LINEAR_PROJECT_ID=<uuid>
```

> O arquivo `.claude/.env` está no `.gitignore` — nunca será commitado ao repositório.
> Execute `/product:setup-linear` para configurar ou reconfigurar.

---

## Mapeamentos

### Status → State
| Doc Status | Linear State |
|------------|--------------|
| Backlog | Backlog |
| Planejado | Todo |
| Em Desenvolvimento | In Progress |
| Concluída | Done |

### Prioridade → Priority
| Doc Prioridade | Linear Priority |
|----------------|-----------------|
| Crítica | 1 (Urgent) |
| Alta | 2 (High) |
| Média | 3 (Medium) |
| Baixa | 4 (Low) |

### Escopo → Label
| Doc Escopo | Linear Label |
|------------|--------------|
| MVP | high-priority |

---

## Regras de Segurança

1. **Sempre preview primeiro** — Nunca executar mutations sem aprovação
2. **Não duplicar** — Verificar existência antes de criar
3. **Não fazer downgrade** — Não mover "In Progress" para "Backlog" automaticamente
4. **Rate limiting** — Esperar 500ms entre chamadas API
5. **Preservar edições manuais** — Não sobrescrever descrições editadas manualmente
6. **API Key somente em `.claude/.env`** — Nunca em arquivos versionados

---

## Uso

```
/product:sync-linear
```

Ou com argumentos:

```
/product:sync-linear modulo=<nome-modulo>
/product:sync-linear escopo=MVP
/product:sync-linear preview
```
