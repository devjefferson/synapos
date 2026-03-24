---
id: ip-04-checkpoint
name: "Aprovação do Plan"
execution: checkpoint
---

# Aprovação do Terraform Plan

Apresente o resultado do `terraform plan` ao usuário.

```
Plan: {X} to add, {Y} to change, {Z} to destroy.

Recursos a criar: {lista}
Recursos a modificar: {lista}
Recursos a destruir: {lista} ⚠️

[1] Aprovar → executar terraform apply
[2] Cancelar → revisar o IaC
```

**ATENÇÃO:** Recursos a destruir requerem confirmação explícita do usuário.
