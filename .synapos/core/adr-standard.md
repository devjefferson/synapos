---
name: synapos-adr-standard
version: 2.0.0
description: ADRs como contratos arquiteturais — localização, índice, consulta, conformidade, conflito e atualização
---

# ADR — CONTRATO ARQUITETURAL

> **Uma regra que pode ser ignorada não é uma regra.**
> ADR ativa é a autoridade máxima de decisão (compliance-protocol §1). Vale em **todos** os tracks — inclusive quick.
> O custo fica baixo porque a consulta é pelo índice; a ADR completa só é lida quando relevante.

---

## 1. LOCALIZAÇÃO E STATUS

**Onde procurar** (lista única — todos os comandos usam esta):

```
docs/adrs/ · docs/adr/ · docs/tech/adr/ · docs/tech-context/adr/ · adr/
+ qualquer .md em docs/ cujo nome contenha "adr", "ADR" ou "decision"
```

**Normalização de status:**

| Valor encontrado | Status Synapos | Efeito |
|---|---|---|
| accepted · aceito · aceita · ativo · ativa · approved · aprovado | `active` | **regra vigente** |
| proposed · proposto · draft · rascunho | `proposed` | informativa — não bloqueia, mas não pode ser contrariada sem aviso |
| deprecated · depreciado · superseded · substituído | `inactive` | ignorada (seguir a que a substitui) |
| ausente | `active` | na dúvida, é regra |

---

## 2. ÍNDICE — `docs/_memory/adr-index.md`

Uma linha por ADR. É o que as roles consultam; a ADR completa é lida só se a linha for relevante.

```markdown
---
scanned_at: YYYY-MM-DD
sources: [docs/adrs/]
---
# ADR Index

| id | status | domínio | escopo (paths/temas) | regra em 1 linha | arquivo |
|----|--------|---------|----------------------|------------------|---------|
| adr-003 | active | frontend | formulários, src/**/forms | Forms usam react-hook-form + zod | docs/adrs/adr-003-forms.md |
| adr-007 | active | backend, auth | autenticação, src/api/** | JWT stateless; sem sessão server-side | docs/adrs/adr-007-jwt.md |
```

- Construído por `/setup:discover` ou na primeira tarefa que precisar dele.
- Atualizado incrementalmente quando um arquivo de ADR é criado/alterado (compare a listagem e as datas com `scanned_at` — context-engine §5.2).
- `regra em 1 linha` é extraída da seção `Decisão` — não reescreva o sentido.

---

## 3. CONSULTA

Antes de qualquer decisão que a ADR possa afetar (arquitetura, lib, padrão, estrutura, contrato, fluxo de dados, auth, UI base):

1. Filtre o índice: `status: active|proposed` ∩ domínio do step ∩ escopo que toca a tarefa. Case pelo **tema da decisão** que a tarefa exige; path sozinho não basta (mudar um texto numa página não toca uma ADR de dados só porque o glob do path casa).
2. Leia a ADR completa **somente** das linhas filtradas.
3. Aplique a decisão durante a execução — não apenas cite.
4. Registre o `ADR CHECK` (compliance-protocol §4).

ADR sem `domain:` no frontmatter vale para todos os domínios.

---

## 4. CONFLITO — BLOQUEIA A DECISÃO

Se a tarefa exige algo que contraria uma ADR `active`:

```
[ADR-CONFLICT] {adr-id} — {título}
Decisão vigente: {regra}
O que a tarefa exige: {o que conflita}
Por que não dá para cumprir a ADR: {motivo concreto}
Proposta: A) ajustar a tarefa à ADR  B) alterar a ADR ({mudança})  C) nova ADR que supersede {adr-id}
Aguardando aprovação.
```

- Proibido: exceção informal ("neste caso faço diferente"), implementar e deixar a ADR desatualizada, escolher a alternativa "melhor" por preferência.
- Contra ADR `proposed`: sinalize `[DECISÃO PENDENTE]` (não bloqueia como ADR ativa, mas não segue em silêncio).

---

## 5. MUDANÇA ARQUITETURAL EXIGE ATUALIZAÇÃO DOCUMENTAL

Quando o usuário aprova B ou C:

1. Atualize a ADR (B) ou crie a nova com `supersedes: {adr-id}` e marque a antiga `superseded` (C).
2. Atualize a linha no `adr-index.md`.
3. Marque entradas de memória que citam a ADR antiga como `status: superseded` (context-engine §5.2).
4. Só então implemente.

Estado final: **uma única fonte de verdade** — nunca "ADR antiga + implementação nova".

---

## 6. REVIEW

Todo step de review verifica, para as ADRs relevantes:

- a implementação respeita a decisão;
- não introduz padrão incompatível nem arquitetura paralela;
- não contorna a decisão por outro caminho;
- não cria convenção nova sem ADR/justificativa.

Violação = BLOCKER.

---

## 7. TEMPLATE

```markdown
---
id: adr-{NNN}
title: "{Título da decisão}"
domain: [backend, frontend, fullstack, mobile, infra, data, produto, auth]   # ou ["*"]
scope: [src/api/**, autenticação]    # opcional — paths/temas afetados (melhora o índice)
status: proposed | accepted | deprecated | superseded
date: YYYY-MM-DD
supersedes: adr-{NNN}   # opcional
---

# ADR-{NNN}: {Título}

## Status
{proposed | accepted | deprecated | superseded}

## Contexto
{problema e forças em jogo}

## Decisão
{"Decidimos X porque Y" — frase ativa; é a fonte da "regra em 1 linha"}

## Consequências
**Positivas:** {…}
**Negativas / Trade-offs:** {…}

## Alternativas Consideradas
- {alternativa} — descartada porque {motivo}
```

Valores de `domain`: `backend` · `frontend` · `fullstack` · `mobile` · `infra` · `data` · `produto` · `auth` · `*` (todos — use com moderação).
