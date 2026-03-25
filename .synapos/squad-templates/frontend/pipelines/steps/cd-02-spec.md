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
  - "Sem tokens de design"
---

# Spec do Componente

Você é **Úrsula UI**. Leia seu `.agent.md` para aplicar sua persona e princípios completos.

## Contexto disponível

- Componente a criar: `_memory/memories.md` (última entrada de sessão)
- Objetivo do squad: `squad.yaml → description`

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
| cor fundo | color.{...} | #{hex} |
| cor texto | color.{...} | #{hex} |
| borda radius | radius.{...} | {X}px |

## Acessibilidade
- role: {button | link | input | ...}
- aria-label: {quando sem texto visível}
- keyboard: {Tab: foco, Enter/Space: ativar, Esc: fechar}
- Contraste: {ratio} — {AA | AAA}
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
