---
id: 03-investigacao
name: "Investigação"
agent: leo-engenheiro
execution: inline
model_tier: powerful
needs_spec: true
output_files:
  - context.md
success_criteria:
  - "context.md segue o esquema canônico e começa com ## Resumo de até 5 linhas"
  - "## Meta tem resultado verificável (não apenas 'melhorar' ou 'facilitar')"
  - "Nenhuma pergunta ao usuário repete algo já respondido por spec.md, handoff.md, [TASK] ou memória"
  - "## ADRs Relevantes lista as ADRs do índice que tocam a feature, ou 'nenhuma aplicável'"
  - "## Validação tem critério verificável de 'done'"
---

# Investigação

Transformar a entrada da feature em contexto aprovado, salvo em `context.md`.

## 1. Partir do que já existe

- **spec.md / handoff.md na session** (Produto já trabalhou): são a fonte de Motivação, Meta, Escopo e critérios. Não reconstrua — referencie e extraia.
- **context.md parcial** (criado pelo brainstorm): complete as seções faltantes preservando o que existe; não o substitua.
- **Memória:** normativos e padrões relevantes do `[MEMORY_MAP]` (context-engine §3.2).
- **ADRs:** linhas do `adr-index.md` que tocam a feature. Índice ausente e existem ADRs no projeto → construa o índice (adr-standard §2).
- **Briefing técnico** (`docs/tech-context/briefing/critical-rules.md`), se existir.

## 2. Mapear lacunas

Para cada item — Motivação, Meta, Escopo IN/OUT, Dependências, Limitações, Validação — marque: **coberto** (cite a fonte) ou **lacuna**.

## 3. Perguntar só as lacunas

Até 5 perguntas, as que bloqueiam uma arquitetura correta. Nenhuma lacuna → não pergunte; apresente o entendimento para confirmação.

```
Entendimento:
Feature: {nome} · Motivação: {…} · Meta: {…}
Fontes: {spec.md, memória X, ADR Y}

Preciso esclarecer:
1. {lacuna mais crítica}
…
```

## 4. Gerar context.md

Após confirmação do usuário:

```markdown
# Contexto: {feature}

## Resumo
{≤ 5 linhas: o que é · por quê · decisões críticas · o que não fazer}

## Motivação
## Meta
{resultado verificável}
## Escopo
**IN:** … **OUT:** …
## Decisões
{### [DECISION] … — só decisões tomadas com o usuário, com motivo}
## O que não fazer
## ADRs Relevantes
{adr-id — regra em 1 linha | nenhuma aplicável}
## Dependências
## Limitações
## Validação
## Questões Abertas
## Fontes
{spec.md · handoff.md · arquivos lidos}
```

Se algo discutido contradiz documentação de requisitos existente, peça permissão antes de atualizá-la.

**⛔ Aguarde o usuário aprovar o context.md antes de prosseguir.**
