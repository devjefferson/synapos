---
name: synapos-gate-system
version: 3.0.0
description: Gate único — executa os comandos de verify do stack.md no fim do pipeline
---

# SYNAPOS GATE SYSTEM v3.0.0

> Um gate real. Roda comandos de verdade. Bloqueia de verdade quando falham.
>
> Antes tínhamos 3 gates que eram checagens textuais no output do LLM — teatro.
> Agora só existe **GATE-VERIFY**, que executa lint/test/typecheck/build via shell.

---

## GATE-VERIFY

### Quando usar

Aplicado no último step do pipeline (declarado no yaml como `gate: verify`).

### O que faz

1. Lê os comandos da seção `## Comandos` em `docs/_memory/stack.md`.
2. Executa cada comando não vazio (Lint, Test, Typecheck, Build — o que estiver preenchido).
3. Se todos retornam código 0: aprovado.
4. Se algum falha:
   - Exibe o output do comando.
   - Pede ao step anterior para corrigir, passando a saída do erro como contexto.
   - Re-executa os comandos.
   - **Uma tentativa de correção apenas.**
   - Se falhar de novo: escala ao usuário com session preservada.

### Saídas

**Aprovado:**
```
✅ GATE-VERIFY aprovado
   lint:      ok
   test:      ok (42 testes)
   typecheck: ok
```

**Corrigindo:**
```
⚠️  GATE-VERIFY falhou
   Comando: {comando}
   Tentando correção (1/1)...
```

**Escalado:**
```
🚫 GATE-VERIFY falhou após correção automática
   Comando: {comando}
   Saída: {stderr resumido}

   Session: docs/.squads/sessions/{feature-slug}/
   Arquivos modificados estão intactos. Corrija manualmente e rode /init novamente.
```

**Sem comandos configurados:**
```
⚠️  GATE-VERIFY pulado — nenhum comando em docs/_memory/stack.md
   Adicione comandos na seção "## Comandos" para habilitar verify.
```

---

## COMO CONFIGURAR

Em `docs/_memory/stack.md`:

```markdown
## Comandos
- Install: npm install
- Lint: npm run lint
- Test: npm test
- Typecheck: npx tsc --noEmit
- Build: npm run build
```

Cada linha `- {Nome}: {comando}` vira um check. `-` ou vazio significa pular.

---

## POR QUE SÓ UM GATE

Gates que são checagens textuais do output do LLM (ex: "output não está vazio", "output não contém TODO") não garantem nada — o modelo pode gerar 51 caracteres de lixo e passar. Também não previnem bugs reais.

O único gate que importa é: **o código compila, passa no lint, passa nos testes?**

Se sim, aprova. Se não, corrige ou escala. Sem cerimônia intermediária.

---

## REGRAS

| Regra | Por quê |
|---|---|
| **Zero gates bloqueantes por texto** | LLM pode vencer qualquer checagem textual trivialmente |
| **Verify roda shell** | É o único "gate" que não pode ser enganado |
| **Uma correção automática** | Mais que isso vira loop caro e geralmente piora o código |
| **Escala preserva session** | Nunca deleta arquivos, nunca reverte. Só para e avisa. |
| **Stack.md vazio = skip com aviso** | Projeto novo sem comandos configurados não deve ser bloqueado |
