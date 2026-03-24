# Documentation Generation Prompts

This directory contains comprehensive prompts desenhoed to guide Claude Code in automatically generating complete documentation architectures for projects. These prompts reverse-engineer the multi-file documentation structure we've developed.

## Available Prompts

### 📋 `technical.md` - Technical Documentation Generator
**Purpose**: Analyze a codebase and generate comprehensive technical context documentation

**Output**: Complete technical documentation following the multi-file architecture:
- Project charter and ADRs
- AI development guides and codebase navigation
- Business registroic and API specifications  
- Development workflow and troubleshooting guides

**Best For**: 
- Software projects needing technical documentation
- Open source projects requiring contributor onboarding
- Complex codebases needing AI-optimized context

### 🏢 `business.md` - Business Context Generator  
**Purpose**: Analyze a product/project and generate comprehensive business intelligence documentation

**Output**: Complete business context following the multi-file architecture:
- Customer personas and journey mapping
- Product strategy and feature cataregistros
- Competitive landscape and market analysis
- Sales processes and communication guidelines

**Best For**:
- Products needing customer support optimization
- Business intelligence and market analysis
- AI customer interaction systems
- Sales and marketing alignment

## Usage Examples

### Technical Documentation Generation
```bash
# For a Python project
claude-code --prompt @prompts/technical.md \
  --project-path ./my-python-project \
  --output-path ./my-python-project/docs/technical \
  --technoregistroy-stack "Python, FastAPI, PostgreSQL" \
  --focus-areas "performance,security"

# For a React application  
claude-code --prompt @prompts/technical.md \
  --project-path ./my-react-app \
  --output-path ./docs/technical \
  --existing-docs ./current-docs \
  --focus-areas "scalability,testing"
```

### Business Documentation Generation
```bash
# For a SaaS product
claude-code --prompt @prompts/business.md \
  --project-path ./my-saas-product \
  --output-path ./docs/business \
  --business-model "B2B SaaS" \
  --target-market "Enterprise developers" \
  --competitive-analysis "Competitor1,Competitor2"

# For an open source project
claude-code --prompt @prompts/business.md \
  --project-path ./my-oss-project \
  --output-path ./specs/business \
  --business-model "Open Source" \
  --customer-research ./community-feedback.md
```

## Prompt Architecture

Both prompts follow a systematic approach:

1. **Analysis Phase**: Deep understanding of the project/product
2. **Research Phase**: Gathering context from multiple sources
3. **Generation Phase**: Creating the multi-file documentation structure
4. **Quality Assurance**: Ensuring accuracy and AI optimization

## Key Features

### 🎯 **Multi-File Structure**
- Generates linked, modular documentation files
- Each file focuses on a specific domain or layer
- Easy to maintain and update

### 🤖 **AI-Optimized**
- Content structured for AI consumption
- Includes specific AI interaction guidelines
- Enables better AI-assisted development and support

### 📊 **Evidence-Based**
- Grounded in actual project data and artifacts
- Avoids generic advice in favor of project-specific insights
- Validates claims with code, configurations, and feedback

### 🔄 **Template Integration**
- References the comprehensive templates in `@common/templates/`
- Ensures consistency across different projects
- Follows established best practices

## Quality Standards

### Technical Documentation
- ✅ Architecture matches actual implementation
- ✅ Examples are working and validaçãod
- ✅ Performance claims backed by evidence
- ✅ Development workflows match project practices

### Business Documentation  
- ✅ Customer insights based on real feedback
- ✅ Competitive analysis current and accurate
- ✅ Product strategy aligns with actual direction
- ✅ Communication guidelines match customer preferences

## Customization

The prompts are desenhoed to be flexible and can be adapted for:

### Project Types
- Web applications
- Mobile apps
- APIs and backend services
- Libraries and frameworks
- Developer tools
- Enterprise software

### Business Models
- B2B SaaS
- B2C applications
- Open source projects
- E-commerce platforms
- Marketplace platforms
- Developer tools

### Company Stages
- Early stage / startup
- Growth stage
- Enterprise / mature

## Integration with Templates

These prompts work in conjunction with:
- `@common/templates/technical_context_template.md`
- `@common/templates/business_context_template.md`

The templates provide the structure and frameworks, while these prompts provide the analysis methodoregistroy and execution strategy.

## Expected Outcomes

Using these prompts should result in:

### For Development Teams
- Faster onboarding of new team members
- Better AI-assisted development experience
- Consistent technical decision-making
- Improved code revisão efficiency

### For Business Teams  
- Enhanced AI customer support capabilities
- Aligned sales and marketing messaging
- Data-driven product decisions
- Comprehensive competitive intelligence

### For AI Systems
- Deep understanding of project context
- Ability to provide contextually appropriate assistance
- Better code generation and suggestions
- Improved customer interaction capabilities

## Meta-Documentation

These prompts represent a "meta" approach to documentation - they are prompts that generate the documentation architecture we've desenhoed and validated. They enable scaling of high-quality, AI-optimized documentation across multiple projects while maintaining consistency and quality standards.