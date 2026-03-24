---
name: synapos-versioning
version: 1.0.0
description: Protocolo de versionamento semântico do Synapos Framework
---

# SYNAPOS VERSIONING PROTOCOL v1.0.0

> O Synapos usa **Semantic Versioning (semver)**: `MAJOR.MINOR.PATCH`
> Versão atual sempre em: `.synapos/VERSION`
> Inventário completo em: `.synapos/.manifest.json`

---

## O QUE VERSIONAR

O Synapos tem **4 níveis de versão independentes**:

| Nível | Arquivo | Controla |
|-------|---------|---------|
| **Framework** | `.synapos/VERSION` + `.manifest.json` | Versão global do framework |
| **Core** | frontmatter de cada `core/*.md` | Mudanças no orchestrator, runner, gates |
| **Template** | `template.yaml` de cada squad | Mudanças nos templates de squad |
| **Agent** | frontmatter de cada `*.agent.md` | Mudanças em agents individuais |

---

## REGRAS DE SEMVER

### MAJOR (X.0.0) — quebraria algo existente

**Framework:**
- Mudança no formato do `orchestrator.md` que altera o protocolo de boot
- Mudança no contrato do `pipeline-runner.md` (campos obrigatórios de step, state.json)
- Mudança no formato de `.agent.md` que quebra agents existentes

**Template:**
- Mudança no formato de `template.yaml` que quebra squads criados com versão anterior

**Agent:**
- Remoção de seção obrigatória (Persona, Princípios, Framework Operacional)
- Mudança de role que altera fundamentalmente as tasks do agent

### MINOR (x.Y.0) — adiciona sem quebrar

**Framework:**
- Novo squad template (fullstack, mobile, devops, etc.)
- Novo tipo de gate no gate-system
- Novo tipo de skill no skills-engine
- Novo adapter IDE

**Template:**
- Novo agent opcional no template
- Novo pipeline disponível

**Agent:**
- Nova task adicionada
- Novo exemplo de output
- Novo anti-pattern documentado

### PATCH (x.y.Z) — corrige sem quebrar

**Framework:**
- Clareza de texto no orchestrator
- Correção de exemplo no pipeline-runner
- Melhoria de guia

**Template:**
- Ajuste de descrição
- Refinamento de configuração de modo

**Agent:**
- Refinamento de persona ou princípios
- Melhoria de exemplo de output
- Correção de vocabulário
- Adição de quality criteria

---

## PROTOCOLO DE BUMP

### Passo 1 — Identificar o escopo

Responda:
- O que mudou? (core, template, agent, ou framework inteiro?)
- É MAJOR, MINOR ou PATCH? (use as regras acima)

### Passo 2 — Atualizar o(s) arquivo(s) alterado(s)

Atualize o campo `version` no frontmatter do arquivo modificado:
```yaml
---
version: 1.1.0   ← novo valor
---
```

### Passo 3 — Atualizar `.manifest.json`

Atualize a versão do componente alterado e a versão do framework se necessário:

```json
{
  "framework": { "version": "1.1.0", "released_at": "YYYY-MM-DD" },
  "agents": {
    "frontend": {
      "rodrigo-react": "1.1.0"
    }
  }
}
```

**Regra de propagação:**
- Mudança em **agent** → bumpa o agent + framework PATCH (no mínimo)
- Mudança em **template** → bumpa o template + framework MINOR (no mínimo)
- Mudança em **core** → bumpa o core file + framework (conforme severidade)

### Passo 4 — Atualizar `.synapos/VERSION`

```
1.1.0
```

### Passo 5 — Registrar no `CHANGELOG.md`

Adicione uma entrada na seção `[Não lançado]` ou crie uma nova seção com a versão:

```markdown
## [1.1.0] — YYYY-MM-DD

### Modificado
- `rodrigo-react` v1.1.0 — adicionados exemplos de React Server Components

### Corrigido
- `pipeline-runner.md` — clareza no protocolo de veto conditions
```

---

## COMPATIBILIDADE DE SQUADS

Squads criados guardam em `squad.yaml` a versão do template usado:

```yaml
template_version: "1.0.0"   ← versão no momento da criação
```

### Quando um template muda de versão:

**PATCH** → squads existentes **não precisam** migrar. Funciona como antes.

**MINOR** → squads existentes funcionam, mas não têm os novos agents/pipelines.
- Aviso no init: "Template `frontend` v1.1.0 disponível. Seu squad usa v1.0.0."
- Usuário escolhe: migrar ou continuar com a versão atual.

**MAJOR** → squads existentes podem ter comportamento alterado.
- Aviso obrigatório no init com descrição do que mudou.
- Não migre automaticamente — exija confirmação explícita.

---

## VERIFICAÇÃO DE VERSÃO NO INIT

O `orchestrator.md` deve, durante o boot, comparar:

```
Framework instalado:    .synapos/VERSION         → "1.0.0"
Manifest registrado:    .synapos/.manifest.json  → { "framework": { "version": "1.0.0" } }
```

Se divergirem: avise que o manifest está desatualizado e execute o bump.

---

## VERSIONAMENTO DE SQUADS INSTANCIADOS

Squads em `.synapos/squads/{slug}/` **não têm versão semver** — eles têm **histórico de runs**.

O versionamento de um squad é feito por:
- `output/{run-id}/` → cada execução é um snapshot imutável
- `output/{run-id}/state.json` → estado completo daquela execução
- `_memory/memories.md` → aprendizados cumulativos (não versionado, é vivo)

Para "versionar" o estado de um squad: gere um run e ele fica permanente em `output/`.

---

## EXEMPLO COMPLETO DE BUMP MINOR

Cenário: adicionado agent `lucas-lint` ao template `frontend`.

```bash
# 1. Criar o arquivo do agent
.synapos/squad-templates/frontend/agents/lucas-lint.agent.md  (version: 1.0.0)

# 2. Atualizar template.yaml
version: "1.1.0"
agents:
  optional:
    - id: lucas-lint   ← novo

# 3. Atualizar .manifest.json
"templates": { "frontend": "1.1.0" }
"agents": { "frontend": { "lucas-lint": "1.0.0" } }
"framework": { "version": "1.1.0", "released_at": "2026-04-01" }

# 4. Atualizar .synapos/VERSION
1.1.0

# 5. CHANGELOG.md
## [1.1.0] — 2026-04-01
### Adicionado
- `lucas-lint` v1.0.0 — Especialista em Linting/Code Style ao squad Frontend
- Template `frontend` v1.1.0 — lucas-lint adicionado como opcional
```
