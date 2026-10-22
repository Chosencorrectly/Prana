await figma.setCurrentPageAsync(await figma.getNodeByIdAsync('1028:32536'));
figma.skipInvisibleInstanceChildren=false;
await Promise.all(['Regular','Medium','Semibold'].map(style=>figma.loadFontAsync({family:'SF Pro',style})));
const root=await figma.getNodeByIdAsync('1399:1565'),changed=[];
const screens=root.children.filter(n=>n.name.startsWith('Screen / '));
const by=Object.fromEntries(screens.map(n=>[n.name.split(' / ')[1],n]));
const context=root.children.find(n=>n.name.startsWith('Context / A00'));
for(const s of screens){const h=s.findOne(n=>n.name==='Home indicator');if(h){s.appendChild(h);changed.push(h.id);}}
for(const s of [by.D01,by.D02,await figma.getNodeByIdAsync('1403:3455')]){const panel=s.findOne(n=>n.name==='Overlay / Clear your cart?');panel.resize(430,320);panel.y=612;changed.push(panel.id);}
for(const code of ['B03','D03','D04','D05']){const stage=by[code].findOne(n=>n.name==='Empty illustration / quiet backing'),p=stage.findOne(n=>n.name==='Photo / bag');p.resize(260,260);p.x=29;p.y=-11;stage.clipsContent=true;changed.push(stage.id,p.id);}
by.D05.findOne(n=>n.name==='Scroll content').y=-300;changed.push(by.D05.id);
const primary=await figma.getNodeByIdAsync('1399:1567');
for(const [code,label,to]of [['F01','Remove unavailable dish',by.A03],['F02','Browse menu',context]]){const f=by[code].findOne(n=>n.name==='Fixed cart summary');const b=f.children.find(n=>n.type==='INSTANCE');b.swapComponent(primary);const t=b.findOne(n=>n.type==='TEXT'&&n.name==='Label');t.characters=label;b.name='Go / '+(code==='F01'?'A03':'MENU')+' / '+label;await b.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:to.id,navigation:'NAVIGATE',transition:{type:'DISSOLVE',duration:.2,easing:{type:'EASE_OUT'}}}]}]);changed.push(b.id,t.id);}
const flows={B02:'Переходы: Undo → B04; закрыть → A00. Паттерн удаления последнего блюда — B03, с Undo для того же блюда.',E02:'Переходы: Added · 1 подтверждает добавление; дальнейшее изменение — через строку Aloe в корзине. Close → A00.',D05:'Переходы: прокрученный empty state; Browse menu → A00. Повтор загрузки описан, без подмены корзины заполненным состоянием.'};
for(const[code,value]of Object.entries(flows)){const n=root.children.find(n=>n.name==='Пояснение / '+code).findOne(n=>n.type==='TEXT'&&n.characters.startsWith('Переходы:'));n.characters=value;changed.push(n.id);}
const totalNote=by.F07.findOne(n=>n.type==='TEXT'&&n.characters.startsWith('Your items total is now'));
if(totalNote){totalNote.characters='Your items total is now $29.90.';changed.push(totalNote.id);}
return {mutatedNodeIds:changed,screenCount:screens.length,clearSheetHeight:320,emptyBag:[260,260],fixes:['home indicator foreground','compact clear sheet','empty bag scale','unavailable corrective CTA','truthful prototype annotations','empty scrolled framing','price text safeguard']};
