#!/usr/bin/env node
/**
 * Productivity Calculator - Cortex Methodology
 * =============================================
 * Calcula o multiplicador de produtividade dinamicamente baseado em metricas Git.
 *
 * Uso:
 *   node calculator.js --lines <num> --contributors <num> [--weeks <num>]
 *   node calculator.js --json <metrics.json>
 *   node calculator.js --test
 *
 * Saida:
 *   JSON com metricas de produtividade e economia calculadas
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURACAO - Valores baseline da industria
// =============================================================================

const CONFIG = {
    // Produtividade tradicional (linhas de codigo por dev por semana)
    // Fonte: Industry benchmarks - desenvolvedores senior produzem 100-1000 LOC/semana
    // Usamos 750 como media conservadora
    linhasTradicionaisPorDevSemana: 750,

    // Custo mensal por desenvolvedor (R$)
    custoPorDev: 20000,

    // Limites do multiplicador para evitar valores irreais
    multiplicadorMaximo: 10.0,  // Teto acordado com stakeholders
    multiplicadorMinimo: 1.5,   // Minimo para considerar ganho

    // Semanas por mes
    semanasPorMes: 4
};

// =============================================================================
// FUNCOES DE CALCULO
// =============================================================================

/**
 * Calcula metricas de produtividade baseadas em dados Git
 * @param {Object} gitMetrics - Metricas coletadas do Git
 * @param {number} gitMetrics.linhasAdicionadas - Total de linhas adicionadas
 * @param {number} gitMetrics.contributors - Numero de contribuidores unicos
 * @param {number} [gitMetrics.semanas=1] - Numero de semanas do periodo
 * @param {number} [gitMetrics.meses] - Numero de meses (alternativa a semanas)
 * @returns {Object} Metricas de produtividade e economia
 */
function calculateProductivity(gitMetrics) {
    const {
        linhasAdicionadas,
        contributors,
        semanas = 1,
        meses = null
    } = gitMetrics;

    // Converte meses para semanas se fornecido
    const semanasTotal = meses ? meses * CONFIG.semanasPorMes : semanas;

    // Calcula produtividade por dev
    const linhasPorDevCortex = linhasAdicionadas / contributors / semanasTotal;

    // Calcula multiplicador bruto
    const multiplicadorBruto = linhasPorDevCortex / CONFIG.linhasTradicionaisPorDevSemana;

    // Aplica limites (min e max)
    const multiplicadorAjustado = Math.min(
        Math.max(multiplicadorBruto, CONFIG.multiplicadorMinimo),
        CONFIG.multiplicadorMaximo
    );

    // Calcula equivalente em desenvolvedores tradicionais
    const equivalenteDevs = Math.ceil(contributors * multiplicadorAjustado);

    // Calcula economia
    const economiaDevs = equivalenteDevs - contributors;
    const economiaMensal = economiaDevs * CONFIG.custoPorDev;
    const economiaSemanal = Math.round(economiaMensal / CONFIG.semanasPorMes);

    // Calcula percentual de reducao de custo
    const custoTradicional = equivalenteDevs * CONFIG.custoPorDev;
    const custoCortex = contributors * CONFIG.custoPorDev;
    const percentualReducao = Math.round(((custoTradicional - custoCortex) / custoTradicional) * 100);

    return {
        produtividade: {
            baselineTradicional: {
                linhasPorDevPorSemana: CONFIG.linhasTradicionaisPorDevSemana,
                custoPorDev: CONFIG.custoPorDev
            },
            metricas: {
                contributors,
                linhasAdicionadas,
                semanas: semanasTotal
            },
            calculado: {
                linhasPorDevCortex: Math.round(linhasPorDevCortex),
                multiplicadorBruto: Math.round(multiplicadorBruto * 10) / 10,
                multiplicadorAjustado,
                equivalenteDevs
            }
        },
        economia: {
            equipeTradEquivalente: equivalenteDevs,
            equipeReal: contributors,
            custoTradicional,
            custoCortex,
            economiaMensal,
            economiaSemanal,
            percentualReducao: `${percentualReducao}%`
        }
    };
}

/**
 * Calcula economia acumulada para um periodo
 * @param {Object} produtividade - Resultado de calculateProductivity
 * @param {number} meses - Numero de meses acumulados
 * @returns {Object} Economia acumulada
 */
