---
id: 07-planejamento
name: "Planejamento de Execução"
agent: leo-engenheiro
execution: subagent
model_tier: powerful
output_files:
  - plan.md
---

# Planejamento de Execução

## Contexto disponível
Você recebe automaticamente:
- `context.md` (aprovado)
- `architecture.md` (aprovado com Verificação de Consistência)

## 1. Inventário de Agents e Skills

Antes de criar o plano, faça inventário do que está disponível no squad:

```bash
# Agents configurados no squad
# (leia o squad.yaml e os .agent.md correspondentes)

# Skills ativas
# (leia .synapos/skills/*/SKILL.md se existirem)
```

Monte internamente:
- `AGENTS_DISPONÍVEIS`: `{id} → {role} — {description}`
- `SKILLS_DISPONÍVEIS`: `{nome} → {description}`

## 2. Criar plan.md

Divida a execução em fases onde **cada fase pode ser realizada em ~2 horas**.

Regras:
- Fase com backend + frontend juntos: separar em fases distintas, a menos que sejam trivialmente pequenas
- Fases com dependências sequenciais: marcar com `→`
- Fases que podem rodar em paralelo: marcar com `|`
- Se `context.md` menciona "Frontend Integration" / Lovable: incluir fase de "Mock Removal"
- Atribuir `Agent` e `Skill` a cada fase com base no inventário

**Estrutura obrigatória do plan.md:**

```markdown
# Plan: [Nome da Feature]

> Leia `context.md` e `architecture.md` antes de trabalhar em qualquer fase.
> Atualize este arquivo ao concluir cada fase — marque tarefas e adicione comentários.

## FASE 1: [Nome] [Não Iniciada ⏳]
> Agents: [agentA | agentB] ou [agentA → agentB]
> Skill: [nome] ou "nenhuma"
> Estimativa: ~Xh

[Descrição da fase]

### Tarefa 1.1: [Nome] [Não Iniciada ⏳]
[Detalhes — arquivos a criar/modificar, contratos, validações]

### Tarefa 1.2: [Nome] [Não Iniciada ⏳]
[Detalhes]

### Comentários ADR:
ADRs aplicáveis nesta fase:
- ADR-XXX: [como se aplica]

## FASE 2: [Nome] [Não Iniciada ⏳]
> Agents: [...]
> Skill: [...]
> Estimativa: ~Xh
> Depende de: FASE 1

[...]

## FASE N: Mock Removal — Frontend [Não Iniciada ⏳]
(incluir apenas se Lovable/frontend estiver envolvido)
> Agents: [rodrigo-react ou similar]
> Skill: [nenhuma]
> Depende de: FASE com os endpoints correspondentes

### Mock #1: [Nome do componente] [Não Iniciada ⏳]

**Pré-requisito backend:**
- [ ] Endpoint [GET/POST/etc] /api/... criado e testado

**Frontend:**
- [ ] Remover mock em [arquivo:linha]
- [ ] Substituir por hook/fetch real
- [ ] Adicionar loading state
- [ ] Adicionar error handling
- [ ] Validar tipos TypeScript match
```

## 3. Verificar consistência com architecture.md

Confirme que cada fase do plano está coberta pela arquitetura aprovada. Se encontrar lacuna:
```
[DECISÃO PENDENTE] plano-fase-X
Contexto: architecture.md não cobre [aspecto específico]
Opções:
  A) Adicionar ao architecture.md antes de finalizar o plano
  B) Tratar como decisão durante execução da fase
Aguardando aprovação.
```

**⛔ NÃO AVANCE. Aguarde o checkpoint de aprovação do plano.**
