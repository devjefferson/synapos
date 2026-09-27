---
id: pattern-discovery
name: "Descoberta de Padrões do Projeto"
execution: inline
model_tier: powerful
success_criteria:
  - "Âncora de padrão emitida com as 7 respostas preenchidas por evidência (caminho de arquivo) ou marcadas [CONTEXT_REQUIRED]"
  - "roles/{domain}.md existe, está fresco e cobre a área da tarefa"
  - "Nenhum item da role memory foi registrado sem caminho de evidência"
---

# Descoberta de Padrões do Projeto

> **Observe primeiro. Implemente depois.**
> Este step existe para que nenhuma role crie o que o projeto já tem.
> Resultado persistente: `docs/_memory/roles/{domain}.md` (role memory). Resultado da tarefa: **Âncora de padrão**.

---

## 1. Decidir se precisa escanear

Leia `docs/_memory/roles/{domain}.md` (se existir) e verifique (context-engine §5.2 e §6):

| Situação | Ação |
|---|---|
| Não existe | Discovery completo do domínio (§2) — **somente leitura do código** |
| Existe, fresco, `coverage` inclui a área da tarefa | Não escaneie. Vá direto para §3 |
| Existe, mas a área da tarefa não está em `coverage` | Discovery **só dessa área**; acrescente ao arquivo |
| `sources` mais novos que `scanned_at` | Atualize **só as seções afetadas** |

Log: `🔎 [DISCOVERY] {completo | área {x} | incremental | pulado — role memory fresca}`

---

## 2. Discovery

Registre **apenas o que encontrar, sempre com caminho**. Não encontrou → `não encontrado`. Nunca descreva o que "geralmente existe".

### 2a. Domínios de UI (frontend, mobile, fullstack com UI)

Procure, nesta ordem (pastas de componentes compartilhados, `components/ui`, `packages/ui`, arquivos de tema/tokens, config do Tailwind/CSS vars, `layout.*`, Storybook, páginas mais recentes):

```
 1. Design system        — lib (shadcn, MUI, Chakra, próprio…), onde vive, como é importado
 2. Componentes          — os reutilizados (≥2 usos ou em pasta compartilhada): nome · caminho · para quê
 3. Layouts              — layouts de rota/página e quando cada um é usado
 4. Containers           — componente/classe que limita largura e padding (ex: <Container>, max-w-*)
 5. Spacing              — escala predominante (tokens, classes gap/p/m mais usadas)
 6. Tipografia           — componentes/classes de heading e texto
 7. Cores                — tokens/variáveis; nunca hex solto se existem tokens
 8. Responsivo           — breakpoints e padrões usados (grid, stack, hidden md:…)
 9. Loading              — componente/arquivo usado (Skeleton, Spinner, loading.tsx)
10. Empty state          — componente/padrão usado
11. Error state          — componente/padrão usado (error.tsx, ErrorBoundary, Alert)
12. Formulários          — lib, componentes de campo, validação, exibição de erro, submit
13. Navegação            — sidebar, header, tabs, breadcrumb, links
14. Composição de página — o esqueleto típico: ex. PageLayout > PageHeader > Container > Card
```

Escolha **1–3 páginas de referência** (as mais representativas e recentes de cada área) e descreva a composição de cada uma em até 8 linhas.

### 2b. Demais domínios (backend, devops, dados…)

```
módulo de referência · camadas (controller/service/repository…) · validação · tratamento de erro
· acesso a dados · autenticação/autorização · logging · testes (onde, como, helpers) · convenções de nome
```

---

## 3. Âncora de padrão da tarefa

Com a role memory, responda para a tarefa atual — **cada resposta com caminho**:

```
ÂNCORA DE PADRÃO — {tarefa}
1. Mais parecido no projeto:   {página/módulo} — {caminho}
2. Container/layout a reutilizar: {componente} — {caminho}
3. Componentes a reutilizar:    {lista com caminhos}
4. Padrão visual/estrutural seguido: {qual e onde está}
5. Abstração existente para isto: {hook/serviço/componente} — {caminho} | nenhuma
6. Regra documentada aplicável:  {ADR/skill/doc} | nenhuma
7. O que será novo (e por quê):  {item — por que nada existente serve} | nada novo
```

Se alguma resposta não tem evidência → `[CONTEXT_REQUIRED] {pergunta}` e resolva (ler mais código da área, perguntar ao usuário) **antes** de encerrar o step. Nenhuma role de implementação começa com âncora incompleta.

A âncora vai no `## HANDOFF` → `O que o próximo agente precisa saber`, e a role de arquitetura a copia para `architecture.md ## Referência no Projeto`.

---

## 4. Role memory — `docs/_memory/roles/{domain}.md`

Crie ou atualize (mantenha ≤ ~150 linhas — é um mapa, não documentação):

```markdown
---
domain: {domain}
scanned_at: YYYY-MM-DD
sources: [{pastas/arquivos de onde o conhecimento veio}]
coverage: [{áreas mapeadas, ex: src/app/(private)/**}]
skills: [{skills do índice relevantes para esta role}]
---
# Role Memory — {domain}

## Design system
{lib · caminho · forma de importar}

## Referências
| área | referência | composição |
|------|-----------|-----------|
| {listagens} | {caminho} | {PageLayout > PageHeader > Container > Card > DataTable} |

## Catálogo de reuso
| componente | caminho | usar para |
|-----------|---------|-----------|

## Layout e containers
## Spacing · tipografia · cores
## Responsivo
## Estados (loading · empty · error)
## Formulários
## Navegação

## Regras e aprendizados da role
{entradas tipadas — formato de context-engine §2}
```

Para domínios não-UI, troque as seções de UI pelas do §2b.
