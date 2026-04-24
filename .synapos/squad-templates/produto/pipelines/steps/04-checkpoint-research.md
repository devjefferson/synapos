---
id: 04-checkpoint-research
name: "Validação da Pesquisa"
execution: checkpoint
---

# Checkpoint — Validação da Pesquisa

Antes de partir para a especificação, o usuário deve validar a direção da pesquisa.

## Apresentar resumo

Leia os documentos gerados e apresente:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO DA PESQUISA

Mercado: {1-2 frases do market-analysis}

Top 3 insights competitivos:
  1. {insight}
  2. {insight}
  3. {insight}

Personas identificadas:
  • {Persona 1}: {job principal em 1 linha}
  • {Persona 2}: {job principal em 1 linha}

Principal oportunidade:
  {1-2 frases do business-context}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Perguntas ao usuário

```
A pesquisa está alinhada com o que você esperava?

[1] Sim — prosseguir para a spec
[2] Ajustar foco — o que quer mudar?
[3] Adicionar contexto — há informação que eu não tenho ainda
```

**Se [2] ou [3]:** Registre o ajuste em `docs/.squads/sessions/{feature-slug}/memories.md` e retorne ao step 02-contexto-negocio com o novo foco.

**Se [1]:** Registre em `docs/.squads/sessions/{feature-slug}/memories.md`:
```markdown
## Pesquisa aprovada — {YYYY-MM-DD}
Direção validada: {resumo do que foi confirmado}
```

Prossiga para o step 05-spec.
