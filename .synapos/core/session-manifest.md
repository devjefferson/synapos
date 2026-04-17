---
name: synapos-session-manifest
description: Referência do session.manifest.json — índice de cache leve para sessões de feature
---

# SESSION MANIFEST

> Arquivo leve criado pelo pipeline-runner na inicialização de uma session.
> Evita re-leitura de arquivos que não mudaram entre execuções.
> Nunca edite manualmente — atualizado automaticamente pelo pipeline-runner.

---

## Localização

```
docs/.squads/sessions/{feature-slug}/session.manifest.json
```

---

## Estrutura Completa

```json
{
  "feature": "auth-module",
  "manifest_version": 2,
  "created_at": "2026-04-16T10:00:00Z",
  "files": {
    "context.md": {
      "hash": "a3f1b2",
      "snapshot_valid": true,
      "loaded_at": "2026-04-16T10:00:00Z"
    },
    "architecture.md": {
      "hash": "c9d4e5",
      "snapshot_valid": false,
      "loaded_at": null
    },
    "memories.md": {
      "entry_count": 4,
      "last_entry_at": "2026-04-16T09:45:00Z"
    }
  },
  "adrs": {
    "loaded_domains": ["backend", "auth"],
    "loaded_at": "2026-04-16T10:00:00Z"
  }
}
```

---

## Campos

### `files.{arquivo}.hash`

String derivada de tamanho do arquivo + data de modificação com granularidade de **segundos**.
Não requer cálculo SHA — é uma chave de invalidação baseada em metadados.

**Formato:** `"{tamanho_bytes}-{YYYY-MM-DDTHH:MM:SS}"`

**Exemplo:** `"4821-2026-04-16T09:30:42"`

> **Limitação conhecida:** edições que resultam no mesmo tamanho de arquivo dentro do mesmo segundo não são detectadas (colisão de hash). Isso é um edge case aceitável — o sistema não perde dados, apenas reutiliza um snapshot levemente desatualizado. Para forçar regeneração, edite e salve novamente ou exclua `context.snapshot`.

### `files.{arquivo}.snapshot_valid`

`true` se `context.snapshot` está atualizado em relação ao `context.md`.
Muda para `false` quando o hash de `context.md` é atualizado.

### `files.{arquivo}.loaded_at`

Timestamp ISO da última vez que o arquivo foi lido pelo pipeline-runner.
Usado pelo GATE-0 para verificar frescor (> 14 dias = aviso de stale).

### `files.memories.md.entry_count`

Contagem de entradas no bloco `<!-- RECENTES -->`.
Atualizado a cada append. Quando > 10: pipeline-runner sugere consolidação.

### `adrs.loaded_domains`

Lista dos domínios cujos ADRs foram carregados no cache `[ADRS_CARREGADOS]`.
Evita recarregar ADRs do mesmo domínio se já estão no cache.

---

## Regras de Invalidação

| Evento | Ação no manifest |
|---|---|
| context.md modificado | `hash` atualizado, `snapshot_valid: false` |
| context.snapshot regenerado | `snapshot_valid: true` |
| architecture.md carregado via SCOPE GUARD | `architecture.md.loaded_at` atualizado |
| Append em memories.md | `entry_count += 1`, `last_entry_at` atualizado |
| ADRs carregados em modo complete | `adrs.loaded_domains` atualizado, `adrs.loaded_at` atualizado |
| /session consolidate | `memories.md.entry_count` atualizado para contagem pós-consolidação |

---

## Lógica de Validação de Hash

O pipeline-runner valida o hash na FASE 1.1a:

```
hash_atual = "{tamanho_atual}-{data_modificacao_atual_com_segundos}"  # ex: "4821-2026-04-16T09:30:42"

Se hash_atual == manifest.files.context.md.hash:
  → arquivo não mudou → usar context.snapshot (se snapshot_valid: true)
  
Se hash_atual != manifest.files.context.md.hash:
  → arquivo mudou → ler context.md completo
  → regenerar context.snapshot
  → atualizar manifest: hash = hash_atual, snapshot_valid = true, loaded_at = agora
```

---

## Context Snapshot

Arquivo derivado de `context.md`, criado e mantido pelo pipeline-runner.

**Localização:** `docs/.squads/sessions/{feature-slug}/context.snapshot`

**Conteúdo esperado (~50 tokens):**

```markdown
Feature: {nome da feature}
O que é: {1 linha resumindo context.md ## O que é}
Motivação: {1 linha resumindo ## Por que existe}
Decisões críticas: {lista bullet das 2-3 decisões mais importantes de ## Decisões tomadas}
Armadilhas: {lista bullet das principais de ## O que não fazer}
```

**Quando regenerar:**
- Sempre que `context.md` for modificado (hash inválido)
- Manualmente via `/session consolidate` (opcional)

**Nunca use context.snapshot:**
- Em steps com `needs_full_context: true`
- Em steps de investigação/discovery que precisam do contexto completo
- Se o snapshot não existir (use context.md diretamente)
