---
description: Diagnóstico e recovery de sessions interrompidas ou corrompidas
---

# Debug: Session

> Use quando uma session está em estado inconsistente, corrompida ou travada.

---

## Quando Usar

- `state.json` não parseia (JSON inválido)
- Squad mostra `status: "running"` mas não havia execução ativa
- Pipeline parou sem anunciar o motivo
- `memories.md` com conteúdo duplicado ou corrompido
- Squad criado mas não aparece no menu do orchestrator

---

## Diagnóstico

### Passo 1 — Localizar a session

```
docs/.squads/sessions/{feature-slug}/
├── state.json       ← verifique primeiro
├── memories.md
└── ...
```

Se não sabe o `feature-slug`: liste `docs/.squads/sessions/` para ver sessions existentes.

### Passo 2 — Verificar state.json

Leia `docs/.squads/sessions/{feature-slug}/state.json`:

| Situação | Diagnóstico |
|----------|-------------|
| Arquivo não existe | Session nunca foi iniciada ou foi deletada |
| JSON inválido (erro de parse) | Corrupção — verifique `state.json.bak.*` |
| Squad com `status: "running"` sem execução ativa | Session travada — precisa de reset |
| Squad com `status: "awaiting_approval"` | Checkpoint assíncrono pendente — verifique `pending-approvals.md` |
| Squad com `status: "blocked"` | Escalation pendente — verifique `open-decisions.md` |

### Passo 3 — Recovery por situação

**state.json corrompido:**
1. Verifique se existe `state.json.bak.{timestamp}` na mesma pasta
2. Se existir: renomeie o `.bak` para `state.json`
3. Se não existir: reinicialize com estrutura mínima:
   ```json
   {
     "feature": "{feature-slug}",
     "created_at": "{data-atual}",
     "updated_at": "{data-atual}",
     "squads": {}
   }
   ```
4. Execute `/init` → o squad pode ser recarregado

**Squad travado em "running":**
1. Edite `state.json`
2. Mude `status: "running"` → `status: "discarded"` para o squad afetado
3. Execute `/init` → crie novo squad para a mesma feature
4. Na criação: selecione a session existente (os artefatos como `context.md` são preservados)

**Checkpoint assíncrono pendente:**
1. Leia `docs/.squads/sessions/{feature-slug}/pending-approvals.md`
2. Revise o conteúdo do checkpoint
3. Execute `/init` → selecione o squad → "Retomar de onde parou"
4. O orchestrator apresentará o checkpoint para aprovação

**Squad bloqueado por escalation:**
1. Leia `docs/.squads/sessions/{feature-slug}/open-decisions.md`
2. Para cada `[DECISÃO PENDENTE]` com `status: pending`:
   - Escolha uma opção (A, B, ou defina outra)
   - Atualize o campo `status: resolved` + registre a decisão tomada
3. Execute `/init` → selecione o squad → "Retomar de onde parou"

---

## Comandos de Recovery Rápido

| Situação | Ação |
|----------|------|
| state.json corrompido | Restaurar do `.bak` mais recente ou reinicializar |
| Squad stuck em running | Marcar como `discarded`, criar novo squad |
| memories.md duplicado | Remover duplicatas manualmente (é append-only, nunca bloqueia execução) |
| output_file faltando | Reexecutar o step via retomada |
| Squad não aparece no menu | Verificar se `.synapos/squads/{slug}/squad.yaml` existe |

---

## Prevenção

- Nunca edite `state.json` diretamente durante execução de pipeline
- Nunca delete `state.json` sem backup — use `status: "discarded"` no squad
- Se interromper uma execução, use sempre o fluxo de retomada do orchestrator
- Para features longas, consolide `memories.md` periodicamente (o pipeline-runner oferece automaticamente após 10 entradas)
