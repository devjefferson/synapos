#!/usr/bin/env node
/**
 * HTML to PPTX Converter (Editable Native Edition)
 * =================================================
 * Converte arquivos HTML para apresentacao PowerPoint EDITAVEL
 * usando pptxgenjs nativo com posicionamento preciso.
 *
 * Baseado na documentacao oficial do Claude.ai e pptxgenjs.
 *
 * Uso:
 *   node convert.js --input <dir_html> --output <arquivo.pptx>
 *   node convert.js -i reports/curso-cdd/aula-01 -o aula_01.pptx
 *
 * Dependencias:
 *   npm install cheerio pptxgenjs
 */

const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const cheerio = require('cheerio');

// =============================================================================
// CONFIGURACOES - Slide 16:9
// =============================================================================

const SLIDE_WIDTH_PX = 960;
const SLIDE_HEIGHT_PX = 540;
const SLIDE_WIDTH_IN = 10;        // inches (16:9)
const SLIDE_HEIGHT_IN = 5.625;    // inches (16:9)

// Conversao de pixels para inches
const pxToInchX = (px) => (px / SLIDE_WIDTH_PX) * SLIDE_WIDTH_IN;
const pxToInchY = (px) => (px / SLIDE_HEIGHT_PX) * SLIDE_HEIGHT_IN;

// =============================================================================
// PARSER DE ESTILOS CSS
// =============================================================================

function parseStyle(styleStr) {
    if (!styleStr) return {};
    const style = {};
    const props = styleStr.split(';').filter(p => p.trim());

    for (const prop of props) {
        const colonIdx = prop.indexOf(':');
        if (colonIdx > 0) {
            const key = prop.substring(0, colonIdx).trim().toLowerCase();
            const value = prop.substring(colonIdx + 1).trim();
            style[key] = value;
        }
    }
    return style;
}

function extractPx(str) {
    if (!str) return null;
    if (str === '100%') return SLIDE_WIDTH_PX;
    const match = str.match(/(-?\d+(?:\.\d+)?)\s*px/);
    return match ? parseFloat(match[1]) : null;
}

function extractColor(colorStr) {
    if (!colorStr) return null;

    // Hex color
    const hexMatch = colorStr.match(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/);
    if (hexMatch) {
        let hex = hexMatch[1];
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        return hex.toUpperCase();
    }

    // Gradiente - extrai primeira cor
    const gradMatch = colorStr.match(/linear-gradient\([^,]+,\s*#([0-9a-fA-F]{6})/);
    if (gradMatch) return gradMatch[1].toUpperCase();

    // rgba/rgb
    const rgbaMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1]).toString(16).padStart(2, '0');
        const g = parseInt(rgbaMatch[2]).toString(16).padStart(2, '0');
        const b = parseInt(rgbaMatch[3]).toString(16).padStart(2, '0');
        return `${r}${g}${b}`.toUpperCase();
    }

    return null;
}

// =============================================================================
// FUNCOES AUXILIARES
// =============================================================================

function getHtmlFiles(inputDir) {
    return fs.readdirSync(inputDir)
        .filter(f => f.endsWith('.html'))
        .sort()
        .map(f => path.join(inputDir, f));
}

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        input: null,
        output: 'presentation.pptx',
        debug: false
    };

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--input' || args[i] === '-i') {
            options.input = args[++i];
        } else if (args[i] === '--output' || args[i] === '-o') {
            options.output = args[++i];
        } else if (args[i] === '--debug' || args[i] === '-d') {
            options.debug = true;
        } else if (args[i] === '--help' || args[i] === '-h') {
            showHelp();
            process.exit(0);
        }
    }

    return options;
}

function showHelp() {
    console.log(`
HTML to PPTX Converter (Editable Native)
==========================================

Converte arquivos HTML para PPTX EDITAVEL usando pptxgenjs.

Uso:
  node convert.js --input <dir_html> --output <arquivo.pptx>

Opcoes:
  -i, --input       Diretorio com arquivos HTML dos slides
  -o, --output      Arquivo PPTX de saida (default: presentation.pptx)
  -d, --debug       Mostrar informacoes de debug
  -h, --help        Mostra esta ajuda

Exemplos:
  node convert.js -i reports/curso-cdd/aula-01 -o aula_01.pptx
`);
}

