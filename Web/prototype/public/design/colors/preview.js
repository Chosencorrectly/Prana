const [palette, report] = await Promise.all(['./palette.json','./contrast-report.json'].map(url=>fetch(url).then(response=>{if(!response.ok) throw new Error(`Could not load ${url}`);return response.json();})));
const groups = [
  ['background','Backgrounds','Geist + поверхности Prana · Figma / выбор пользователя'],
  ['gray','Gray','Geist + поверхности Prana · выбор пользователя'],
  ['grayAlpha','Gray Alpha','Оригинал Geist · прозрачность сохранена'],
  ['amber','Prana Amber','Адаптированная шкала · 700 = #EA5C00'],
  ['geistAmber','Geist Amber','Оригинал для сравнения'],
];
let copyTimeout;
function render(theme) {
  document.documentElement.dataset.pranaTheme = theme;
  for (const mode of ['dark','light']) document.getElementById(`${mode}-theme`).setAttribute('aria-pressed',String(mode===theme));
  document.getElementById('scales').replaceChildren(...groups.map(([family,title,description])=>{
    const section=document.createElement('section');section.className='scale';
    const heading=document.createElement('div');heading.className='scale-heading';
    const h2=document.createElement('h2');h2.textContent=title;
    const p=document.createElement('p');p.textContent=theme==='light'&&['background','gray'].includes(family)?'Оригинал Geist · без изменений':description;heading.append(h2,p);
    const row=document.createElement('div');row.className='swatches';
    for(const [step,token] of Object.entries(palette.themes[theme][family])) {
      const button=document.createElement('button');button.className=`swatch${family==='grayAlpha'?' alpha':''}`;
      button.type='button';button.setAttribute('aria-label',`${title} ${step}: ${token.hex}`);
      button.title=`${token.role}\n${token.value}\n${token.origin}${token.originalValue?` · исходный Geist: ${token.originalValue}`:''}`;
      const sample=document.createElement('span');sample.className=`sample${family==='amber'&&step==='700'?' brand':''}`;
      const fill=document.createElement('span');fill.className='sample-fill';fill.style.setProperty('--sample',token.value);sample.append(fill);
      const label=document.createElement('span');label.className='swatch-label';
      const number=document.createElement('span');number.textContent=step;
      const value=document.createElement('span');value.className='value';value.textContent=token.hex;label.append(number,value);
      button.append(sample,label);
      if(token.originalValue){const origin=document.createElement('span');origin.className='origin-note';origin.textContent=token.origin;button.append(origin);}
      button.addEventListener('click',async()=>{
        const status=document.getElementById('copy-status');clearTimeout(copyTimeout);
        try { await navigator.clipboard.writeText(token.value);status.textContent=`Скопировано: ${token.value}`; }
        catch { status.textContent=`Значение: ${token.value}`; }
        copyTimeout=setTimeout(()=>status.textContent='',2500);
      });
      row.append(button);
    }
    section.append(heading,row);return section;
  }));
  document.getElementById('contrast-examples').replaceChildren(...[['#FFFFFF','Белый текст',report.brandText.white],['#000000','Чёрный текст',report.brandText.black]].map(([color,title,ratio])=>{
    const div=document.createElement('div');div.className='contrast-example';div.style.color=color;
    const strong=document.createElement('strong');strong.textContent=title;
    const span=document.createElement('span');span.textContent=`${ratio.toFixed(2)}:1 · ${ratio>=4.5?'AA для обычного текста':'ниже AA для обычного текста'}`;
    div.append(strong,span);return div;
  }));
}
document.getElementById('dark-theme').addEventListener('click',()=>render('dark'));
document.getElementById('light-theme').addEventListener('click',()=>render('light'));
render('dark');
