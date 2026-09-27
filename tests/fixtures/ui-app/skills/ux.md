---
name: ux
description: "Critérios de UX do projeto loja-admin"
whenToUse: "Ao criar ou alterar telas, fluxos e formulários"
domains: [frontend, produto]
---

# UX — loja-admin

## Formulários
- Label sempre acima do campo (use `FormField`).
- Validação inline, exibida ao sair do campo (`mode: 'onBlur'` no react-hook-form) — nunca só no submit.
- Botão primário à direita, rótulo com verbo de ação ("Salvar produto", não "OK").
- Campos obrigatórios não levam asterisco; opcionais levam "(opcional)" no label.

## Listagens
- Sempre há estado vazio com orientação do próximo passo (`EmptyState` com `action`).
- Ação principal da página fica em `PageHeader.actions`.

## Mensagens
- Erros dizem o que aconteceu e o que fazer ("Não foi possível salvar. Tente novamente.").
