---
id: 05-arquitetura
name: "Estruturação Arquitetural"
agent: leo-engenheiro
execution: subagent
model_tier: powerful
output_files:
  - architecture.md
success_criteria:
  - "## Referência no Projeto reproduz a Âncora de padrão com caminhos reais"
  - "## Principais Arquivos a Modificar/Criar lista caminhos completos; cada arquivo novo tem justificativa de reuso"
  - "## ADRs Aplicadas contém o ADR CHECK (ou 'nenhuma ADR aplicável' quando o índice não tem ADR relevante)"
  - "## Verificação de Consistência com status ✅ APROVADO ou ⚠️ CORRIGIDO"
  - "Nenhuma decisão fora do contexto aprovado, das ADRs ou dos padrões existentes foi tomada sem [DECISÃO PENDENTE]"
---

# Estruturação Arquitetural

Produzir `architecture.md`: o desenho técnico da feature **dentro dos padrões que o projeto já tem**.

## Entradas

- `context.md` completo (aprovado)
- Âncora de padrão e role memory (`docs/_memory/roles/{domain}.md`) do step de descoberta
- ADRs relevantes do `adr-index.md` (leia completas só essas)
- `spec.md` se existir

## 1. Partir da referência

A arquitetura é uma **variação da referência do projeto**, não um desenho do zero:
- Copie a Âncora de padrão para `## Referência no Projeto`.
- Para cada parte da feature, aplique a escada de compliance-protocol §2 (existente → composição → adaptação → novo).
- Lacuna de padrão que a descoberta não resolveu → `[CONTEXT_REQUIRED]` e leia o código antes de decidir.

## 2. Construir architecture.md

```markdown
# Architecture: {feature}

## Referência no Projeto
{Âncora de padrão: mais parecido · container/layout · componentes/módulos reutilizados · padrão seguido · abstração existente · regra documentada}

## Visão de Alto Nível
{estado atual → estado após a mudança}

## Componentes Impactados
{módulos/arquivos e relações}

## Reuso x Novo
| Parte | Reutiliza | Novo? | Justificativa (se novo) |
|------|-----------|-------|-------------------------|

## Principais Arquivos a Modificar/Criar
- `{caminho}` — {modificar | criar} — {o quê}

## Dependências Externas
{libs/APIs — nova dependência = [DECISÃO PENDENTE]}

## Trade-offs e Alternativas
{alternativa considerada — por que não}

## Consequências
{riscos, débito técnico}

## ADRs Aplicadas
{ADR CHECK — compliance-protocol §4}
```

## 3. Verificação cruzada

Compare com `context.md` (problema, escopo, regras de negócio, valores) e com a referência (a estrutura segue o padrão?). Inconsistência de detalhe: corrija. De abordagem: alinhe ao padrão do projeto e informe. Spec de negócio contradiz o desenho: a spec vence.

```markdown
## Verificação de Consistência
**Data:** {YYYY-MM-DD} · **Status:** ✅ APROVADO | ⚠️ CORRIGIDO
- [x] context.md e architecture.md consistentes
- [x] estrutura segue a referência do projeto (desvios sinalizados)
- [x] ADRs relevantes verificadas
- [x] regras de negócio conferidas
Correções: {se houver}
```

## 4. Decisões

Toda escolha não coberta por contexto aprovado, ADR ou padrão existente → `[DECISÃO PENDENTE]` (compliance-protocol §3). Nunca escolha unilateralmente.

**⛔ Aguarde o checkpoint de aprovação.**
