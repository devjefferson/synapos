# Step 06c — Especificação Visual e Design System

## Agent: Úrsula UI (ursula-ui)

## Objetivo
Com base na spec funcional (spec.md) e nos requisitos (requirements.md), produzir a especificação visual completa dos componentes e fluxos da feature, garantindo design system, acessibilidade e rastreabilidade para o handoff de desenvolvimento.

## Instrução

Leia da session:
- `context.md` — contexto e objetivos
- `spec.md` — especificação funcional aprovada
- `requirements.md` — requisitos e critérios de aceite

Para cada componente e fluxo identificado, siga o framework de Visual-Spec do seu perfil de agent.

## Output obrigatório: `visual-spec.md`

Estrutura mínima:
```markdown
# Visual Spec — {feature-name}

## Componentes

### {NomeComponente}
- **Propósito:** {o que faz}
- **Estados:** default | hover | focus | disabled | loading | error
  - default: {descrição}
  - hover: {descrição}
  - focus: {descrição — ex: outline 2px --color-focus}
  - disabled: {descrição}
  - loading: {skeleton ou spinner? descrição}
  - error: {mensagem de erro + ação de recuperação}
- **Contraste:** {ratio}:1 ({AA/AAA})
- **Tokens usados:** {lista de tokens do design system}
- **Mobile:** {comportamento em < 768px}

## Fluxos

### {NomeFluxo}
- **Estado vazio:** {o que o usuário vê}
- **Estado de erro:** {mensagem + ação}
- **Responsividade:** {breakpoints}

## Verificação GATE-DESIGN

- [ ] Todos os estados de componente especificados
- [ ] Contraste AA declarado
- [ ] Estado vazio documentado
- [ ] Estado de erro com ação de recuperação
- [ ] Componentes novos verificados no design system
- [ ] Tokens (sem hardcode)
- [ ] Responsividade definida
```

## Veto Conditions
- Output sem seção `## Verificação GATE-DESIGN`
- Componente interativo sem estado `focus` e `error`
- Nenhum valor de contraste declarado
