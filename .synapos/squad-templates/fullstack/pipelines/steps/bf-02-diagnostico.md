---
id: bf-02-diagnostico
name: "Diagnóstico e Localização"
agent: carlos-coordenador
execution: subagent
model_tier: powerful
output_files:
  - bug-diagnosis.md
---

# Diagnóstico de Bug Fullstack

**Agent:** Carlos Coordenador 🔗

## Tarefa

1. Identifique a camada do bug: Frontend | Backend | Integração FE↔BE
2. Reproduza o problema com steps claros
3. Identifique o root cause
4. Avalie se o contrato de API está sendo respeitado em ambos os lados

## Output

Salve em `docs/bug-diagnosis.md`:

```markdown
# Diagnóstico do Bug

**Camada:** Frontend | Backend | Integração
**Reprodução:** (steps para reproduzir)
**Root cause:** (causa raiz identificada)
**Contrato:** (está sendo respeitado? Se não, onde diverge?)
**Agente responsável pelo fix:** (rodrigo-react | alexandre-api | ambos)
```
