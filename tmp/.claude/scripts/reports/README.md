# PX Tech Report Generator

Sistema de geração de relatórios executivos em PPTX para apresentação ao board.

## Design System

Baseado no **Boletim Tech Jan 2026** da PX Ativos Judiciais:

| Elemento | Cor | Hex |
|----------|-----|-----|
| Background Principal | Navy Blue | `#1E2A3A` |
| Destaque/Accent | Amber | `#F5A623` |
| Texto Principal | White | `#FFFFFF` |
| Texto Secundário | Light Gray | `#A0A0A0` |
| Card Navy | Dark Navy | `#2D3E50` |
| Card Success | Green | `#27AE60` |

## Instalação

```bash
pip install python-pptx
```

## Uso via CLI

### Relatório Semanal

```bash
python .claude/scripts/reports/pptx_generator.py --type weekly --output weekly_report.pptx

# Com dados customizados
python .claude/scripts/reports/pptx_generator.py --type weekly --data weekly_data.json --output report_semana_03.pptx
```

### Relatório Geral

```bash
python .claude/scripts/reports/pptx_generator.py --type general --output project_report.pptx

# Com dados customizados
python .claude/scripts/reports/pptx_generator.py --type general --data general_data.json --output rhilo_report_2026.pptx
```

## Uso via Comandos Cortex

Os relatórios são gerados automaticamente pelo agente `executive-report-generator`:

```bash
# Relatório semanal
/report:weekly

# Relatório geral do projeto
/report:general
```

## Estrutura de Dados JSON

### Weekly Report Data

```json
{
  "week_number": "03",
  "period": "13/01 a 19/01/2026",
  "theme": "integrações externas",
  "commits": "45",
  "features": "8",
  "savings": "R$ 21.600",
  "hours_saved": "180h",
  "metrics": [
    {"value": "45", "label": "Commits", "color": "navy"},
    {"value": "8", "label": "Features", "color": "amber"},
    {"value": "R$ 21.600", "label": "Economia", "color": "light"},
    {"value": "180h", "label": "Horas economizadas", "color": "light"}
  ],
  "highlights": [
    {"title": "Urano Integration", "description": "Polling automático de processos"},
    {"title": "Global Perícias", "description": "Webhook de laudos médicos"},
    {"title": "Case Actions", "description": "Sistema de ações pós-ajuizamento"}
  ],
  "deliveries": [
    {"title": "Urano Polling System", "description": "Integração completa com BullMQ", "status": "success"},
    {"title": "Case Actions Infrastructure", "description": "20+ tipos de ações implementados", "status": "success"},
    {"title": "Technical Assistant Interface", "description": "5 vertical slices completos", "status": "success"},
    {"title": "Contact Assistance Resolution", "description": "Fluxo de resolução de contatos", "status": "success"}
  ],
  "contributors": [
    {"title": "Marco", "description": "25 commits - Backend & Integrações", "status": "success"},
    {"title": "Tarda", "description": "15 commits - Frontend & UX", "status": "success"},
    {"title": "Rafael", "description": "5 commits - Arquitetura & Docs", "status": "success"}
  ],
  "total_savings": "R$ 21.600",
  "closing_message": "Semana de grandes avanços em integrações",
  "quote": "Metodologia Cortex: 4x mais produtividade com desenvolvimento AI-First",
  "final_metrics": [
    {"value": "45", "label": "Commits"},
    {"value": "8", "label": "Features"},
    {"value": "R$ 21.600", "label": "Economia"}
  ]
}
```

### General Report Data

