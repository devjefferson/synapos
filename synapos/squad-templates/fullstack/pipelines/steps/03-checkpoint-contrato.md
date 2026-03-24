---
id: 03-checkpoint-contrato
name: "Aprovação do Contrato"
execution: checkpoint
---

# Aprovação do Contrato de API

Apresente ao usuário o contrato gerado em `docs/api-contract.md`.

```
Contrato definido por Carlos Coordenador:

{resumo dos endpoints}

Responsabilidades FE/BE:
{tabela de responsabilidades}

Revise e confirme:
[1] Aprovar contrato → prosseguir com implementação FE e BE em paralelo
[2] Solicitar ajuste → descreva o que precisa mudar
```

Aguarde confirmação antes de prosseguir.
Se o usuário solicitar ajuste, retorne ao step 02-contrato-api com o feedback.
