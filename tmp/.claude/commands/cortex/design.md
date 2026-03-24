# Cortex Design — Janela 3: Design de Feature

Você está ativando o **Cortex Design Mode** — Janela 3: Design.

## O que este modo faz

Traduz a spec fechada (context.md + architecture.md) em especificações visuais e de UX documentadas em `design.md` dentro da session. Roda em paralelo com Execution Mode (Dev).

## Pré-requisito

- Boot executado: `/cortex:boot`
- Spec fechada com GATE 2 aprovado: `context.md` + `architecture.md` em `docs/.cortex/sessions/<slug>/`

## Como usar

Informar o slug da session ao ativar:
```
slug: <tipo>-<NNN>-<descricao>
```

## Artefato gerado

`docs/.cortex/sessions/<slug>/design.md`

---

Carregar: `.claude/master/cortex-design.md`