```json
{
  "project_name": "RHILO",
  "year": 2026,
  "description": "Plataforma legal-tech para gestão de casos judiciais",
  "total_features": "50+",
  "total_savings": "R$ 450.000",
  "completion": "75%",
  "commits_total": "1.200+",
  "contributors_total": "5",
  "months_dev": "8",
  "adrs": "43",
  "overview_metrics": [
    {"value": "1.200+", "label": "Commits totais", "color": "navy"},
    {"value": "5", "label": "Contributors", "color": "amber"},
    {"value": "8", "label": "Meses de dev", "color": "light"},
    {"value": "43", "label": "ADRs", "color": "light"}
  ],
  "tech_stack": [
    {"title": "Backend", "description": "NestJS + Prisma + PostgreSQL"},
    {"title": "Frontend", "description": "React + TypeScript + TailwindCSS"},
    {"title": "Infra", "description": "AWS ECS + RDS + S3 + CloudFront"}
  ],
  "roi_breakdown": [
    {"title": "Horas economizadas", "description": "3.750 horas", "status": "success"},
    {"title": "Custo economizado", "description": "R$ 450.000", "status": "success"},
    {"title": "Equivalente tradicional", "description": "15 desenvolvedores/mês", "status": "in_progress"},
    {"title": "Time real", "description": "3-5 pessoas", "status": "success"}
  ],
  "hours_saved": "3.750 horas",
  "cost_saved": "R$ 450.000",
  "dev_equivalent": "15 devs tradicionais",
  "actual_team": "3-5 pessoas",
  "modules": [
    {"title": "Registration Management", "description": "5 entidades, 20+ endpoints, 354 testes", "status": "success"},
    {"title": "Case Management", "description": "Workflow engine com SLA e transições", "status": "success"},
    {"title": "Urano Integration", "description": "Polling + webhooks + documentos", "status": "success"},
    {"title": "Case Actions System", "description": "30 tipos de ações pós-ajuizamento", "status": "success"}
  ],
  "modules_count": "12",
  "closing_quote": "Transformando desenvolvimento de software com IA"
}
```

## Slides Gerados

### Relatório Semanal (5 slides)

1. **Capa** - Título, período, métricas destaque
2. **Resumo Executivo** - KPIs principais, highlights
3. **Entregas da Semana** - Lista de features com economia
4. **Contributors** - Time envolvido e contribuições
5. **Obrigado** - Métricas finais e quote

### Relatório Geral (6 slides)

1. **Capa** - Projeto, ano, métricas totais
2. **Visão Geral** - O que é o projeto, tech stack
3. **Metodologia Cortex** - AI-First, multiplicador 4x
4. **ROI Total** - Economia acumulada, equivalência
5. **Módulos Entregues** - Status de cada componente
6. **Obrigado** - Consolidado e quote final

## Fórmula de Economia (Cortex vs. Tradicional)

```
Economia = (Horas Tradicional - Horas Cortex) × R$ 120/hora

Multiplicador Cortex: 4x (conservador)

Exemplo:
- Feature LARGE: 80h tradicional → 20h Cortex
- Economia: (80 - 20) × R$ 120 = R$ 7.200
```

### Tabela de Complexidade

| Complexidade | Tradicional | Cortex | Economia |
|--------------|-------------|--------|----------|
| TRIVIAL | 4h | 1h | R$ 360 |
| SMALL | 16h | 4h | R$ 1.440 |
| MEDIUM | 40h | 10h | R$ 3.600 |
| LARGE | 80h | 20h | R$ 7.200 |
| EPIC | 200h | 50h | R$ 18.000 |

## Arquivos

```
.claude/scripts/reports/
├── README.md                    # Esta documentação
├── pptx_generator.py           # Script principal de geração
└── examples/
    ├── weekly_data.json        # Exemplo de dados semanais
    └── general_data.json       # Exemplo de dados gerais
```

## Customização

O script usa classes configuráveis:

- `PXColors` - Paleta de cores oficial
- `SlideConfig` - Dimensões, margens, fontes

Para customizar, edite as constantes no início do arquivo `pptx_generator.py`.

## Integração com Git

O agente `executive-report-generator` coleta automaticamente:

```bash
# Contributors da semana
git shortlog -sn --since="7 days ago" --no-merges

# Commits da semana
git log --oneline --since="7 days ago" --no-merges | wc -l

# Diff summary
git diff --shortstat HEAD~50
```

---

*Gerado pelo Framework Cortex - PX Ativos Judiciais*
