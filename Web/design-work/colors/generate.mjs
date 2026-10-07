import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const directory = path.dirname(fileURLToPath(import.meta.url));
const source = JSON.parse(await readFile(path.join(directory, 'geist-source.json'), 'utf8'));
const darkOverrides = JSON.parse(await readFile(path.join(directory, 'prana-dark-overrides.json'), 'utf8'));
const previewDirectory = path.resolve(directory, '../../prototype/public/design/colors');
const catalogueStylesDirectory = path.resolve(directory, '../../prototype/src/styles');
const brand = '#EA5C00';

function rgba(value) {
  if (value.startsWith('#')) {
    const hex = value.slice(1);
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
      .concat(hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1);
  }
  const [hue, saturation, lightness, alpha = 1] = value.match(/[\d.]+/g).map(Number);
  const s = saturation / 100;
  const l = lightness / 100;
  const a = s * Math.min(l, 1 - l);
  const channel = n => {
    const k = (n + hue / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return [channel(0), channel(8), channel(4), alpha];
}

const linear = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const encoded = c => c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
const hex = channels => '#' + channels.slice(0, 3).map(c => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const luminance = channels => channels.slice(0, 3).map(linear).reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
function contrast(a, b) {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

// Standard sRGB ↔ Oklab matrices; custom scale mapping below is a Prana decision.
function toOklch(rgb) {
  const [r, g, b] = rgb.slice(0, 3).map(linear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bLab = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(a, bLab), Math.atan2(bLab, a)];
}
function fromOklch([L, C, h]) {
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s].map(encoded);
}
function gamutMap(L, C, h) {
  let low = 0;
  let high = C;
  const inGamut = rgb => rgb.every(c => c >= -1e-7 && c <= 1 + 1e-7);
  if (inGamut(fromOklch([L, C, h]))) return fromOklch([L, C, h]);
  for (let i = 0; i < 30; i++) {
    const mid = (low + high) / 2;
    if (inGamut(fromOklch([L, mid, h]))) low = mid;
    else high = mid;
  }
  return fromOklch([L, low, h]);
}

const anchor = toOklch(rgba(brand));
const roles = {100:'Фон компонента',200:'Фон при наведении',300:'Активный фон',400:'Граница',500:'Граница при наведении',600:'Активная граница',700:'Акцентная заливка',800:'Акцент при наведении',900:'Вторичный текст / иконки',1000:'Основной текст / иконки'};
const palette = {source:source.source,capturedAt:source.capturedAt,colorSpace:'sRGB',darkOverrides,brand:{hex:brand,step:700,oklch:anchor.map((v,i)=>Number((i === 2 ? v * 180 / Math.PI : v).toFixed(6)))},status:'Prana page and control surfaces use exact user-selected HSL values; card fill is retained from Figma. Unlisted Geist neutrals, light text levels, alpha values and the light theme are preserved. Amber remains an unassigned custom draft.',roles,themes:{}};
for (const [theme, entries] of Object.entries(source.themes)) {
  assert.equal(entries.length, 32, `${theme}: expected 32 source colors`);
  assert.equal(new Set(entries.map(e => e.token)).size, 32);
  const scales = {background:{},gray:{},grayAlpha:{},amber:{},geistAmber:{}};
  const amberReference = toOklch(rgba(entries.find(e => e.token === '--ds-amber-700').raw));
  for (const entry of entries) {
    const [, family, step] = entry.token.match(/^--ds-(background|gray-alpha|gray|amber)-(\d+)$/);
    const channels = rgba(entry.raw);
    const group = family === 'gray-alpha' ? 'grayAlpha' : family === 'amber' ? 'geistAmber' : family;
    scales[group][step] = {value:entry.raw,hex:family === 'gray-alpha' ? entry.raw.toUpperCase() : hex(channels),sourceToken:entry.token,origin:'Geist',role:family === 'background' ? (step === '100' ? 'Основной фон' : 'Второй фон') : roles[step]};
    if (family !== 'amber') continue;
    const [sourceL, sourceC] = toOklch(channels);
    // Piecewise remapping preserves the source's lightness order around stop 700.
    const L = sourceL <= amberReference[0]
      ? sourceL / amberReference[0] * anchor[0]
      : anchor[0] + (sourceL - amberReference[0]) / (1 - amberReference[0]) * (1 - anchor[0]);
    const C = sourceC / amberReference[1] * anchor[1];
    const value = step === '700' ? brand : hex(gamutMap(L, C, anchor[2]));
    scales.amber[step] = {value,hex:value,sourceToken:entry.token,origin:'Prana custom',role:roles[step],oklch:toOklch(rgba(value)).map((v,i)=>Number((i === 2 ? v * 180 / Math.PI : v).toFixed(6)))};
  }
  // Keep text roles useful after changing the base: minimally adjust lightness
  // toward the theme's foreground until the emitted 8-bit color reaches 4.5:1.
  for (const step of ['900','1000']) {
    const token = scales.amber[step];
    const original = token.value;
    const [initialL, C, h] = toOklch(rgba(original));
    const backgrounds = [...Object.values(scales.background),...['100','200','300'].map(s=>scales.amber[s])];
    for (let increment = 0; increment <= 1000; increment++) {
      const L = Math.max(0,Math.min(1,initialL + (theme === 'dark' ? 1 : -1) * increment / 1000));
      const candidate = increment === 0 ? original : hex(gamutMap(L,C,h));
      if (backgrounds.every(bg=>contrast(rgba(candidate),rgba(bg.value)) >= 4.5)) {
        token.value = token.hex = candidate;
        token.oklch = toOklch(rgba(candidate)).map((v,i)=>Number((i === 2 ? v * 180 / Math.PI : v).toFixed(6)));
        if (candidate !== original) token.contrastAdjustment = {from:original,to:candidate,reason:'Minimum 4.5:1 against both page backgrounds and Amber 100–300.'};
        break;
      }
      assert.notEqual(increment,1000,'No accessible text color found');
    }
  }
  assert.equal(scales.amber['700'].value, brand);
  for (const group of ['background','gray','grayAlpha','geistAmber']) {
    for (const token of Object.values(scales[group])) assert.equal(token.value, entries.find(e=>e.token===token.sourceToken).raw);
  }
  // Apply only the user-requested dark surface edits after generating the
  // existing Amber scale, so changes to backgrounds cannot alter its colors.
  if (theme === 'dark') {
    for (const override of darkOverrides.overrides) {
      assert(override.family === 'background' || (override.family === 'gray' && Number(override.step) < 600), 'Only dark surface primitives may be overridden');
      const token = scales[override.family][override.step];
      assert(token, 'Override must target an existing primitive');
      Object.assign(token, { originalValue: token.value, originalHex: token.hex, value: override.value, hex: hex(rgba(override.value)), origin: override.origin ?? 'Prana / Figma', role: override.role, designSource: override.source ?? darkOverrides.source, designNodeId: override.nodeId });
    }
    for (const step of ['600','700','800','900','1000']) assert.equal(scales.gray[step].value, entries.find(e=>e.token===`--ds-gray-${step}`).raw, 'Light gray levels must remain unchanged');
    const { family, step, value } = darkOverrides.pageBackground;
    assert.equal(scales[family][step].value, value);
  }
  palette.themes[theme] = scales;
}

// Check conversion independently at the endpoints and supplied anchor.
for (const color of ['#000000','#FFFFFF','#EA5C00','#FFB224']) assert.equal(hex(fromOklch(toOklch(rgba(color)))), color);
const report = {method:'WCAG 2 relative luminance, actual emitted sRGB values. Normal text AA threshold: 4.5:1. This is pair-level checking, not a site accessibility audit.',brandText:{white:contrast(rgba('#FFFFFF'),rgba(brand)),black:contrast(rgba('#000000'),rgba(brand)),gray1000Dark:contrast(rgba(palette.themes.dark.gray['1000'].value),rgba(brand))},pairs:[]};
for (const [theme, scales] of Object.entries(palette.themes)) {
  for (const family of ['gray','amber']) for (const step of ['900','1000']) {
    for (const bg of ['100','200']) {
      const ratio = contrast(rgba(scales[family][step].value),rgba(scales.background[bg].value));
      report.pairs.push({theme,foreground:`${family}-${step}`,background:`background-${bg}`,ratio,normalTextAA:ratio>=4.5});
    }
    if (family === 'amber') for (const bg of ['100','200','300']) {
      const ratio = contrast(rgba(scales.amber[step].value),rgba(scales.amber[bg].value));
      report.pairs.push({theme,foreground:`amber-${step}`,background:`amber-${bg}`,ratio,normalTextAA:ratio>=4.5});
    }
  }
}

assert(report.pairs.every(pair=>pair.normalTextAA),'A checked text/background pair fails 4.5:1');

const dark = palette.themes.dark;
report.cataloguePairs = [];
for (const foreground of ['1000','900','600']) for (const [background, token] of [['card',dark.background['100']],['control',dark.gray['200']],['pressed',dark.gray['300']]]) {
  const ratio = contrast(rgba(dark.gray[foreground].hex),rgba(token.hex));
  report.cataloguePairs.push({foreground:`gray-${foreground}`,background,ratio,normalTextAA:ratio>=4.5});
}
report.catalogueNote = 'Light text levels are intentionally preserved as requested. Gray 600 on the user-selected control fill is below 4.5:1; reported, not silently adjusted. Pressed From uses Gray 900. Catalogue ratios use rounded 8-bit colors; canonical CSS values retain exact HSL.';

let css = '/* Prana primitive palette — generated; edit design-work/colors/generate.mjs.\n * Source: https://vercel.com/geist/colors (see geist-source.json).\n * Dark surface overrides: prana-dark-overrides.json; user-selected HSL and Figma card fill.\n * Other neutrals are preserved. Custom Amber 700 = #EA5C00.\n * Catalogue component roles are maintained separately in src/styles/theme.css.\n */\n';
for (const [theme, scales] of Object.entries(palette.themes)) {
  css += `\n[data-prana-theme="${theme}"] {\n`;
  for (const [family, tokens] of Object.entries(scales)) {
    const prefix = family === 'geistAmber' ? 'geist-amber' : 'prana-' + (family === 'grayAlpha' ? 'gray-alpha' : family);
    for (const [step, token] of Object.entries(tokens)) css += `  --${prefix}-${step}: ${token.value};\n`;
  }
  css += '}\n';
}
await mkdir(previewDirectory,{recursive:true});
await mkdir(catalogueStylesDirectory,{recursive:true});
await writeFile(path.join(catalogueStylesDirectory,'palette.css'),css);
for (const [name, contents] of [['palette.json',JSON.stringify(palette,null,2)+'\n'],['tokens.css',css],['contrast-report.json',JSON.stringify(report,null,2)+'\n']]) {
  await writeFile(path.join(directory,name),contents);
  await writeFile(path.join(previewDirectory,name),contents);
}
for (const file of ['index.html','preview.js','preview.css','geist-source.json','prana-dark-overrides.json']) await copyFile(path.join(directory,file),path.join(previewDirectory,file));
console.log(JSON.stringify({brand:palette.brand,amber:Object.fromEntries(Object.entries(palette.themes).map(([theme,s])=>[theme,Object.fromEntries(Object.entries(s.amber).map(([k,v])=>[k,v.hex]))])),brandText:report.brandText,failedTextPairs:report.pairs.filter(p=>!p.normalTextAA),cataloguePairsBelowAA:report.cataloguePairs.filter(p=>!p.normalTextAA)},null,2));
