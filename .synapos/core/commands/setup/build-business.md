---
name: synapos-setup-build-business
version: 3.0.0
description: Gera documentação de negócio do projeto em docs/business/
---

# /setup:build-business

Gera `docs/business/` com visão, personas, OKRs e jornadas.

---

## PROTOCOLO

### 1. Verificar pré-requisitos

- `docs/_memory/company.md` existe e está preenchido além do nome? Se vazio → sugira preencher manualmente antes.

### 2. Perguntar o que gerar

```
AskUserQuestion({
  question: "Docs de negócio — quais arquivos gerar?",
  options: [
    { label: "🎯 vision.md", description: "Visão, missão, proposta de valor" },
    { label: "👥 personas.md", description: "Quem são os usuários alvo" },
    { label: "📊 okrs.md", description: "Objetivos e métricas" },
    { label: "🗺️ journeys.md", description: "Jornadas de usuário principais" },
    { label: "📋 Todos", description: "Gerar os 4 arquivos" }
  ],
  multiSelect: true
})
```

### 3. Coletar contexto

Para cada arquivo escolhido, colete o mínimo via AskUserQuestion ou texto livre. Exemplos:

- `vision.md`: "Em 1 frase, qual problema o produto resolve e para quem?"
- `personas.md`: "Quais 1-3 tipos de usuário? (breve descrição de cada)"
- `okrs.md`: "Qual objetivo do trimestre e como medir?"
- `journeys.md`: "Qual é a jornada mais crítica do usuário? (passo a passo)"

Se o usuário não tem respostas prontas, gere um template vazio com prompts claros de preenchimento.

### 4. Gerar arquivos

**`docs/business/vision.md`:**
```markdown
# Visão

## Problema
{o que resolve}

## Para quem
{usuário alvo principal}

## Proposta de valor
{por que escolhem isto e não alternativa}

## Diferencial
{o que só nós fazemos bem}
```

**`docs/business/personas.md`:**
```markdown
# Personas

Para cada persona:

## {nome da persona}
- **Contexto:** {situação profissional/pessoal}
- **Objetivo:** {o que quer alcançar com o produto}
- **Dor:** {o que está travando}
- **Comportamento:** {como usa ferramentas similares}
```

**`docs/business/okrs.md`:**
```markdown
# OKRs — {trimestre atual}

## Objetivo
{afirmação qualitativa, ambiciosa}

## Resultados-chave
1. {métrica + número-alvo}
2. {métrica + número-alvo}
3. {métrica + número-alvo}

## Não-metas
{o que explicitamente NÃO estamos perseguindo neste ciclo}
```

**`docs/business/journeys.md`:**
```markdown
# Jornadas

Para cada jornada crítica:

## {nome da jornada}

**Persona:** {qual persona}
**Gatilho:** {o que motiva o início}

### Passos
1. {passo} — expectativa do usuário: {o que espera}
2. ...

### Pontos de fricção conhecidos
- {onde trava hoje}

### Métrica de sucesso
{como sabemos que a jornada completa bem}
```

### 5. Confirmar

```
✅ Business docs gerados em docs/business/
   Arquivos: {lista}

Estes arquivos viram contexto para o role "produto" e para features que impactam UX.
```

---

## REGRAS

- Nunca invente personas, métricas ou objetivos que o usuário não forneceu.
- Se houver informação em `docs/_memory/company.md`, use como semente.
- Arquivos existentes: pergunte antes de sobrescrever.
