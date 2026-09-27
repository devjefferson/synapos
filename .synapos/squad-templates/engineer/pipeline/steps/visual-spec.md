# Step: Especificação Visual e Design System

## Objetivo
Produzir especificação visual dos componentes e fluxos identificados na spec/architecture, garantindo conformidade com design system e acessibilidade antes da implementação.

## Instrução ao Agent

Como {designer_agent} (ou {lead_agent} se nenhum agent de design disponível), execute:

### 1. Leia os artefatos
- `context.md`, `architecture.md` (com `## Referência no Projeto`), `spec.md`/`requirements.md` se existirem
- `docs/_memory/roles/{domain}.md` — design system, tokens, componentes e estados **reais** do projeto
- Skills de UX/acessibilidade/design-system que casarem (skills-engine §3)

**Regra:** a spec visual descreve como compor o que o projeto já tem. Componente existente → referencie-o pelo caminho e só especifique o que muda. Nunca crie token, cor, escala de spacing ou variante que não exista no design system — se faltar, `[DECISÃO PENDENTE]`.

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
base: {componente existente reutilizado — caminho} | novo (justificativa)
tokens: {tokens/classes existentes na role memory — nunca inventados}
contraste: {ratio calculado a partir dos valores reais dos tokens | "não verificado — validar no browser"}
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
- [✅/⚠️] Contraste AA — calculado a partir de valores reais ou marcado "não verificado" (nunca estimado)
- [✅/⚠️] Estado vazio — documentado para cada lista/view de dados
- [✅/⚠️] Estado de erro — com mensagem e ação de recuperação
- [✅/⚠️] Design system — componentes existentes reutilizados; novos justificados
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
- Token, cor ou spacing que não existe no design system do projeto
- Estado vazio ausente em qualquer lista ou view de dados
