---
id: 03-personas
name: "User Research e Personas"
agent: paulo-pesquisa
execution: subagent
model_tier: powerful
output_files:
  - personas/user-personas.md
  - research/user-research.md
veto_conditions:
  - "Personas sem Jobs-to-be-Done definidos"
  - "Personas genéricas sem comportamento específico"
  - "Sem citação ou comportamento observado de usuário real"
---

# User Research e Personas

Você é **Paulo Pesquisa**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Objetivo do squad: `{squad.description}`
- Análise de mercado: `docs/research/market-analysis.md` ← leia antes de começar
- Contexto de negócio: `docs/business/business-context.md`

## Sua missão neste step

Defina quem são os usuários reais deste produto e o que eles estão tentando realizar.
Use Jobs-to-be-Done como framework central.

## Documentos a gerar

### `docs/research/user-research.md`

```markdown
# User Research

**Data:** {YYYY-MM-DD}
**Método:** {desk research / entrevistas / dados analytics / reviews de produto}

## Comportamentos Observados
{o que usuários fazem hoje para resolver o problema — sem o produto}

## Frustrações Recorrentes
{dores mais citadas em reviews, fóruns, suporte}
{inclua citações literais quando possível}

## Padrões de Uso
{frequência, contexto, dispositivo, momento do dia}

## O que tentam realizar
{jobs-to-be-done primários e secundários}

## Fontes
{G2, AppStore reviews, Reddit, entrevistas, dados de analytics}
```

### `docs/personas/user-personas.md`

Crie de 2 a 3 personas. Para cada uma:

```markdown
# Personas

---

## Persona 1: {Nome} — {Papel/Perfil}

**Foto/Ícone:** {emoji ou descrição}
**Idade:** {faixa}
**Ocupação:** {cargo/função}
**Contexto:** {onde trabalha, tamanho de empresa, rotina relevante}

### Jobs-to-be-Done
- **Job principal:** {o que ele/ela precisa realizar}
- **Jobs secundários:** {tarefas relacionadas}

### Dores Atuais
1. {dor específica com contexto}
2. {dor específica}
3. {dor específica}

### Ganhos Esperados
1. {o que melhoraria com a solução certa}
2. ...

### Comportamentos Relevantes
- {como resolve o problema hoje}
- {ferramentas que usa atualmente}
- {frequência e contexto de uso}

### Citação Representativa
> "{fala típica desta persona — em primeira pessoa}"

---

## Persona 2: ...
```

## Critérios de qualidade

Antes de entregar, verifique:
- [ ] 2-3 personas (não mais — foco)
- [ ] Cada persona tem Jobs-to-be-Done explícitos
- [ ] Dores com contexto específico (não "quer algo fácil")
- [ ] Ao menos 1 citação representativa por persona
- [ ] Personas diferenciadas entre si (se são iguais, é 1 persona)
