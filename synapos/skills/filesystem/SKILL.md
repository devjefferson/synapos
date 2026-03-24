---
name: filesystem
displayName: "Filesystem"
version: "1.0.0"
type: mcp
description: "Leitura e escrita avançada de arquivos — acesso direto ao sistema de arquivos do projeto"
categories: [file, system, project]
domains: [frontend, backend, fullstack, mobile, devops, ia-dados, produto]
---

## O Que Faz

Habilita o agent a ler e escrever arquivos do projeto com acesso direto ao sistema de arquivos.

**Com esta skill, o agent pode:**
- Ler múltiplos arquivos em uma operação
- Listar diretórios e árvores de arquivos
- Escrever e editar arquivos diretamente
- Buscar por padrões de conteúdo em arquivos
- Criar e gerenciar estruturas de diretórios

**Diferença do uso padrão:** IDEs como Claude Code já têm capacidade de file I/O. Esta skill MCP é útil principalmente em contextos onde o agent está sendo executado em modo mais restrito, ou quando se quer padronizar o acesso a arquivos entre múltiplos IDEs.

**Sem esta skill:** O agent depende das ferramentas de file I/O nativas do IDE (geralmente suficiente).

---

## Instalação

### 1. Configurar MCP no IDE

**Claude Code** — adicione em `.claude/settings.local.json`:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/caminho/para/seu/projeto"
      ]
    }
  }
}
```

Substitua `/caminho/para/seu/projeto` pelo diretório raiz do seu projeto.

**Múltiplos diretórios:**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/você/projeto-a",
        "/Users/você/projeto-b"
      ]
    }
  }
}
```

**Cursor** — adicione em `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/caminho/para/seu/projeto"
      ]
    }
  }
}
```

### 2. Reiniciar o IDE

---

## Configuração MCP

```yaml
type: mcp
mcp_config:
  command: npx
  args:
    - "-y"
    - "@modelcontextprotocol/server-filesystem"
    - "${PROJECT_ROOT}"
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PROJECT_ROOT` | ✅ (na config) | Caminho raiz do projeto a ser acessado |

> Nota: O path é configurado diretamente nos args do MCP, não como env var. Use a variável apenas como referência na configuração.

---

## Segurança

⚠️ **Atenção:** Esta skill concede ao agent acesso de leitura/escrita ao diretório configurado.

- Configure apenas o diretório do projeto, nunca `/` ou `~` completo
- Em produção, use modo somente-leitura quando escrita não for necessária
- Nunca configure diretórios com credenciais, SSH keys ou dados sensíveis

---

## Instruções para o Agent

Quando a skill `filesystem` estiver ativa:

```
SKILL ATIVA: filesystem

Você tem acesso expandido ao sistema de arquivos via MCP.

Ferramentas disponíveis:
- `read_file` — ler conteúdo de arquivo
- `read_multiple_files` — ler múltiplos arquivos de uma vez
- `write_file` — escrever arquivo (cria ou sobrescreve)
- `create_directory` — criar diretório
- `list_directory` — listar conteúdo de diretório
- `directory_tree` — árvore completa de diretórios
- `move_file` — mover ou renomear arquivo
- `search_files` — buscar arquivos por padrão glob
- `get_file_info` — metadados do arquivo (tamanho, datas)

Diretrizes de uso:
- Prefira `read_multiple_files` para análises que exigem comparar múltiplos arquivos
- Antes de sobrescrever (`write_file`): confirme com o usuário se não é uma edição incremental
- Use `directory_tree` para entender a estrutura antes de começar a trabalhar
- Para buscas, use `search_files` com padrões glob específicos

Segurança:
- Não acesse arquivos fora do diretório configurado
- Nunca leia ou escreva arquivos .env, .pem, secrets, ou credenciais
- Operações destrutivas (delete, overwrite): confirme com o usuário
```

---

## Casos de Uso por Squad

| Squad | Uso típico |
|-------|-----------|
| Todos | Análise de estrutura de projeto, leitura em batch de arquivos |
| IA/Dados | Leitura de datasets, notebooks, arquivos de configuração de modelos |
| DevOps | Leitura de configs de infraestrutura (Terraform, K8s manifests) |
| Produto | Leitura de documentos de spec e ADRs para contexto |
