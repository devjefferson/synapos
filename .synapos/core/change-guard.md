---
name: synapos-change-guard
description: Protocolo de rastreamento de alterações — reporta arquivos modificados, trechos alterados e o que não foi preciso alterar
version: 1.0.0
---

# SYNAPOS CHANGE GUARD v1.0.0

> Garante visibilidade sobre o que foi tocado em cada step de execução.
> Responde três perguntas: o que foi alterado? qual trecho? o que não precisou ser alterado?

---

## PROTOCOLO DO AGENT

Todo agent executado em steps `subagent` ou `inline` que interaja com arquivos do projeto **DEVE** incluir um bloco `[CHANGE GUARD]` ao final de seu output.

### Instrução injetada no prompt do agent

```
📋 CHANGE GUARD — instrução obrigatória

Ao concluir sua tarefa, inclua ao final do output o seguinte bloco.
Inclua TODOS os arquivos que você abriu durante a execução — alterados ou não.

---
📋 [CHANGE GUARD]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️  ALTERADOS ({N} arquivo(s))
  {caminho/do/arquivo.ext}
    • L{start}–L{end} — {o que foi alterado}
    (repita por trecho)

👁️  REVISADOS · SEM ALTERAÇÃO ({N} arquivo(s))
  {caminho/do/arquivo.ext} — {motivo: já estava correto | não aplicável | fora do escopo deste step}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{N} alterado(s) · {N} sem alteração necessária
---

Regras para preenchimento:
- Nunca omita um arquivo consultado, mesmo que a visita tenha sido rápida
- Para arquivos alterados: liste cada trecho separado com linha aproximada
- Para arquivos não alterados: uma frase objetiva sobre o motivo basta
- Se nenhum arquivo foi acessado: escreva "CHANGE GUARD — nenhum arquivo acessado neste step"
- Arquivos de session (.squads/sessions/) são excluídos — reportar apenas arquivos do projeto
```

---

## COMO O PIPELINE-RUNNER USA O CHANGE GUARD

### Extração do bloco

Após receber o output do agent (antes de passar ao GATE-3), o pipeline-runner:

1. Procura pelo bloco entre `📋 [CHANGE GUARD]` e o segundo `━━━` ao final
2. Extrai e armazena o conteúdo do bloco como `[CHANGE_GUARD_REPORT]`
3. Remove o bloco do output antes de salvar o `output_file` (o change guard não faz parte do artefato)
4. Exibe o relatório após a linha `✅ {Nome do Step} — concluído`

### Log de exibição (após step completo)

```
📋 [CHANGE GUARD] — {nome do step}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✏️  ALTERADOS (2 arquivo(s))
  src/auth/login.ts
    • L12–L28 — adicionada validação JWT
    • L45 — corrigido tipo de retorno

👁️  REVISADOS · SEM ALTERAÇÃO (1 arquivo)
  src/auth/middleware.ts — validações já implementadas corretamente
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2 alterado(s) · 1 sem alteração necessária
```

### Se o bloco estiver ausente

```
⚠️ [CHANGE GUARD] bloco ausente no output do step "{step-id}" — rastreamento indisponível.
```

Não bloqueie o pipeline — apenas logue o aviso e continue.

### Persistência em change-log.md

Se `squad.yaml` declara `change_log: true`, o pipeline-runner persiste os relatórios em:

```
docs/.squads/sessions/{feature-slug}/change-log.md
```

Formato append:
```markdown
## {step-id} — {YYYY-MM-DD HH:MM}
Squad: {squad-slug} · Agent: {agent-id}

✏️  ALTERADOS
  {conteúdo extraído do bloco}

👁️  REVISADOS · SEM ALTERAÇÃO
  {conteúdo extraído do bloco}
```

---

## ATIVAÇÃO E DESATIVAÇÃO

O CHANGE GUARD é **ativo por padrão** em todos os steps com `execution: subagent` ou `execution: inline`.

### Desativar por squad

```yaml
# squad.yaml
change_guard: false
```

### Desativar por step

```yaml
# pipeline.yaml
- id: step-id
  name: "Formatar Saída"
  change_guard: false   # sem rastreamento — step não toca arquivos do projeto
```

### Ativar persistência em log

```yaml
# squad.yaml
change_log: true   # padrão: false
```

---

## REGRAS

| Regra | Descrição |
|-------|-----------|
| **Ativo por padrão** | Todos os steps inline/subagent, a menos que explicitamente desativado |
| **Não bloqueia** | Ausência do bloco gera aviso, nunca falha de gate |
| **Não faz parte do artefato** | O bloco é extraído antes de salvar o output_file |
| **Inclui não-alterados** | Arquivo revisado mas não modificado é tão relevante quanto o alterado |
| **Linha aproximada aceita** | Intervalos aproximados são válidos — precisão exata não é exigida |
| **Motivo obrigatório** | Para arquivos não alterados, uma frase de razão é sempre necessária |
| **Session files excluídos** | Arquivos em docs/.squads/sessions/ não entram no relatório |
| **Log persistente opcional** | Ativado via change_log: true no squad.yaml |
