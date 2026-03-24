---
name: github
displayName: "GitHub"
version: "1.0.0"
type: mcp
description: "Integração com GitHub — issues, PRs, repositórios, código e actions via MCP"
categories: [git, collaboration, project-management, code]
domains: [frontend, backend, fullstack, mobile, devops]
---

## O Que Faz

Habilita o agent a interagir diretamente com o GitHub sem sair do contexto de trabalho.

**Com esta skill, o agent pode:**
- Criar, listar e comentar em issues
- Criar e revisar Pull Requests
- Consultar código de repositórios
- Buscar em repositórios e código (GitHub Search)
- Verificar status de GitHub Actions
- Criar e gerenciar branches

**Sem esta skill:** O agent não consegue criar ou acessar recursos no GitHub — apenas sugere comandos git locais.

---

## Instalação

### 1. Criar Personal Access Token (PAT)

1. Acesse: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Crie um token com as permissões necessárias:
   - `Contents` (read & write) — para ler/escrever arquivos
   - `Issues` (read & write) — para gerenciar issues
   - `Pull requests` (read & write) — para criar/revisar PRs
   - `Actions` (read) — para verificar workflows

### 2. Configurar variável de ambiente

```
GITHUB_PERSONAL_ACCESS_TOKEN=ghp_sua_chave_aqui
```

### 3. Configurar MCP no IDE

**Claude Code** — adicione em `.claude/settings.local.json`:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

**Cursor** — adicione em `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_sua_chave_aqui"
      }
    }
  }
}
```

### 4. Reiniciar o IDE

---

## Configuração MCP

```yaml
type: mcp
mcp_config:
  command: npx
  args: ["-y", "@modelcontextprotocol/server-github"]
  env:
    GITHUB_PERSONAL_ACCESS_TOKEN: ${GITHUB_PERSONAL_ACCESS_TOKEN}
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `GITHUB_PERSONAL_ACCESS_TOKEN` | ✅ | PAT com permissões de repo, issues e PRs |

---

## Instruções para o Agent

Quando a skill `github` estiver ativa:

```
SKILL ATIVA: github

Você tem acesso a ferramentas de integração com GitHub.

Ferramentas disponíveis:
- `create_issue` — criar issue em repositório
- `list_issues` — listar issues abertas
- `create_pull_request` — criar PR
- `get_pull_request` — consultar PR existente
- `search_repositories` — buscar repositórios
- `get_file_contents` — ler arquivo de repositório
- `list_commits` — listar commits de branch

Diretrizes de uso:
- Ao criar issues: use título descritivo, labels relevantes, e inclua steps de reprodução para bugs
- Ao criar PRs: inclua description clara (o quê + por quê), checklist de testes, e linked issue
- Ao buscar código: use queries específicas com linguagem e repo quando possível
- Nunca force-push em main/master sem confirmação explícita do usuário
- Para operações destrutivas (fechar, deletar): confirme com o usuário antes de executar

Formato de PR recomendado:
## O que esse PR faz
[descrição]

## Por que
[motivação]

## Como testar
[steps]

Closes #{número da issue}
```

---

## Casos de Uso por Squad

| Squad | Uso típico |
|-------|-----------|
| Frontend/Backend | Criar issues para bugs encontrados no review, abrir PRs automaticamente |
| DevOps | Verificar status de Actions, criar issues de infra |
| Produto | Consultar issues abertas para contexto de features, criar issues de produto |
| Todos | Buscar referências de código em outros repositórios |
