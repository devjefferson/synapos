---
id: 05-arquitetura
name: "Estruturação Arquitetural"
agent: leo-engenheiro
execution: subagent
model_tier: powerful
output_files:
  - architecture.md
---

# Estruturação Arquitetural

## Contexto disponível
Você recebe automaticamente:
- `context.md` (aprovado pelo humano no step anterior)
- Toda a documentação em `docs/` incluindo ADRs

## Objetivo
Produzir `architecture.md` — o design técnico completo da feature, alinhado com ADRs e convenções do projeto.

## 1. Ler ADRs obrigatoriamente

Antes de qualquer proposta técnica:
- Leia todos os arquivos de ADR em `docs/` (arquivos com `ADR`, `adr`, `decisions`, `architecture-decision` no nome)
- Liste as ADRs relevantes para esta feature
- Entenda as restrições que impõem

## 2. Examinar código-fonte

Use as ferramentas disponíveis para:
- Encontrar features similares já implementadas
- Entender a estrutura de pastas e convenções do projeto
- Identificar padrões (Repository, Service, Controller, etc.) usados atualmente
- Verificar como dependências externas são utilizadas

## 3. Construir architecture.md

Estrutura obrigatória:

```markdown
# Architecture: [Nome da Feature]

## Visão de Alto Nível
[Estado atual do sistema → estado após a mudança]

## Componentes Impactados
[Lista de módulos, serviços, arquivos com suas relações e dependências]

## Convenções Mantidas / Introduzidas
[Padrões do projeto que serão seguidos — referenciar ADRs]

## Dependências Externas
[Libs, APIs, serviços externos necessários]

## Principais Arquivos a Modificar/Criar
[Lista com caminho completo e tipo de mudança]

## Trade-offs e Alternativas
[O que foi considerado e por que foi rejeitado — com referência a ADRs se aplicável]

## Consequências
[Efeitos colaterais, riscos, débito técnico introduzido]

## Diagrama (Mermaid)
[Opcional — adicionar quando agrega clareza real]

## ADRs Aplicadas
[Lista de cada ADR verificada:]
- ADR-XXX: [título] → ✅ Respeitada (como?)
- ADR-YYY: [título] → ✅ Respeitada (como?)
- [Se há decisão que exige nova ADR:] → ➕ Nova ADR necessária: [descrever]
```

## 4. Verificação Cruzada (OBRIGATÓRIA)

Compare `context.md` com `architecture.md`:

| Item | Verificar |
|------|-----------|
| Problema principal | Descrito da mesma forma em ambos? |
| Arquivos a modificar | Listas compatíveis? |
| Abordagem técnica | Estratégia alinhada? |
| Valores de negócio | Números, prazos, regras iguais? |
| ADRs | Todas as relevantes foram consideradas? |

**Ações:**
- Inconsistências menores: corrija sem consultar o humano
- Inconsistências de abordagem: alinhe aos padrões do projeto, informe o humano
- Conflito com especificação de negócio: spec de negócio sempre vence — corrija os docs técnicos

Adicione ao final de `architecture.md`:

```markdown
---

## ✅ Verificação de Consistência

**Data**: [YYYY-MM-DD]
**Status**: ✅ APROVADO / ⚠️ CORRIGIDO

### Checklist
- [x] context.md e architecture.md consistentes
- [x] Conforme especificação de negócio (se aplicável)
- [x] ADRs verificadas e respeitadas
- [x] Valores e regras de negócio conferidos

### Correções Aplicadas
[Descrever se houver]
```

## 5. Regra de decisões

**Toda decisão técnica que não esteja explicitamente coberta pelo context.md aprovado ou pelas ADRs existentes DEVE ser apresentada como:**

```
[DECISÃO PENDENTE] {id}
Contexto: {por que esta decisão é necessária}
Opções:
  A) {opção A} — {prós/contras}
  B) {opção B} — {prós/contras}
Recomendação: {opção recomendada e por quê}
Aguardando aprovação para incluir na arquitetura.
```

**Nunca escolha unilateralmente. Pare e aguarde o humano.**

**⛔ NÃO AVANCE. Aguarde o checkpoint de aprovação.**
