---
name: fetch-url
displayName: "Fetch URL"
version: "1.0.0"
type: mcp
description: "Leitura de URLs e extração de conteúdo web — páginas, documentações e APIs públicas"
categories: [web, research, scraping, documentation]
domains: [produto, backend, ia-dados, fullstack]
---

## O Que Faz

Habilita o agent a ler e extrair conteúdo de qualquer URL acessível publicamente.

**Com esta skill, o agent pode:**
- Ler documentação técnica de qualquer URL
- Extrair conteúdo de páginas web para análise
- Consumir endpoints de APIs públicas (REST/JSON)
- Ler changelogs e release notes de bibliotecas
- Analisar landing pages de concorrentes

**Diferença de `brave-search`:** `fetch-url` lê o conteúdo completo de uma URL específica. `brave-search` busca URLs relevantes via query. Use ambos em conjunto: busca para encontrar, fetch para ler.

**Sem esta skill:** O agent não consegue acessar URLs externas — apenas usa conhecimento do treinamento.

---

## Instalação

### 1. Configurar MCP no IDE

**Claude Code** — adicione em `.claude/settings.local.json`:
```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

Alternativa com npx:
```json
{
  "mcpServers": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```

**Cursor** — adicione em `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

### 2. Pré-requisito para `uvx`

```bash
pip install uv
# ou
brew install uv
```

### 3. Reiniciar o IDE

---

## Configuração MCP

```yaml
type: mcp
mcp_config:
  command: uvx
  args: ["mcp-server-fetch"]
```

---

## Variáveis de Ambiente

Nenhuma variável de ambiente necessária.

---

## Instruções para o Agent

Quando a skill `fetch-url` estiver ativa:

```
SKILL ATIVA: fetch-url

Você tem acesso à ferramenta `fetch` para ler conteúdo de URLs.

Ferramentas disponíveis:
- `fetch` — busca o conteúdo de uma URL e retorna como texto/markdown

Diretrizes de uso:
- Para documentações: busque a URL da doc oficial, não mirrors ou caches
- Para APIs públicas: verifique se a URL retorna JSON e parse adequadamente
- Para páginas longas: identifique as seções relevantes em vez de processar tudo
- Respeite robots.txt — não use para scraping massivo ou automatizado
- Cite sempre a URL fonte dos dados extraídos

Combinação recomendada com brave-search:
1. Use brave-search para encontrar as URLs mais relevantes
2. Use fetch-url para ler o conteúdo completo das páginas encontradas

Limitações:
- Não acessa páginas que requerem autenticação
- Não executa JavaScript (use playwright-browser para SPAs)
- Conteúdo pode estar desatualizado (cache)
```

---

## Casos de Uso por Squad

| Squad | Uso típico |
|-------|-----------|
| Produto | Ler landing pages de concorrentes, extrair features e pricing |
| IA/Dados | Ler papers, documentação de modelos, changelogs de APIs de IA |
| Backend | Ler documentação de APIs externas, RFC specs, changelogs de libs |
| Frontend | Ler documentação de frameworks, MDN, spec de CSS/HTML |