// =============================================================================
// CONVERSOR HTML -> PPTX
// =============================================================================

/**
 * Extrai propriedades de texto
 */
function getTextProps(style) {
    const props = {};

    // Font size (px to pt: multiply by 0.75)
    const fontSize = extractPx(style['font-size']);
    if (fontSize) {
        props.fontSize = Math.round(fontSize * 0.75);
    }

    // Color
    const color = extractColor(style['color']);
    if (color) {
        props.color = color;
    }

    // Font weight
    const fontWeight = style['font-weight'];
    if (fontWeight === 'bold' || fontWeight === '700' || fontWeight === '600' || fontWeight === '500') {
        props.bold = parseInt(fontWeight) >= 600 || fontWeight === 'bold';
    }

    // Font style
    if (style['font-style'] === 'italic') {
        props.italic = true;
    }

    // Text align
    if (style['text-align']) {
        props.align = style['text-align'];
    }

    // Letter spacing
    const letterSpacing = extractPx(style['letter-spacing']);
    if (letterSpacing && letterSpacing > 0) {
        props.charSpacing = Math.round(letterSpacing * 100);
    }

    // Font family
    const fontFamily = style['font-family'];
    if (fontFamily) {
        const font = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
        props.fontFace = font;
    }

    return props;
}

/**
 * Processa elemento e retorna array de comandos para o slide
 */