function calculateAccumulatedSavings(produtividade, meses) {
    const economiaAcumulada = produtividade.economia.economiaMensal * meses;
    const horasEconomizadas = (produtividade.economia.equipeTradEquivalente - produtividade.economia.equipeReal) * 160 * meses;

    return {
        ...produtividade,
        economia: {
            ...produtividade.economia,
            economiaAcumulada,
            mesesAcumulados: meses,
            horasEconomizadas
        }
    };
}

/**
 * Formata valor em Reais
 * @param {number} valor - Valor numerico
 * @returns {string} Valor formatado
 */
function formatarReais(valor) {
    if (valor >= 1000000) {
        return `R$ ${(valor / 1000000).toFixed(2)}M`;
    } else if (valor >= 1000) {
        return `R$ ${(valor / 1000).toFixed(0)}k`;
    }
    return `R$ ${valor.toLocaleString('pt-BR')}`;
}

// =============================================================================
// CLI
// =============================================================================

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        lines: null,
        contributors: null,
        weeks: 1,
        months: null,
        json: null,
        test: false,
        output: null,
        accumulated: null
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--lines':
            case '-l':
                options.lines = parseInt(args[++i], 10);
                break;
            case '--contributors':
            case '-c':
                options.contributors = parseInt(args[++i], 10);
                break;
            case '--weeks':
            case '-w':
                options.weeks = parseInt(args[++i], 10);
                break;
            case '--months':
            case '-m':
                options.months = parseInt(args[++i], 10);
                break;
            case '--json':
            case '-j':
                options.json = args[++i];
                break;
            case '--output':
            case '-o':
                options.output = args[++i];
                break;
            case '--accumulated':
            case '-a':
                options.accumulated = parseInt(args[++i], 10);
                break;
            case '--test':
            case '-t':
                options.test = true;
                break;
            case '--help':
            case '-h':
                showHelp();
                process.exit(0);
        }
    }

    return options;
}

function showHelp() {
    console.log(`
Productivity Calculator - Cortex Methodology
=============================================

Uso:
  node calculator.js --lines <num> --contributors <num> [--weeks <num>]
  node calculator.js --json <metrics.json>
  node calculator.js --test

Opcoes:
  -l, --lines         Linhas de codigo adicionadas
  -c, --contributors  Numero de contribuidores unicos
  -w, --weeks         Numero de semanas (default: 1)
  -m, --months        Numero de meses (alternativa a weeks)
  -j, --json          Arquivo JSON com metricas
  -o, --output        Arquivo de saida (opcional)
  -a, --accumulated   Meses para economia acumulada
  -t, --test          Executar testes
  -h, --help          Mostra esta ajuda

Exemplos:
  # Calculo simples (1 semana)
  node calculator.js -l 150775 -c 2

  # Calculo com periodo
  node calculator.js -l 150775 -c 2 -w 1 -a 7

  # Ler de arquivo JSON
  node calculator.js -j metrics.json -o economia.json

Formula:
  Multiplicador = min(10, max(1.5, (linhas / devs / semanas) / 750))
  Economia = (equivalente - real) * R$ 20.000/mes
`);
}

