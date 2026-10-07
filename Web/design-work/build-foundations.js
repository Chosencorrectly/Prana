const page=await figma.getNodeByIdAsync('1:49359');
await figma.setCurrentPageAsync(page);
const created=[],changed=[],variables={},styles={},controls={};
const track=n=>{created.push(n.id);return n;};
for(const style of ['Regular','Medium','Semibold','Bold'])await figma.loadFontAsync({family:'SF Pro',style});
if((await figma.variables.getLocalVariableCollectionsAsync()).some(c=>c.name==='Prana / Product UI'))throw new Error('Foundations already exist; resume from ledger.');
const collection=figma.variables.createVariableCollection('Prana / Product UI');
const mode=collection.modes[0].modeId;collection.renameMode(mode,'Dark');
const rgb=h=>({r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255});
const colors={background:'0A0A0A',surface:'101010',control:'262626',border:'3B3B3B',primary:'FFFFFF',secondary:'A3A3A3',muted:'747474',inverse:'101010'};
for(const [name,hex] of Object.entries(colors)){const v=figma.variables.createVariable('color/'+name,collection,'COLOR');v.scopes=name==='border'?['STROKE_COLOR']:['FRAME_FILL','SHAPE_FILL','TEXT_FILL','STROKE_COLOR'];v.setValueForMode(mode,{...rgb(hex),a:1});v.setVariableCodeSyntax('WEB','var(--prana-'+name+')');variables[name]=v;}
for(const value of [4,8,12,16,24,32,48,64]){const v=figma.variables.createVariable('space/'+value,collection,'FLOAT');v.scopes=['GAP'];v.setValueForMode(mode,value);v.setVariableCodeSyntax('WEB','var(--prana-space-'+value+')');variables['s'+value]=v;}
for(const value of [10,20,100]){const v=figma.variables.createVariable('radius/'+value,collection,'FLOAT');v.scopes=['CORNER_RADIUS'];v.setValueForMode(mode,value);v.setVariableCodeSyntax('WEB','var(--prana-radius-'+value+')');variables['r'+value]=v;}
const styleDefs={title:[36,42,'Bold'],section:[24,30,'Bold'],body:[16,24,'Regular'],card:[16,19,'Bold'],label:[14,18,'Medium'],caption:[12,16,'Medium'],metric:[24,29,'Semibold']};
for(const [name,[size,line,weight]] of Object.entries(styleDefs)){const s=figma.createTextStyle();s.name='Prana / '+name;s.fontName={family:'SF Pro',style:weight};s.fontSize=size;s.lineHeight={unit:'PIXELS',value:line};styles[name]=s;}
function paint(key){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(colors[key])},'color',variables[key]);}
function radius(n,v){n.cornerRadius=v;for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])n.setBoundVariable(k,variables['r'+v]);}
function auto(parent,name,dir='HORIZONTAL',gap=8){const f=track(figma.createAutoLayout(dir));parent.appendChild(f);f.name=name;f.fills=[];f.itemSpacing=gap;if(variables['s'+gap])f.setBoundVariable('itemSpacing',variables['s'+gap]);return f;}
function text(parent,content,style='label',color='primary'){const n=track(figma.createText());parent.appendChild(n);n.fontName={family:'SF Pro',style:styleDefs[style][2]};n.textStyleId=styles[style].id;n.characters=content;n.fills=[paint(color)];return n;}
const board=track(figma.createAutoLayout('VERTICAL'));board.name='Prana / Purchase states & components';board.x=12484;board.y=2067;board.resize(960,100);board.counterAxisSizingMode='FIXED';board.primaryAxisSizingMode='AUTO';board.fills=[paint('background')];board.itemSpacing=32;board.paddingTop=32;board.paddingBottom=32;board.paddingLeft=32;board.paddingRight=32;
text(board,'Dish preview & purchase','section');
text(board,'0 items / 1 item / 2+ items · Desktop web','label','secondary');
const previewSlot=auto(board,'Preview states','HORIZONTAL',24);
const controlsSection=auto(board,'Purchase controls','VERTICAL',16);text(controlsSection,'Shared purchase control','section');
const cart=await figma.getNodeByIdAsync('1:13');
const trash=await figma.getNodeByIdAsync('1:29');
function icon(parent,kind,color='primary'){const master=kind==='cart'?cart:trash;const n=track(master.createInstance());parent.appendChild(n);n.resize(16,16);n.name=kind==='cart'?'Cart icon':'Remove item';for(const c of n.findAll(x=>'fills'in x||'strokes'in x)){if('fills'in c&&Array.isArray(c.fills)&&c.fills.length)c.fills=c.fills.map(p=>p.type==='SOLID'?paint(color):p);if('strokes'in c&&Array.isArray(c.strokes)&&c.strokes.length)c.strokes=c.strokes.map(p=>p.type==='SOLID'?paint(color):p);}return n;}
const all=[];
for(const context of ['Preview','Detail']){
  for(const state of ['Empty','One','Many']){
    const c=track(figma.createComponent());controlsSection.appendChild(c);c.name='Context='+context+', State='+state;c.layoutMode='HORIZONTAL';c.primaryAxisSizingMode='FIXED';c.counterAxisSizingMode='FIXED';c.primaryAxisAlignItems='CENTER';c.counterAxisAlignItems='CENTER';c.itemSpacing=8;c.resize(context==='Detail'?224:(state==='Empty'?108:184),context==='Detail'?44:40);radius(c,10);c.fills=state==='Empty'?[paint(context==='Detail'?'primary':'control')]:[];
    if(state==='Empty'){icon(c,'cart',context==='Detail'?'inverse':'primary');if(context==='Detail')text(c,'Add to cart','label','inverse');text(c,'$4','label',context==='Detail'?'inverse':'primary');}
    else{c.primaryAxisAlignItems='SPACE_BETWEEN';const left=auto(c,state==='One'?'Remove item':'Decrease quantity');left.resize(40,40);left.primaryAxisSizingMode='FIXED';left.counterAxisSizingMode='FIXED';left.primaryAxisAlignItems='CENTER';left.counterAxisAlignItems='CENTER';left.fills=[paint('control')];radius(left,100);if(state==='One')icon(left,'trash');else text(left,'−','body');const middle=auto(c,'Quantity and total','VERTICAL',0);middle.counterAxisAlignItems='CENTER';text(middle,state==='One'?'1 item':'2 items','label');text(middle,state==='One'?'$4':'$8','caption','secondary');const plus=auto(c,'Increase quantity');plus.resize(40,40);plus.primaryAxisSizingMode='FIXED';plus.counterAxisSizingMode='FIXED';plus.primaryAxisAlignItems='CENTER';plus.counterAxisAlignItems='CENTER';plus.fills=[paint('primary')];radius(plus,100);text(plus,'+','body','inverse');}
    controls[context+'/'+state]=c;all.push(c);
  }
}
// Adapted from the bundled createComponentWithVariants helper: combine, then lay out each state explicitly.
const set=track(figma.combineAsVariants(all,controlsSection));set.name='Prana / Purchase control';set.description='One purchase pattern for preview and PDP. Empty: icon and unit price; PDP includes Add to cart. At 1 item: trash removes the item. At 2+: minus decreases by one. Plus increases by one. Total = unit price × quantity. Purchase actions never trigger card navigation. Labels for assistive tech: Add [dish] to cart / Remove [dish] / Decrease quantity / Increase quantity. Demo price: $4.';set.fills=[];
for(let i=0;i<all.length;i++){all[i].x=(i%3)*280;all[i].y=Math.floor(i/3)*76;}
set.resizeWithoutConstraints(840,120);
const info=auto(board,'Implementation notes','VERTICAL',12);
text(info,'Interaction rules','section');
for(const line of ['Photo and title → dish details. Purchase controls act independently.','1 item → remove. 2+ items → decrease. Total = quantity × unit price.','Preview: compact cart icon + price. PDP: Add to cart + price.','Required options, when present, are selected before adding.','Price $4 is a demo value approved for this design.'])text(info,line,'label','secondary');
const map={};for(const [k,v]of Object.entries(variables))map[k]=v.id;
return {createdNodeIds:created,mutatedNodeIds:changed,collectionId:collection.id,variables:map,styles:Object.fromEntries(Object.entries(styles).map(([k,s])=>[k,s.id])),board:board.id,previewSlot:previewSlot.id,controls:Object.fromEntries(Object.entries(controls).map(([k,c])=>[k,c.id])),controlSet:set.id,fonts:'SF Pro / Regular, Medium, Semibold, Bold',validation:{variants:all.length,tokenCount:Object.keys(variables).length,styleCount:Object.keys(styles).length}};
