const frames=root.children.filter(n=>n.name.startsWith('Screen / ')||n.name.startsWith('Context / '));
const by=Object.fromEntries(frames.map(n=>[n.name.split(' / ')[1],n]));
const created=[],changed=[],links=[],skipped=[];
async function action(n,a){await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[a]}]);changed.push(n.id);links.push({id:n.id,type:a.type,target:a.destinationId||a.url});}
async function nav(n,target){if(n===target||n.id===target.id)return;await action(n,{type:'NODE',destinationId:target.id,navigation:'NAVIGATE',transition:{type:'DISSOLVE',duration:.2,easing:{type:'EASE_OUT'}}});}
const overlays={};
for(const [code,key]of [['D01','CLEAR'],['C01','C01'],['C04','C04'],['E01','E01'],['E01O','E01O']]){const full=fr(figma.currentPage,'Cart70 / Interactive overlay / '+key,430,932);at(full,7100+Object.keys(overlays).length*486,9600);const dim=rect(full,'Close / Outside sheet',430,932,'canvas');dim.opacity=.64;await action(dim,{type:'CLOSE'});const panel=by[code].findOne(n=>n.name.startsWith('Overlay /')).clone();full.appendChild(panel);at(panel,0,932-panel.height);created.push(full.id,...full.findAll(()=>true).map(n=>n.id));for(const n of panel.findAll(n=>n.name.startsWith('Back /')||n.name.startsWith('Go / BACK /')))await action(n,{type:'CLOSE'});const home=rect(full,'Home indicator',134,5,'text',3);at(home,148,917);for(const n of panel.findAll(n=>n.name.startsWith('Go / ')&&!n.name.startsWith('Go / BACK /'))){const to=n.name.split(' / ')[1];if(by[to])await nav(n,by[to]);}overlays[key]=full;}
const baseFlow=new Set(['A01','A02','B04','E01','E01O','E03','E04','E05','E06','E07','D01','D02']);
for(const [code,s]of Object.entries(by)){
 if(code==='E02'){for(const n of s.findAll(n=>n.type==='INSTANCE'&&n.name==='Go / E01 / View added Aloe'))n.name='State / Added 1';}
 if(code==='E07'){for(const n of s.findAll(n=>n.type==='INSTANCE'&&n.findOne(t=>t.type==='TEXT'&&t.characters==='Try again · $15.00')))n.name='Go / E02 / Retry adding Aloe';}
 for(const n of s.findAll(n=>n.name.startsWith('Go /')||n.name.startsWith('Back /'))){
  const parts=n.name.split(' / '),to=parts[1];
  if(n.name.startsWith('Back /')||to==='BACK'){await action(n,{type:'BACK'});continue;}
  if(to==='MENU'){await nav(n,by.A00);continue;}
  if(to==='CHECKOUT'){await action(n,{type:'URL',url:'https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1028-34599'});continue;}
  if(overlays[to]){
   if(['E01','E01O'].includes(to)&&!baseFlow.has(code)){skipped.push({code,name:n.name,reason:'Representative cart combinations only'});continue;}
   await action(n,{type:'NODE',destinationId:overlays[to].id,navigation:'OVERLAY',transition:{type:'DISSOLVE',duration:.16,easing:{type:'EASE_OUT'}}});continue;
  }
  if(by[to]&&by[to]!==s){await nav(n,by[to]);}else skipped.push({code,name:n.name,reason:by[to]===s?'Same-state retry is static':'No destination'});
 }
 for(const sh of s.findAll(n=>n.name.startsWith('Overlay /'))){const h=s.findOne(n=>n.name==='Home indicator');if(h)s.appendChild(h);}
}
// Add-to-cart inspection is a representative base-cart path; do not simulate wrong quantities.
for(const code of ['B06','B08','F05']){for(const n of by[code].findAll(n=>n.name.startsWith('Go / E01'))){await n.setReactionsAsync([]);changed.push(n.id);}}
// Correct the retry destination in the empty recommendation state: this is not a populated cart.
for(const n of by.D05.findAll(n=>n.name==='Go / A02 / Try again')){await n.setReactionsAsync([]);n.name='Retry / Empty recommendations';changed.push(n.id);}
const all=root.findAll(()=>true),types={};for(const n of all)types[n.type]=(types[n.type]||0)+1;
const images=all.filter(n=>Array.isArray(n.fills)&&n.fills.some(f=>f.type==='IMAGE')).map(n=>({id:n.id,name:n.name,type:n.type,w:n.width,h:n.height}));
const audit=Object.entries(by).map(([code,s])=>({code,id:s.id,w:s.width,h:s.height,x:s.x,y:s.y,annotation:!!root.children.find(n=>n.name==='Пояснение / '+code),footer:s.findOne(n=>n.name==='Fixed cart summary')?.findAll(n=>n.type==='TEXT').map(n=>n.characters)}));
figma.viewport.scrollAndZoomIntoView([by.A01]);
return {board:root.id,overlays:Object.fromEntries(Object.entries(overlays).map(([k,n])=>[k,n.id])),states:audit,descendantCount:all.length,types,imageCount:images.length,links:links.length,skippedCount:skipped.length,createdNodeIds:[...made,...created],mutatedNodeIds:changed};

