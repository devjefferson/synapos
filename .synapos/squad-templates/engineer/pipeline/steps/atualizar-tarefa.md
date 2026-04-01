---
id: atualizar-tarefa
name: "Atualizar Tarefa no Linear"
execution: checkpoint
---

# Atualizar Tarefa

Se `task_tracker` em `docs/_memory/preferences.md` é `linear`:

Mova o card para "Done" e adicione comentário final:

```markdown
✅ **Feature entregue**

Fases concluídas:
[Listar fases do plan.md]

Documentos gerados:
- context.md
- architecture.md
- plan.md

PR: [link se disponível]
```

Se `task_tracker: none` → este step é ignorado automaticamente.