function extractElements($, $el, offsetX = 0, offsetY = 0, debug = false) {
    const elements = [];
    const tagName = $el.prop('tagName')?.toLowerCase();

    if (!tagName || ['html', 'head', 'meta', 'title', 'script', 'style'].includes(tagName)) {
        return elements;
    }

    const style = parseStyle($el.attr('style') || '');

    // Posicao
    const isAbsolute = style['position'] === 'absolute';
    const top = extractPx(style['top']);
    const left = extractPx(style['left']);
    const right = extractPx(style['right']);
    const bottom = extractPx(style['bottom']);
    const width = extractPx(style['width']);
    const height = extractPx(style['height']);
    const padding = extractPx(style['padding']) || 0;

    // Calcula posicao real
    let x = offsetX;
    let y = offsetY;

    if (isAbsolute) {
        if (left !== null) {
            x = left;
        } else if (right !== null) {
            x = SLIDE_WIDTH_PX - right - (width || 100);
        }

        if (top !== null) {
            y = top;
        } else if (bottom !== null) {
            y = SLIDE_HEIGHT_PX - bottom - (height || 30);
        }
    }

    // Background/Shape
    const bgColor = extractColor(style['background']);
    const borderRadius = extractPx(style['border-radius']) || 0;
    const borderLeft = style['border-left'];
    const borderTop = style['border-top'];

    // Shape com background
    if (bgColor && width && height) {
        elements.push({
            type: 'shape',
            x: pxToInchX(x),
            y: pxToInchY(y),
            w: pxToInchX(width),
            h: pxToInchY(height),
            fill: { color: bgColor },
            rectRadius: pxToInchX(borderRadius)
        });

        if (debug) {
            console.log(`    SHAPE at (${x}, ${y}) ${width}x${height} bg:${bgColor}`);
        }
    }

    // Linha decorativa (div com width e height pequena)
    if (bgColor && width && height && (height <= 10 || width <= 10)) {
        // Ja foi adicionado como shape acima
    }

    // Border-left como shape separado
    if (borderLeft) {
        const blMatch = borderLeft.match(/(\d+)px\s+\w+\s+([#\w]+)/);
        if (blMatch && height) {
            elements.push({
                type: 'shape',
                x: pxToInchX(x),
                y: pxToInchY(y),
                w: pxToInchX(parseInt(blMatch[1])),
                h: pxToInchY(height),
                fill: { color: extractColor(blMatch[2]) }
            });
        }
    }

    // Border-top como shape separado
    if (borderTop) {
        const btMatch = borderTop.match(/(\d+)px\s+\w+\s+([#\w]+)/);
        if (btMatch && width) {
            elements.push({
                type: 'shape',
                x: pxToInchX(x),
                y: pxToInchY(y),
                w: pxToInchX(width),
                h: pxToInchY(parseInt(btMatch[1])),
                fill: { color: extractColor(btMatch[2]) }
            });
        }
    }

    // Texto - H1, H2, H3
    if (['h1', 'h2', 'h3'].includes(tagName)) {
        const textProps = getTextProps(style);
        const textParts = [];

        $el.contents().each((_, node) => {
            if (node.type === 'text') {
                const txt = $(node).text();
                if (txt.trim()) {
                    textParts.push({
                        text: txt,
                        options: { ...textProps, bold: true }
                    });
                }
            } else if (node.name === 'span') {
                const $span = $(node);
                const spanStyle = parseStyle($span.attr('style') || '');
                const spanProps = getTextProps(spanStyle);
                textParts.push({
                    text: $span.text(),
                    options: { ...textProps, ...spanProps, bold: true }
                });
            }
        });

        if (textParts.length > 0) {
            const textH = height || Math.max(60, (textProps.fontSize || 24) * 2);
            const textW = width || SLIDE_WIDTH_PX - x - 40;

            elements.push({
                type: 'text',
                text: textParts,
                x: pxToInchX(x),
                y: pxToInchY(y),
                w: pxToInchX(textW),
                h: pxToInchY(textH),
                fontFace: textProps.fontFace || 'Segoe UI',
                align: style['text-align'] || 'left',
                valign: 'middle'
            });

            if (debug) {
                console.log(`    H1/H2/H3 at (${x}, ${y}): "${textParts.map(p => p.text).join('').substring(0, 30)}..."`);
            }
        }
        return elements;
    }

    // Texto - P
    if (tagName === 'p') {
        const text = $el.text().trim();
        if (text) {
            const textProps = getTextProps(style);
            const textH = height || Math.max(25, (textProps.fontSize || 12) * 2);
            const textW = width || SLIDE_WIDTH_PX - x - 40;

            elements.push({
                type: 'text',
                text: text,
                x: pxToInchX(x),
                y: pxToInchY(y),
                w: pxToInchX(textW),
                h: pxToInchY(textH),
                ...textProps,
                fontFace: textProps.fontFace || 'Segoe UI',
                valign: 'middle'
            });

            if (debug) {
                console.log(`    P at (${x}, ${y}): "${text.substring(0, 30)}..."`);
            }
        }
        return elements;
    }

    // Texto - SPAN (quando isolado)
    if (tagName === 'span' && !$el.find('*').length) {
        const text = $el.text().trim();
        if (text) {
            const textProps = getTextProps(style);
            const textH = height || Math.max(20, (textProps.fontSize || 12) * 2);
            const textW = width || SLIDE_WIDTH_PX - x - 40;

            elements.push({
                type: 'text',
                text: text,
                x: pxToInchX(x),
                y: pxToInchY(y),
                w: pxToInchX(textW),
                h: pxToInchY(textH),
                ...textProps,
                fontFace: textProps.fontFace || 'Segoe UI',
                valign: 'middle'
            });

            if (debug) {
                console.log(`    SPAN at (${x}, ${y}): "${text.substring(0, 30)}..."`);
            }
        }
        return elements;
    }

    // DIV - processa filhos
    if (tagName === 'div' || tagName === 'body') {
        const display = style['display'];
        const flexDirection = style['flex-direction'] || 'row';
        const gap = extractPx(style['gap']) || 0;
        const alignItems = style['align-items'];
        const justifyContent = style['justify-content'];

        let childX = x + padding;
        let childY = y + padding;
        const containerW = width || SLIDE_WIDTH_PX;
        const containerH = height || SLIDE_HEIGHT_PX;

        // Para flex center, calcula offset
        if (display === 'flex' && alignItems === 'center' && justifyContent === 'center') {
            // Centro do container
            childX = x;
            childY = y;
        }

        $el.children().each((idx, child) => {
            const $child = $(child);
            const childStyle = parseStyle($child.attr('style') || '');
            const isChildAbsolute = childStyle['position'] === 'absolute';

            if (isChildAbsolute) {
                // Elementos absolutos - coordenadas do slide
                const childElements = extractElements($, $child, 0, 0, debug);
                elements.push(...childElements);
            } else {
                // Elementos relativos - usa offset atual
                const childElements = extractElements($, $child, childX, childY, debug);
                elements.push(...childElements);

                // Atualiza offset para proximo filho
                if (display === 'flex') {
                    const childW = extractPx(childStyle['width']) || 100;
                    const childH = extractPx(childStyle['height']) || 50;

                    if (flexDirection === 'column') {
                        childY += childH + gap;
                    } else {
                        childX += childW + gap;
                    }
                }
            }
        });
    }

    // UL/LI - listas
    if (tagName === 'ul' || tagName === 'ol') {
        const listItems = [];
        $el.find('li').each((idx, li) => {
            const $li = $(li);
            const liStyle = parseStyle($li.attr('style') || '');
            const liProps = getTextProps(liStyle);

            listItems.push({
                text: $li.text().trim(),
                options: {
                    ...liProps,
                    bullet: { type: tagName === 'ol' ? 'number' : 'bullet' }
                }
            });
        });

        if (listItems.length > 0) {
            const textProps = getTextProps(style);
            elements.push({
                type: 'text',
                text: listItems,
                x: pxToInchX(x),
                y: pxToInchY(y),
                w: pxToInchX(width || SLIDE_WIDTH_PX - x - 40),
                h: pxToInchY(height || listItems.length * 30),
                ...textProps,
                fontFace: textProps.fontFace || 'Segoe UI',
                valign: 'top'
            });
        }
    }

    return elements;
}

/**
 * Converte HTML completo para slide
 */
function convertHtmlToSlide(pres, htmlContent, debug = false) {
    const $ = cheerio.load(htmlContent);
    const $body = $('body');
    const bodyStyle = parseStyle($body.attr('style') || '');

    const slide = pres.addSlide();

    // Background
    const bgColor = extractColor(bodyStyle['background']) || '1C1C1C';
    slide.background = { color: bgColor };

    if (debug) {
        console.log(`\n  Slide background: ${bgColor}`);
    }

    // Extrai todos os elementos
    const elements = extractElements($, $body, 0, 0, debug);

    // Adiciona elementos ao slide
    for (const el of elements) {
        if (el.type === 'shape') {
            slide.addShape(pres.shapes.RECTANGLE, {
                x: el.x,
                y: el.y,
                w: el.w,
                h: el.h,
                fill: el.fill,
                rectRadius: el.rectRadius || 0
            });
        } else if (el.type === 'text') {
            slide.addText(el.text, {
                x: el.x,
                y: el.y,
                w: el.w,
                h: el.h,
                fontSize: el.fontSize,
                color: el.color,
                bold: el.bold,
                italic: el.italic,
                fontFace: el.fontFace || 'Segoe UI',
                align: el.align || 'left',
                valign: el.valign || 'middle',
                charSpacing: el.charSpacing
            });
        }
    }

    return slide;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const options = parseArgs();

    if (!options.input) {
        console.error('Erro: --input e obrigatorio');
        showHelp();
        process.exit(1);
    }

    if (!fs.existsSync(options.input)) {
        console.error(`Erro: Diretorio nao encontrado: ${options.input}`);
        process.exit(1);
    }

    const htmlFiles = getHtmlFiles(options.input);

    if (htmlFiles.length === 0) {
        console.error(`Erro: Nenhum arquivo HTML encontrado em: ${options.input}`);
        process.exit(1);
    }

    console.log(`\nHTML to PPTX Converter (Editable)`);
    console.log(`==========================================`);
    console.log(`Input: ${options.input}`);
    console.log(`Output: ${options.output}`);
    console.log(`Arquivos HTML: ${htmlFiles.length}`);
    console.log('');

    const pres = new pptxgen();
    pres.layout = 'LAYOUT_16x9';
    pres.author = 'AI Frontiers';
    pres.company = 'AI Frontiers';
    pres.subject = 'Context-Driven Development';

    for (let i = 0; i < htmlFiles.length; i++) {
        const htmlFile = htmlFiles[i];
        console.log(`  [${i + 1}/${htmlFiles.length}] Processando: ${path.basename(htmlFile)}`);

        const htmlContent = fs.readFileSync(htmlFile, 'utf-8');
        convertHtmlToSlide(pres, htmlContent, options.debug);
    }

    console.log('\nGerando PPTX editavel...');
    await pres.writeFile({ fileName: options.output });

    console.log(`\nPPTX gerado com sucesso: ${options.output}`);
    console.log('Conversao concluida!');
}

main().catch(error => {
    console.error(`\nErro na conversao: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
});
