---
id: 02-preparacao
name: "Preparação"
agent: leo-engenheiro
execution: inline
model_tier: fast
---

# Preparação

## 1. Verificar branch de feature

Execute:
```bash
git branch --show-current
```

- Se estiver em `main` ou `master`: apresente opção de criar branch de feature
- Se já estiver em branch de feature: confirme e prossiga
- Se o humano quiser criar: solicite o nome e execute `git checkout -b feature/{slug}`

```
[DECISÃO PENDENTE] branch-name
Contexto: não há branch de feature ativa
Opções:
  A) Criar agora: git checkout -b feature/{nome-sugerido}
  B) Continuar sem criar branch (não recomendado)
Aguardando aprovação.
```

## 2. Entrada da feature

Use, nesta ordem, o que já existir — **não repergunte**:
1. `spec.md` / `handoff.md` na session (vindos do squad de Produto)
2. `[TASK]` recebido do orchestrator
3. `context.md` existente na session (retomada)

Só se nenhum existir:

```
Forneça os dados da feature:
  - cole os cartões/issues (ID + descrição) ou descreva livremente
  - se houver spec de negócio, indique o arquivo
```
