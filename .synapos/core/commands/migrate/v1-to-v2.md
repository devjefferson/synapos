---
description: Migration path de projetos Synapos v1.x para v2.0+
---

# Migration: v1.x → v2.0+

> Para projetos que usavam Synapos antes da versão 2.0.0.

---

## O Que Mudou de v1 para v2

### Breaking Changes

| v1.x | v2.0+ | Impacto |
|------|-------|---------|
| Output em `docs/.squads/{slug}/output/{run_id}/` | Session em `docs/.squads/sessions/{feature-slug}/` | Todos os arquivos de output mudaram de lugar |
| `squad.yaml` sem campos `feature` e `session` | Campos `feature` e `session` obrigatórios | GATE-1 falha sem esses campos |
| `state.json` por squad em `docs/.squads/{slug}/` | `state.json` único por feature em `docs/.squads/sessions/{feature-slug}/` | Rastreamento centralizado |
| `squad_memory` no squad.yaml | Campo removido | Usar `session` apontando para pasta de session |
| `memories.md` por squad | `memories.md` por feature (compartilhada) | Aprendizados entre squads ficam visíveis |

### Mudanças Não-Breaking (novas capacidades)

- `pre_pipeline` em squad templates — disponível mas opcional
- `leo-engenheiro` como agent opcional — disponível mas não obrigatório
- `async_checkpoints` no squad.yaml — `false` por padrão
- Compliance Obrigatório nos agents — adicionado mas compatível com agents existentes

---

## Passos de Migração

### Passo 1 — Identificar sessions v1 existentes

Liste as pastas de output antigas:
```
docs/.squads/{squad-slug}/output/
```

Para cada squad com runs anteriores, anote:
- O `feature-slug` que corresponde a cada run
- Quais arquivos importantes foram gerados (context.md, architecture.md, spec.md, etc.)

### Passo 2 — Criar estrutura v2

Para cada feature:
```
mkdir -p docs/.squads/sessions/{feature-slug}/
```

### Passo 3 — Migrar artefatos relevantes

Copie os artefatos importantes do último run válido:
```
cp docs/.squads/{slug}/output/{run_id}/context.md     docs/.squads/sessions/{feature-slug}/
cp docs/.squads/{slug}/output/{run_id}/architecture.md docs/.squads/sessions/{feature-slug}/
cp docs/.squads/{slug}/output/{run_id}/spec.md         docs/.squads/sessions/{feature-slug}/
# copie os demais arquivos relevantes
```

Se havia `_memory/memories.md` por squad:
```
cp docs/.squads/{slug}/_memory/memories.md docs/.squads/sessions/{feature-slug}/memories.md
```

### Passo 4 — Criar state.json inicial

Crie `docs/.squads/sessions/{feature-slug}/state.json`:
```json
{
  "feature": "{feature-slug}",
  "created_at": "{data-atual}",
  "updated_at": "{data-atual}",
  "squads": {
    "{squad-slug}": {
      "domain": "{dominio}",
      "pipeline": "{pipeline-usado}",
      "started_at": "{data-original-se-souber}",
      "completed_at": null,
      "status": "migrated",
      "completed_steps": [],
      "current_step": null,
      "suspended_at": null
    }
  }
}
```

### Passo 5 — Atualizar squad.yaml

Adicione os campos obrigatórios ao `.synapos/squads/{slug}/squad.yaml`:

```yaml
# Adicionar estes campos:
feature: {feature-slug}
session: docs/.squads/sessions/{feature-slug}/

# Remover este campo (se existir):
# squad_memory: docs/.squads/{slug}/_memory/
```

### Passo 6 — Verificar migração

Execute `/init` → selecione o squad migrado.

O orchestrator deve:
1. Ler `feature` e `session` do squad.yaml ✅
2. Encontrar `state.json` na session ✅
3. Mostrar o squad como disponível no menu ✅

Se GATE-1 falhar: verifique se os campos `feature` e `session` estão no squad.yaml.

---

## Projetos Sem v1 (onboarding limpo)

Se não há estrutura v1: ignore este guia. Siga [GETTING_STARTED.md](../../../../GETTING_STARTED.md).

---

## Verificação Final

Após migrar todos os squads:

```
docs/.squads/sessions/
├── {feature-1}/
│   ├── state.json        ← criado no Passo 4
│   ├── context.md        ← migrado do run anterior
│   └── memories.md       ← migrado de _memory/memories.md
└── {feature-2}/
    └── state.json
```

E em `.synapos/squads/{slug}/squad.yaml`:
```yaml
feature: {feature-slug}   ← obrigatório
session: docs/.squads/sessions/{feature-slug}/  ← obrigatório
```

Se tudo estiver correto: `/init` deve funcionar normalmente com os squads migrados.
