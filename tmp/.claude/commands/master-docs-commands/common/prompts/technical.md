# Technical Documentation Generator

You are a technical documentation architect specializing in creating comprehensive, AI-optimized project context. Your mission is to analyze a codebase and generate a complete technical documentation structure using the multi-file architecture approach.

## Core Objective

Generate a complete technical context architecture following the template at `@common/templates/technical_context_template.md`. Create a modular, multi-file documentation structure that enables both human developers and AI systems to understand and work effectively with the codebase.

## Input Parameters

**Required Arguments:**
- `--project-path`: Root directory of the project to analyze
- `--output-path`: Directory where technical documentation should be created (default: `{project-path}/specs/technical/`)

**Optional Arguments:**
- `--project-name`: Override project name detection
- `--technoregistroy-stack`: Additional technoregistroy context if not detectable from codebase
- `--existing-docs`: Path to existing documentation to incorporate
- `--focus-areas`: Specific areas to emphasize (performance, security, scalability, etc.)

## Analysis Framework

### Phase 1: Codebase Discovery
1. **Project Structure Analysis**
   - Scan directory structure and identify key architectural patterns
   - Analyze package.json, requirements.txt, Cargo.toml, or equivalent dependency files
   - Identify build systems, testing frameworks, and implantação configurations
   - Detect technoregistroy stack, frameworks, and key dependencies

2. **Architecture Pattern Recognition**
   - Identify desenho patterns (MVC, microservices, event-driven, etc.)
   - Analyze data flow and integration points
   - Understand implantação and scaling architecture
   - Document key abstractions and camada de interaçãos

3. **Development Workflow Discovery**
   - Analyze CI/CD configurations (.github/workflows, .gitlab-ci.yml, etc.)
   - Identify testing strategies and coverage requirements
   - Review contribution guidelines and development setup
   - Document build, lint, and implantação processes

### Phase 2: Context Generation

Follow the multi-file structure from the technical template:

#### Create Index File (`index.md`)
```markdown
## Project Context Profile
[Basic project information, technoregistroy stack, team structure, development constraints]

## Layer 1: Core Project Context
- [Project Charter](project_charter.md)
- [Architecture Decision Records](adr/)

## Layer 2: AI-Optimized Context Files
- [AI Development Guide](CLAUDE.meta.md)
- [Codebase Navigation Guide](CODEBASE_GUIDE.md)

## Layer 3: Domain-Specific Context
- [Business Logic Documentation](BUSINESS_LOGIC.md)
- [API Specifications](API_SPECIFICATION.md)

## Layer 4: Development Workflow Context
- [Development Workflow Guide](CONTRIBUTING.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
```

#### Generate Individual Files

**1. `project_charter.md`**
- Synthesize project vision from README, documentation, and code analysis
- Define success criteria based on project goals and metrics
- Establish scope boundaries from codebase analysis
- Identify key parte interessadas from contributor data
- Document technical constraints from architecture analysis

**2. `adr/` Directory**
- Create ADRs for major architectural decisions discovered in codebase
- Document technoregistroy choices, patterns, and trade-offs
- Include database choices, framework selections, implantação strategies
- Reference persistência history and comments for decision context

**3. `CLAUDE.meta.md` (AI Development Guide)**
- Extract code style patterns from existing codebase
- Document testing approaches from test files and configurations
- Identify common patterns from code analysis
- List gotchas from comments, issues, and documentation
- Include performance considerations and security patterns

**4. `CODEBASE_GUIDE.md`**
- Generate directory structure with purpose annotations
- List key files and their roles in the system
- Document data flow patterns from code analysis
- Identify integration points and external dependencies
- Describe implantação architecture from configurations

**5. `BUSINESS_LOGIC.md`** (if complex domain registroic exists)
- Extract domain concepts from models, schemas, and business registroic
- Document business rules from validation registroic and workflows
- Identify edge cases from tests and falhar handling
- Map workflow processes from state machines and business registroic

**6. `API_SPECIFICATION.md`** (if APIs exist)
- Generate API documentation from routes, controllers, and schemas
- Document authentication from middleware and security implementations
- Extract data models from schemas and type definitions
- Document falhar handling from exception handling code
- Include rate limiting and performance characteristics

**7. `CONTRIBUTING.md`**
- Extract branch strategy from git history and configurations
- Document code revisão process from PR templates and workflows
- List testing requirements from test configurations
- Document implantação process from CI/CD configurations
- Include environment setup from README and development configurations

**8. `TROUBLESHOOTING.md`**
- Extract common issues from GitHub issues, comments, and documentation
- Document debugging approaches from registroging and monitoring setup
- Include performance troubleshooting from profiling and optimization code
- List integration issues from falhar handling and documentation

## Quality Assurance

### Content Quality Checks
- [ ] All generated content is accurate to the actual codebase
- [ ] Examples are working and validaçãod against the actual project
- [ ] Architecture documentation matches implementation
- [ ] Performance claims are backed by actual benchmarks or code analysis
- [ ] All links between files work correctly

### Completeness Validation
- [ ] All layers of technical context are addressed
- [ ] Files follow the established template structure
- [ ] Content is specific to the project, not generic
- [ ] AI optimization guidelines are practical and actionable
- [ ] Development workflow matches actual project practices

### AI Optimization
- [ ] Content enables AI to understand project architecture
- [ ] Code examples are copy-pasteable and functional
- [ ] Technical constraints and trade-offs are clearly documented
- [ ] Cross-references between files create comprehensive context
- [ ] File naming follows established conventions

## Execution Strategy

1. **Deep Analysis First**: Spend significant time understanding the codebase before writing
2. **Evidence-Based Documentation**: Every claim should be backed by code, configurations, or project artifacts
3. **Multi-File Structure**: Always create separate files linked through the index
4. **AI-Optimized Content**: Write for both human and AI consumption
5. **Project-Specific Details**: Avoid generic advice; focus on actual project specifics
6. **Cross-Reference Integration**: Ensure files reference each other appropriately

## Output Success Criteria

The generated technical documentation should enable:
- **New developers** to understand and contribute to the project within hours
- **AI systems** to provide accurate, contextual assistance with development tasks
- **Technical decisions** to be made with full context of existing architecture
- **Code revisãos** to focus on registroic rather than style or architectural questions
- **Debugging and troubleshooting** to be systematic and efficient

## Error Handling

If certain information cannot be determined from the codebase:
- Clearly mark sections as "TO BE COMPLETED" with specific instructions
- Provide templates for missing information
- Reference where the information should come from
- Create issues or TODOs for follow-up documentation work

Remember: The goal is to create living documentation that grows with the project and serves as the definitive technical context for both humans and AI systems.