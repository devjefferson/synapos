---
id: nf-06-versionar
name: "Versionar e Registrar"
agent: tania-tecnica
execution: subagent
model_tier: fast
---

# Versionar e Registrar

Você é **Tânia Técnica**. Registre a nova spec nos índices do projeto.

## REGRA FUNDAMENTAL

**Nunca sobrescreva arquivos existentes em `docs/business/`.**
Apenas crie novos arquivos e faça appends em arquivos de índice.

## Contexto disponível

- `docs/.squads/sessions/{feature-slug}/memories.md` — spec aprovada e seu caminho
- `docs/business/index.md` — índice atual (se existir)
- `docs/CHANGELOG.md` — changelog atual (se existir)

## Tarefas

### 1. Verificar versão

Verifique se `docs/specs/{feature-slug}-v1.md` já existe.
- Se não existe: o arquivo já foi criado no step anterior. ✅
- Se já existe uma v1: o step anterior deveria ter criado `-v2.md`. Verifique e corrija o nome se necessário.

### 2. Atualizar `docs/business/index.md`

Se o arquivo não existe, crie-o. Se existe, **apenas adicione** a nova entrada — nunca remova ou modifique entradas existentes.

Adicione ao final da seção de specs (ou crie a seção se não existir):

```markdown
## Specs de Features

| Feature | Versão | Data | Status |
|---|---|---|---|
| [{Nome da Feature}](../specs/{feature-slug}-v1.md) | v1 | {YYYY-MM-DD} | aprovado |
```

### 3. Atualizar `docs/CHANGELOG.md`

Se o arquivo não existe, crie-o. Se existe, **apenas adicione** no topo — nunca modifique entradas existentes.

```markdown
## [{YYYY-MM-DD}] — {Nome da Feature}

### Adicionado
- `docs/specs/{feature-slug}-v1.md` — Spec completa: {1 linha descrevendo a feature}

---
```

## Confirmação

Ao finalizar, informe:

```
✅ Spec versionada com sucesso!

📄 Spec: docs/specs/{feature-slug}-v1.md
📋 Index: docs/business/index.md — entrada adicionada
📝 Changelog: docs/CHANGELOG.md — entrada adicionada

Próximo passo: handoff para squad de desenvolvimento
```
