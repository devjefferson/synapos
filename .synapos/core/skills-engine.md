---
name: synapos-skills-engine
version: 1.0.0
description: Engine de gerenciamento de skills — MCP, scripts e instruções de comportamento
---

# SYNAPOS SKILLS ENGINE v1.0.0

> Skills são capacidades adicionais injetadas nos agents durante execução de pipelines.
> Tipos: MCP (servidor de ferramentas), script (Node/Python/Bash), prompt (instruções).

---

## ESTRUTURA DE UMA SKILL

Toda skill vive em `.synapos/skills/{skill-name}/` com um arquivo `SKILL.md`:

```markdown
---
name: skill-name
displayName: "Nome da Skill"
version: "1.0.0"
type: mcp | script | hybrid | prompt
description: "O que esta skill faz"
categories: [search, browser, database, file, communication, ...]
---

## O Que Faz
{descrição do que a skill habilita}

## Instalação
{passos para instalar/configurar}

## Configuração MCP (se type: mcp)
{configuração para settings.json / mcp.json do IDE}

## Variáveis de Ambiente (se necessário)
{lista de env vars necessárias}

## Instruções para o Agent
{instruções de comportamento adicionadas ao contexto do agent quando esta skill está ativa}
```

---

## TIPOS DE SKILL

### `mcp` — Model Context Protocol Server
Adiciona ferramentas via protocolo MCP (compatível com Claude, Cursor, etc.)

Exemplo:
```yaml
type: mcp
mcp_config:
  command: npx
  args: [-y, "@modelcontextprotocol/server-brave-search"]
  env:
    BRAVE_API_KEY: ${BRAVE_API_KEY}
```

### `script` — Script executável
Executa via ferramenta Bash do agente.

Exemplo:
```yaml
type: script
script:
  runtime: node | python | bash
  file: scripts/run.js
  args: []
```

### `prompt` — Instruções de comportamento
Adiciona instruções ao contexto do agent (sem ferramentas externas).

Exemplo: instruções de formatação, tom de voz, padrões de output.

### `hybrid` — MCP + Script
Combina servidor MCP com scripts auxiliares.

---

## RESOLUÇÃO DE SKILLS (antes de executar pipeline)

O pipeline-runner executa este protocolo antes de cada pipeline:

### 1. Ler skills do squad.yaml
```yaml
# Em squad.yaml
skills:
  - brave-search
  - playwright-browser
```

### 2. Para cada skill listada:
- Verificar se `.synapos/skills/{skill}/SKILL.md` existe — diretório real **ou symlink**
- Se não existe → apresentar opções:
  ```
  ⚠ Skill '{skill}' não está instalada.
  [1] Instalar agora
  [2] Pular (o agent funcionará sem esta skill)
  [3] Cancelar execução
  ```

### 3. Para skills do tipo `mcp`:
- Verificar se está configurada no IDE (settings.json / mcp.json)
- Se não → mostrar instrução de configuração

### 4. Para skills do tipo `script`:
- Verificar se runtime está disponível (node, python, bash)
- Verificar dependências (package.json, requirements.txt)

---

## INJEÇÃO DE SKILLS NOS AGENTS

Quando um step tem skills, o pipeline-runner injeta no contexto do agent:

```
[Agent Persona]
[Contexto do Squad]
[Memória do Squad]
[Outputs Anteriores]
[Instrução do Step]
--- SKILLS ATIVAS ---
[Instruções da Skill 1]
[Instruções da Skill 2]
```

A ordem de injeção é: agent → step → skills (na ordem declarada).

---

## INSTALAÇÃO DE NOVA SKILL

### Passo 1 — Criar estrutura

Duas formas válidas de instalar uma skill:

**Diretório local:**
```
.synapos/skills/{skill-name}/
├── SKILL.md          ← definição
└── scripts/          ← scripts (se type: script ou hybrid)
    └── run.js
```

**Symlink** (para skills compartilhadas entre projetos):
```bash
ln -s /caminho/para/skill-global/{skill-name} .synapos/skills/{skill-name}
```
O resolver trata symlinks exatamente como diretórios reais — nenhuma diferença de comportamento.

### Passo 2 — Para skills MCP
Adicionar ao arquivo de configuração do IDE:
- **Claude Code**: `.claude/settings.local.json`
- **Cursor**: `.cursor/mcp.json`
- **Antigravity**: configuração MCP do IDE

Formato (Claude Code):
```json
{
  "mcpServers": {
    "skill-name": {
      "command": "npx",
      "args": ["-y", "@package/mcp-server"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

### Passo 3 — Variáveis de ambiente
Adicione ao `.env` do projeto (nunca no código):
```
SKILL_API_KEY=sua_chave_aqui
```

---

## SKILLS SUGERIDAS POR DOMÍNIO

| Domínio | Skill | Uso |
|---------|-------|-----|
| Produto | brave-search | Pesquisa de mercado e benchmarks |
| Produto | fetch-url | Análise de concorrentes |
| Frontend | playwright | Testes E2E, screenshots |
| Backend | database-query | Query direta ao banco (dev) |
| Todos | file-system | Leitura/escrita de arquivos |
| Todos | github | Criação de issues, PRs |

---

## REGRAS

- Skills são **opcionais** — o agent funciona sem elas, com capacidade reduzida
- **Quando uma skill está ativa, o agent DEVE usá-la** — nunca execute manualmente o que uma skill já oferece
- Se uma skill cobre a tarefa em execução (busca, browser, arquivo, GitHub etc.), ela é o caminho obrigatório — não o opcional
- Nunca adicione uma API key diretamente em SKILL.md — use variáveis de ambiente
- Skills de `mcp` requerem restart do IDE após configuração
- Documente em SKILL.md o que muda no comportamento do agent com e sem a skill
