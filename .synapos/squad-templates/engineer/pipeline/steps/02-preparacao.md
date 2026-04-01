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
- Se já estiver em uma branch de feature: confirme e prossiga
- Se o humano quiser criar: solicite o nome e execute `git checkout -b feature/{slug}`

```
[DECISÃO PENDENTE] branch-name
Contexto: não há branch de feature ativa
Opções:
  A) Criar agora: git checkout -b feature/{nome-sugerido}
  B) Continuar sem criar branch (não recomendado)
Aguardando aprovação.
```

## 2. Verificar pasta de sessão

Verifique se o diretório de output já existe e se há `context.md` ou `architecture.md` de uma sessão anterior:

```
docs/.squads/{slug}/output/{run_id}/context.md
docs/.squads/{slug}/output/{run_id}/architecture.md
```

**Se existirem arquivos de sessão anterior** (run diferente do atual):
```
📂 Sessão anterior encontrada em: docs/.squads/{slug}/output/{run_id-anterior}/

Arquivos existentes:
  - context.md ✓
  - architecture.md ✓ (ou ✗ se não existir)

O que você quer fazer?

- ▶️ Usar como base para esta sessão (continuar de onde parou)
- 🔄 Ignorar e começar do zero
```

Aguarde seleção do usuário.

## 3. Solicitar dados de entrada

```
Pronto para iniciar a investigação.

Forneça os dados da feature:
  - Cole os cartões do Linear (ID + descrição) ou descreva a feature livremente
  - Se houver spec de negócio, indique o arquivo ou cole o conteúdo
```

Aguarde a resposta antes de avançar para o próximo step.
