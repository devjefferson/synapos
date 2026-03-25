---
id: 03-containers
name: "Containerização"
agent: claudio-containers
execution: subagent
model_tier: powerful
output_files:
  - container-spec.md
---

# Containerização

**Agent:** Cláudio Containers 🐳

## Tarefa

1. Crie/revise Dockerfiles com multi-stage build
2. Configure docker-compose para desenvolvimento local
3. Defina manifests Kubernetes (se aplicável): Deployment, Service, HPA
4. Configure health checks (liveness + readiness)
5. Defina resource limits e requests

## Critérios

- [ ] Multi-stage build, usuário não-root
- [ ] Health checks configurados
- [ ] Resource limits definidos
- [ ] Sem secrets na imagem
