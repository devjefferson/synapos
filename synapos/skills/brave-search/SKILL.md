---
name: brave-search
displayName: "Brave Search"
version: "1.0.0"
type: mcp
description: "Pesquisa web via Brave Search API — resultados reais sem rastreamento"
categories: [search, research, web]
domains: [produto, ia-dados, backend, fullstack]
---

## O Que Faz

Habilita o agent a realizar buscas reais na web usando a API do Brave Search.

**Com esta skill, o agent pode:**
- Buscar informações atualizadas sobre qualquer tópico
- Pesquisar benchmarks e concorrentes para análises de produto
- Encontrar documentação técnica, artigos e discussões
- Validar dados de mercado em tempo real

**Sem esta skill:** O agent usa apenas seu conhecimento de treinamento (sem dados atualizados).

---

## Instalação

### 1. Obter API Key

Crie uma conta e gere a API key em: https://brave.com/search/api/

O plano gratuito inclui **2.000 queries/mês**.

### 2. Configurar variável de ambiente

Adicione ao `.env` do projeto:
```
BRAVE_API_KEY=sua_chave_aqui
```

### 3. Configurar MCP no IDE

**Claude Code** — adicione em `.claude/settings.local.json`:
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "${BRAVE_API_KEY}"
      }
    }
  }
}
```

**Cursor** — adicione em `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "sua_chave_aqui"
      }
    }
  }
}
```

### 4. Reiniciar o IDE

Skills MCP requerem restart do IDE após configuração.

---

## Configuração MCP

```yaml
type: mcp
mcp_config:
  command: npx
  args: ["-y", "@modelcontextprotocol/server-brave-search"]
  env:
    BRAVE_API_KEY: ${BRAVE_API_KEY}
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `BRAVE_API_KEY` | ✅ | Chave de API do Brave Search |

---

## Instruções para o Agent

Quando a skill `brave-search` estiver ativa:

```
SKILL ATIVA: brave-search

Você tem acesso à ferramenta `brave_web_search` para realizar buscas reais na web.

Diretrizes de uso:
- Use para dados que podem estar desatualizados no seu treinamento (preços, versões, tendências)
- Prefira queries específicas a queries genéricas: "React 19 breaking changes 2025" em vez de "React mudanças"
- Cite as fontes dos dados encontrados (URL + data de publicação quando disponível)
- Para análises de produto, busque: concorrentes diretos, benchmarks de mercado, reviews de usuários
- Limite: não use para dados que você já sabe com certeza — priorize buscas para validar ou atualizar

Quando retornar resultados:
- Filtre pela relevância e data de publicação
- Sintetize as fontes, não as transcreva
- Indique se os dados encontrados contradizem seu conhecimento prévio
```

---

## Casos de Uso por Squad

| Squad | Uso típico |
|-------|-----------|
| Produto | Benchmarks de concorrentes, pesquisa de mercado, validação de UX patterns |
| IA/Dados | Papers recentes, documentação de modelos, melhores práticas de MLOps |
| Backend | Vulnerabilidades de segurança, changelogs de bibliotecas, Stack Overflow |
| Frontend | Compatibilidade de browsers, atualizações de frameworks |
