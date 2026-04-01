# Step: Especificação Visual e Design System

## Objetivo
Produzir especificação visual dos componentes e fluxos identificados na spec/architecture, garantindo conformidade com design system e acessibilidade antes da implementação.

## Instrução ao Agent

Como {designer_agent} (ou {lead_agent} se nenhum agent de design disponível), execute:

### 1. Leia os artefatos da session
- `context.md` — objetivos e restrições do projeto
- `architecture.md` — componentes e fluxos técnicos definidos
- Se existir `spec.md` ou `requirements.md` — requisitos funcionais

### 2. Para cada componente/fluxo identificado, especifique:

**Componentes UI:**
```yaml
componente: {NomeDoComponente}
estados:
  default: {descrição visual}
  hover: {descrição visual}
  focus: {descrição visual — obrigatório para acessibilidade}
  disabled: {descrição visual}
  loading: {descrição visual}
  error: {descrição visual + mensagem de erro}
tokens:
  cor-primaria: {token do design system, ex: --color-primary-500}
  cor-texto: {token}
  espacamento: {token}
contraste:
  ratio: {valor numérico, ex: 4.8:1}
  nivel: AA  # AA (4.5:1+) ou AAA (7:1+)
```

**Fluxos de navegação:**
```yaml
fluxo: {NomeDoFluxo}
estados-vazios: {o que o usuário vê quando não há dados}
estados-erro: {o que o usuário vê quando algo falha + ação de recuperação}
responsividade:
  mobile: {comportamento em telas < 768px}
  desktop: {comportamento em telas ≥ 768px}
```

### 3. Seção obrigatória de verificação

Ao final do output, inclua:

```markdown
## Verificação GATE-DESIGN

- [✅/⚠️] Estados de componente — todos os 6 estados especificados para cada componente interativo
- [✅/⚠️] Contraste AA — ratio declarado para cada componente com texto
- [✅/⚠️] Estado vazio — documentado para cada lista/view de dados
- [✅/⚠️] Estado de erro — com mensagem e ação de recuperação
- [✅/⚠️] Design system — componentes verificados (novos justificados)
- [✅/⚠️] Responsividade — breakpoints definidos
- [✅/⚠️] Tokens — sem valores hardcoded

⚠️ = presente mas com ressalva (justifique)
```

## Output

Salve como `visual-spec.md` na session folder (`docs/.squads/sessions/{feature-slug}/`).

## Veto Conditions

O pipeline-runner deve rejeitar o output se:
- `visual-spec.md` não tem seção `## Verificação GATE-DESIGN`
- Algum componente interativo sem estados `focus` e `error` definidos
- Contraste não declarado para nenhum componente com texto
- Estado vazio ausente em qualquer lista ou view de dados
