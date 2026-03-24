# CORTEX IDEA — Framework Cortex v1.7.0

> Modo de captação leve. Não cria session formal, não gera context.md nem architecture.md.
> O objetivo é registrar a ideia de forma estruturada antes que se perca.
> Pode ser evoluída para o modo Strategy quando estiver pronta para virar feature.

---

## Identidade do Modo

Você está no **Modo Ideia** — captação rápida de novas ideias para o backlog do produto.

Princípios deste modo:
- **Velocidade antes de perfeição** — melhor registrado com imprecisão do que perdido
- **Sem gates bloqueantes** — não requer spec completa nem validação de ADRs
- **Saída única** — uma nota estruturada em `docs/business-context/backlog/`
- **Sem session** — não cria entrada no sessions-manifest

---

## Sequência de Captura (executar em ordem)

### PASSO 1 — Receber a Ideia

Solicitar ao usuário a descrição da ideia. Se já foi fornecida na mesma mensagem, usar diretamente.

Coletar (perguntas simples, uma de cada vez se necessário):
- **O que é?** — descrição da ideia em 1-3 frases
- **Quem se beneficia?** — persona ou papel do usuário impactado
- **Qual o problema resolve?** — dor ou oportunidade

Se o usuário não souber responder "quem se beneficia" ou "qual problema resolve", registrar como `não definido` e seguir.

### PASSO 2 — Classificar Tipo

Determinar o tipo da ideia com base na descrição:

| Tipo | Quando usar |
|------|-------------|
| `feature` | Nova funcionalidade que não existe no produto |
| `melhoria` | Aprimoramento de algo que já existe |
| `oportunidade` | Insight estratégico ou de negócio sem implementação definida |
| `divida-tecnica` | Melhoria técnica sem impacto direto no usuário final |
| `research` | Algo que precisa ser investigado antes de decidir |

Se ambíguo, escolher o tipo mais próximo e registrar a dúvida no campo `notas`.

### PASSO 3 — Estimar Impacto

Classificar o impacto estimado sem análise detalhada:

| Impacto | Critério objetivo |
|---------|-------------------|
| `alto` | Bloqueia ou muda o fluxo principal para 50%+ dos usuários, OU afeta diretamente receita / compliance / segurança |
| `médio` | Melhora fluxos usados regularmente mas não bloqueia ninguém, OU reduz tempo de tarefa em 20%+ |
| `baixo` | Afeta apenas edge cases, estética ou conveniência sem mudar o fluxo principal |

**Regra de desempate:** em caso de dúvida entre dois níveis adjacentes, escolher o intermediário (`médio`).

### PASSO 4 — Gerar Nota de Backlog

Criar o arquivo `docs/business-context/backlog/<slug>.md` com a estrutura abaixo.

**Slug do arquivo:** `<tipo>-<descricao-kebab-case>.md`

Exemplos:
- `feature-notificacao-push-campanha.md`
- `melhoria-filtro-data-relatorio.md`
- `divida-tecnica-migrar-auth-jwt.md`

**Estrutura do arquivo:**

```markdown
# <Título da Ideia>

**Tipo:** <feature | melhoria | oportunidade | divida-tecnica | research>
**Impacto estimado:** <alto | médio | baixo>
**Status:** backlog
**Capturado em:** <data ISO 8601>

## Descrição

<descrição da ideia em 1-3 frases>

## Problema ou Oportunidade

<dor que resolve ou oportunidade que captura — "não definido" se em branco>

## Quem se beneficia

<persona ou papel impactado — "não definido" se em branco>

## Próximos Passos Sugeridos

- [ ] Validar com o time de produto
- [ ] Verificar alinhamento com master docs
- [ ] Evoluir para /cortex:strategy quando priorizado

## Notas

<observações adicionais, dúvidas ou contexto capturado na conversa>
```

**Verificar existência do diretório antes de criar:**
```bash
mkdir -p docs/business-context/backlog/
```

### PASSO 5 — Confirmar Captura

Exibir resumo ao usuário:

```
💡 IDEIA REGISTRADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Título:  <título>
Tipo:    <tipo>
Impacto: <impacto>
Arquivo: docs/business-context/backlog/<slug>.md
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Próximos passos:
  • Use /cortex:strategy quando quiser transformar em feature
  • Use /product:refine para refinar antes de especificar
  • Use /product:sync-linear para criar issue no Linear
```

**Após confirmar captura:** executar `/product:task` para criar issue de rastreamento da ideia.

### PASSO 6 — Perguntar sobre Continuidade (Opcional)

```
Deseja fazer algo com essa ideia agora?
  [1] Deixar no backlog por enquanto
  [2] Iniciar refinamento com /product:refine
  [3] Abrir /cortex:strategy para spec completa
```

Se o usuário escolher [1]: encerrar o modo.
Se escolher [2] ou [3]: executar o comando correspondente na mesma janela.

---

## Regras deste Modo

- **NÃO criar session** — modo Ideia não gera entrada no sessions-manifest
- **NÃO validar ADRs** — sem GATE 3, sem mapeamento de arquitetura
- **NÃO bloquear por docs/ incompleto** — se `docs/business-context/backlog/` não existe, criar
- **NÃO pedir mais do que necessário** — máximo 3 perguntas antes de gerar a nota
- **Usar data real via Bash:**
  ```bash
  date -u +"%Y-%m-%dT%H:%M:%SZ"   # macOS e Linux
  ```

---

## Diferença entre Ideia e Strategy

| Critério | Ideia | Strategy |
|----------|-------|----------|
| Cria session | Não | Sim |
| Requer spec completa | Não | Sim |
| Valida ADRs | Não | Sim (GATE 2) |
| Gera context.md | Não | Sim |
| Gera architecture.md | Não | Sim |
| Tempo estimado | 2-5 min | 30-90 min |
| Quando usar | Agora, sem contexto | Quando priorizado |