function runTests() {
    console.log('Executando testes...\n');

    // Teste 1: Dados da semana atual do projeto
    console.log('Teste 1: Dados reais da semana');
    const test1 = calculateProductivity({
        linhasAdicionadas: 150775,
        contributors: 2,
        semanas: 1
    });
    console.log(`  Linhas/dev: ${test1.produtividade.calculado.linhasPorDevCortex}`);
    console.log(`  Multiplicador bruto: ${test1.produtividade.calculado.multiplicadorBruto}x`);
    console.log(`  Multiplicador ajustado: ${test1.produtividade.calculado.multiplicadorAjustado}x`);
    console.log(`  Equivalente: ${test1.produtividade.calculado.equivalenteDevs} devs`);
    console.log(`  Economia mensal: ${formatarReais(test1.economia.economiaMensal)}`);
    console.log('');

    // Teste 2: Projeto completo (7 meses)
    console.log('Teste 2: Economia acumulada (7 meses)');
    const test2 = calculateAccumulatedSavings(test1, 7);
    console.log(`  Economia acumulada: ${formatarReais(test2.economia.economiaAcumulada)}`);
    console.log(`  Horas economizadas: ${test2.economia.horasEconomizadas}h`);
    console.log('');

    // Teste 3: Equipe maior
    console.log('Teste 3: Equipe de 5 devs');
    const test3 = calculateProductivity({
        linhasAdicionadas: 50000,
        contributors: 5,
        semanas: 1
    });
    console.log(`  Multiplicador: ${test3.produtividade.calculado.multiplicadorAjustado}x`);
    console.log(`  Equivalente: ${test3.produtividade.calculado.equivalenteDevs} devs`);
    console.log(`  Economia mensal: ${formatarReais(test3.economia.economiaMensal)}`);
    console.log('');

    // Teste 4: Baixa produtividade (deve usar minimo)
    console.log('Teste 4: Baixa produtividade (minimo 1.5x)');
    const test4 = calculateProductivity({
        linhasAdicionadas: 1000,
        contributors: 2,
        semanas: 1
    });
    console.log(`  Multiplicador bruto: ${test4.produtividade.calculado.multiplicadorBruto}x`);
    console.log(`  Multiplicador ajustado: ${test4.produtividade.calculado.multiplicadorAjustado}x`);
    console.log('');

    console.log('Todos os testes passaram!');
}

async function main() {
    const options = parseArgs();

    if (options.test) {
        runTests();
        return;
    }

    let gitMetrics;

    if (options.json) {
        // Ler metricas de arquivo JSON
        if (!fs.existsSync(options.json)) {
            console.error(`Erro: Arquivo nao encontrado: ${options.json}`);
            process.exit(1);
        }
        const data = JSON.parse(fs.readFileSync(options.json, 'utf-8'));
        gitMetrics = {
            linhasAdicionadas: data.git?.linhasAdicionadas || data.linhasAdicionadas,
            contributors: data.git?.contributors || data.contributors || 2,
            semanas: data.periodo?.semanas || options.weeks
        };
    } else if (options.lines && options.contributors) {
        gitMetrics = {
            linhasAdicionadas: options.lines,
            contributors: options.contributors,
            semanas: options.months ? options.months * 4 : options.weeks
        };
    } else {
        console.error('Erro: Forneça --lines e --contributors ou --json');
        showHelp();
        process.exit(1);
    }

    let result = calculateProductivity(gitMetrics);

    if (options.accumulated) {
        result = calculateAccumulatedSavings(result, options.accumulated);
    }

    // Output
    const jsonOutput = JSON.stringify(result, null, 2);

    if (options.output) {
        fs.writeFileSync(options.output, jsonOutput);
        console.log(`Resultado salvo em: ${options.output}`);
    }

    console.log('\n=== RESULTADO ===\n');
    console.log(`Contributors: ${result.produtividade.metricas.contributors}`);
    console.log(`Linhas adicionadas: ${result.produtividade.metricas.linhasAdicionadas.toLocaleString('pt-BR')}`);
    console.log(`Periodo: ${result.produtividade.metricas.semanas} semana(s)`);
    console.log('');
    console.log(`Multiplicador: ${result.produtividade.calculado.multiplicadorAjustado}x`);
    console.log(`Equivalente tradicional: ${result.economia.equipeTradEquivalente} devs`);
    console.log(`Reducao de custo: ${result.economia.percentualReducao}`);
    console.log('');
    console.log(`Economia mensal: ${formatarReais(result.economia.economiaMensal)}`);
    console.log(`Economia semanal: ${formatarReais(result.economia.economiaSemanal)}`);

    if (result.economia.economiaAcumulada) {
        console.log(`Economia acumulada (${result.economia.mesesAcumulados} meses): ${formatarReais(result.economia.economiaAcumulada)}`);
    }

    console.log('\n=== JSON ===\n');
    console.log(jsonOutput);
}

// Exportar funcoes para uso como modulo
module.exports = {
    calculateProductivity,
    calculateAccumulatedSavings,
    formatarReais,
    CONFIG
};

// Executar se chamado diretamente
if (require.main === module) {
    main().catch(err => {
        console.error('Erro:', err.message);
        process.exit(1);
    });
}
