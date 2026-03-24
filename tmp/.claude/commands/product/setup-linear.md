# Configurar Integração Linear

Configura a integração do Linear no projeto atual, guiando o usuário para obter e validar as credenciais necessárias, e persistindo a configuração em `docs/technical-context/briefing/tech-stack.md`.

> **Pré-requisito recomendado:** ter rodado `/docs-commands:build-tech-docs` para que `tech-stack.md` já exista. O agente avisa caso o arquivo não seja encontrado.

---

## O que este comando faz

1. Verifica se já existe configuração Linear em `.claude/.env`
2. Guia o usuário para obter as credenciais no painel do Linear
3. Valida cada credencial via API antes de salvar
4. Lista times e projetos disponíveis para o usuário selecionar
5. Salva **todas** as credenciais (incluindo API Key) em `.claude/.env` — que está no `.gitignore`
6. Opcionalmente registra IDs (sem a API Key) em `tech-stack.md` como referência
7. Confirma que o `/product:sync-linear` está pronto para uso

---

## Credenciais necessárias

| Campo | Onde obter | Armazenamento |
|-------|-----------|---------------|
| `LINEAR_API_KEY` | [linear.app/settings/api](https://linear.app/settings/api) | `.claude/.env` (gitignored) |
| `LINEAR_ORG_SLUG` | URL do Linear (`linear.app/<slug>/...`) | `.claude/.env` + `tech-stack.md` (referência) |
| `LINEAR_TEAM_ID` | Listado automaticamente via API | `.claude/.env` + `tech-stack.md` (referência) |
| `LINEAR_PROJECT_ID` | Listado automaticamente via API | `.claude/.env` + `tech-stack.md` (referência) |

---

## Fluxo de Execução

Invocar o agente `@linear-config-setup` para executar a configuração interativa completa:

1. **Verificar estado atual** — `.claude/.env` existe? Configuração Linear já presente?
2. **Orientar obtenção da API Key** — link direto para o painel do Linear
3. **Validar API Key** — testar autenticação com `{ viewer { name email } }`
4. **Descobrir Org Slug** — via `{ organization { urlKey } }`
5. **Listar e selecionar Team** — via `{ teams { nodes { id name } } }`
6. **Listar e selecionar Project** — via `{ team(id) { projects { nodes { id name } } } }`
7. **Confirmar e salvar** — persistir `LINEAR_API_KEY`, `LINEAR_ORG_SLUG`, `LINEAR_TEAM_ID` e `LINEAR_PROJECT_ID` em `.claude/.env`
8. **Verificação final** — confirmar configuração e mostrar próximos passos

---

## Segurança

- Todas as credenciais são salvas em `.claude/.env` — que está no `.gitignore`
- O arquivo `.claude/.env` **nunca deve ser commitado** ao repositório
- Se usar CI/CD, configure as variáveis como secret no seu provedor (GitHub Actions, Vercel, etc.)

---

## Após a configuração

Com o Linear configurado, use:

```bash
/product:sync-linear          # Sincronizar features com o Linear
/product:sync-linear preview  # Ver diff sem fazer alterações
```

---

## Uso

```
/product:setup-linear
```

---

## Resolução de Problemas

| Problema | Solução |
|---------|---------|
| `tech-stack.md` não encontrado | Execute `/docs-commands:build-tech-docs` primeiro |
| API Key inválida | Verifique o valor em `.claude/.env` ou execute novamente `/product:setup-linear` |
| Time não encontrado | Certifique-se de estar no workspace correto no Linear |
| Projeto não listado | Crie o projeto no Linear antes de configurar |
| Quer reconfigurar | Execute novamente — o agente detecta configuração existente e oferece atualização |
