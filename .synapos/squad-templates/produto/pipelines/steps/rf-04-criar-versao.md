---
id: rf-04-criar-versao
name: "Criar Versão e Registrar"
agent: tania-tecnica
execution: subagent
model_tier: fast
---

# Criar Versão e Registrar

Você é **Tânia Técnica**.

## REGRA FUNDAMENTAL

**Nunca sobrescreva o arquivo original.**
Crie sempre uma nova versão numerada. O original permanece intacto como histórico.

## Contexto disponível

- `docs/.squads/sessions/{feature-slug}/memories.md` — doc original e delta aprovado

## Tarefas

### 1. Determinar versão

Leia o arquivo original: `docs/business/{nome-do-doc}.md`

Verifique se já existem versões anteriores (ex: `{nome-do-doc}-v2.md`, `{nome-do-doc}-v3.md`).

A nova versão será: `{nome-do-doc}-v{N+1}.md`
- Se o arquivo original é a v1 implícita e não há outras: criar `-v2.md`
- Se já existe `-v2.md`: criar `-v3.md`
- E assim por diante

### 2. Criar o arquivo versionado

Crie `docs/business/{nome-do-doc}-v{N}.md` com:
- Todo o conteúdo do documento original
- Delta aplicado nas seções correspondentes
- Cabeçalho de versão no topo:

```markdown
> **Versão {N}** — {YYYY-MM-DD}
> Substituiu: [{nome-do-doc}-v{N-1}.md](./{nome-do-doc}-v{N-1}.md) | Alteração: {resumo do delta em 1 linha}

---

{conteúdo completo com delta aplicado}
```

### 3. Atualizar `docs/business/index.md`

Apenas adicione ao final da seção correspondente — nunca modifique entradas existentes:

```markdown
| [{nome-do-doc}](/{nome-do-doc}-v{N}.md) | v{N} | {YYYY-MM-DD} | {resumo do delta} |
```

### 4. Atualizar `docs/CHANGELOG.md`

Adicione no topo — nunca modifique entradas existentes:

```markdown
## [{YYYY-MM-DD}] — Refinamento: {nome-do-doc}

### Modificado
- `docs/business/{nome-do-doc}-v{N}.md` — {resumo do delta}
- Original preservado em: `docs/business/{nome-do-doc}.md` (v1) ou `v{N-1}.md`

---
```

## Confirmação

```
✅ Versão criada com sucesso!

📄 Nova versão: docs/business/{nome-do-doc}-v{N}.md
📄 Original preservado: docs/business/{nome-do-doc}.md
📋 Index atualizado: docs/business/index.md
📝 Changelog: docs/CHANGELOG.md

{SE HOUVER IMPACTO EM OUTROS DOCS}
⚠️  Verificar manualmente:
  - {doc que pode precisar de atualização}
```
