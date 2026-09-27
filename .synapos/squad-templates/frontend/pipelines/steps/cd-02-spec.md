---
id: cd-02-spec
name: "Spec do Componente"
agent: ursula-ui
execution: subagent
model_tier: powerful
output_files:
  - component-spec.md
veto_conditions:
  - "Spec sem todos os estados (default, hover, focus, disabled)"
  - "Sem especificação de acessibilidade"
  - "Token, cor ou tamanho que não existe no design system do projeto"
---

# Spec do Componente

Você é **Úrsula UI**.

## Contexto disponível

- Componente a criar: `[TASK]` / `state.json → task`
- `docs/_memory/roles/frontend.md` — design system, catálogo de reuso, tokens reais
- Âncora de padrão do step de descoberta (componentes irmãos a imitar)

## Antes de especificar

1. Existe componente equivalente no catálogo de reuso? → a spec vira **extensão/variante** dele, não um componente novo. Se ainda assim for novo, justifique.
2. Use a API dos componentes irmãos (nomes de props, variantes, tamanhos) como molde.
3. Todo valor visual vem de token/classe existente. Valor inexistente → `[DECISÃO PENDENTE]`. Contraste: calcule a partir dos valores reais ou marque "não verificado".

## Documento a gerar

### `docs/component-spec.md`

```markdown
# Spec do Componente: {NomeDoComponente}

**Data:** {YYYY-MM-DD}
**Designer:** Úrsula UI

## Propósito
{para que serve, quando usar}

## Anatomia
{elementos internos — descreva em texto ou ASCII}
[Ícone opcional] [Label] [Elemento secundário opcional]

## Variantes
| Variante | Quando usar |
|----------|------------|
| default | estado padrão |
| ... | ... |

## Estados Visuais
| Estado | Aparência | Comportamento |
|--------|-----------|---------------|
| default | {...} | {...} |
| hover | {...} | transition {Xms} ease |
| focus | outline {X}px solid {cor}, offset {X}px | visível ao tab |
| active | {...} | scale 0.98 |
| disabled | opacity 0.5, cursor not-allowed | não responde a eventos |
| loading | spinner substituindo ícone | disabled state |
| error | borda vermelha | {...} |

## Tamanhos
| Tamanho | Height | Padding | Font |
|---------|--------|---------|------|
| sm | {X}px | ... | {X}px |
| md | {X}px | ... | {X}px (padrão) |
| lg | {X}px | ... | {X}px |

## Tokens de Design
| Propriedade | Token | Valor |
|-------------|-------|-------|
| cor fundo | {token existente} | {valor lido do tema} |
| cor texto | {token existente} | {valor lido do tema} |
| borda radius | {token existente} | {valor lido do tema} |

## Acessibilidade
- role: {button | link | input | ...}
- aria-label: {quando sem texto visível}
- keyboard: {Tab: foco, Enter/Space: ativar, Esc: fechar}
- Contraste: {ratio calculado dos valores reais — AA/AAA | não verificado}
- Focus visible: {obrigatório — nunca remover}

## Interface TypeScript
```typescript
interface {ComponentName}Props {
  // obrigatórias
  // opcionais
  variant?: 'default' | '...'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
}
```

## Comportamento Responsivo
| Breakpoint | Comportamento |
|-----------|---------------|
| mobile (< 768px) | {...} |
| desktop (≥ 768px) | {...} |
```
