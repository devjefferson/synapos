---
name: playwright-browser
displayName: "Playwright Browser"
version: "1.0.0"
type: mcp
description: "Automação de browser via Playwright — navegação, screenshots, testes E2E e extração de conteúdo"
categories: [browser, testing, automation, scraping]
domains: [frontend, fullstack, mobile, produto]
---

## O Que Faz

Habilita o agent a controlar um browser real (Chromium, Firefox, WebKit) via Playwright.

**Com esta skill, o agent pode:**
- Tirar screenshots de qualquer URL (útil para análise de concorrentes e UX)
- Executar e escrever testes E2E interativos
- Navegar em SPAs e aplicações que requerem JavaScript
- Preencher formulários e simular interações do usuário
- Extrair conteúdo de páginas que não têm API

**Sem esta skill:** O agent não consegue interagir com browsers; apenas analisa código estático.

---

## Instalação

### 1. Instalar dependências

```bash
npm install -g @playwright/mcp
npx playwright install chromium
```

### 2. Configurar MCP no IDE

**Claude Code** — adicione em `.claude/settings.local.json`:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

**Cursor** — adicione em `.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

### 3. Reiniciar o IDE

---

## Configuração MCP

```yaml
type: mcp
mcp_config:
  command: npx
  args: ["@playwright/mcp@latest"]
```

---

## Variáveis de Ambiente

Nenhuma variável de ambiente necessária para uso básico.

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `PLAYWRIGHT_BROWSERS_PATH` | ❌ | Caminho customizado para binários de browser |

---

## Instruções para o Agent

Quando a skill `playwright-browser` estiver ativa:

```
SKILL ATIVA: playwright-browser

Você tem acesso a ferramentas de automação de browser via Playwright.

Ferramentas disponíveis:
- `browser_navigate` — navegar para uma URL
- `browser_screenshot` — capturar screenshot da página atual
- `browser_click` — clicar em elemento
- `browser_type` — digitar texto em campo
- `browser_wait` — aguardar elemento ou condição

Diretrizes de uso:
- Para testes E2E: use seletores semânticos (role, label, text) em vez de CSS/XPath
- Para screenshots de análise: capture em viewport 1280x800 (desktop) e 390x844 (mobile)
- Para extração de conteúdo: prefira estrutura semântica (headings, listas) ao HTML bruto
- Sempre feche o browser após finalizar (evite processos órfãos)

Ao escrever testes:
- Um teste = um comportamento do usuário
- Prefira `getByRole`, `getByLabel`, `getByText` a seletores de CSS
- Adicione waitFor explícito para elementos dinâmicos
- Testes E2E são lentos — use com parcimônia, foque nos fluxos críticos
```

---

## Casos de Uso por Squad

| Squad | Uso típico |
|-------|-----------|
| Frontend | Escrever e executar testes E2E, verificar regressões visuais |
| Produto | Screenshots de concorrentes, análise de UX flows |
| Fullstack | Testes de integração FE↔BE com browser real |
| QA | Automação de smoke tests pós-deploy |
