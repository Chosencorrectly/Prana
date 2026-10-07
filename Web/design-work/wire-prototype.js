const page=await figma.getNodeByIdAsync('1:49359'); await figma.setCurrentPageAsync(page);
const created=[],mutated=[],track=n=>{created.push(n.id);return n;};
for(const style of ['Regular','Medium','Semibold','Bold'])await figma.loadFontAsync({family:'SF Pro',style});
const variableIds={"background":"VariableID:51:5381","surface":"VariableID:51:5382","control":"VariableID:51:5383","border":"VariableID:51:5384","primary":"VariableID:51:5385","secondary":"VariableID:51:5386","muted":"VariableID:51:5387","inverse":"VariableID:51:5388","s4":"VariableID:51:5389","s8":"VariableID:51:5390","s12":"VariableID:51:5391","s16":"VariableID:51:5392","s24":"VariableID:51:5393","s32":"VariableID:51:5394","s48":"VariableID:51:5395","s64":"VariableID:51:5396","r10":"VariableID:51:5397","r20":"VariableID:51:5398","r100":"VariableID:51:5399"},styleIds={"title":"S:206df98ce02e4cf2fd07fa60f2f1cd5868267db2,","section":"S:d2b6d469929bb3071458f957b45463658eccb963,","body":"S:5417b57494517a212b3f696e3e390fd009a1c9a3,","card":"S:62013fb6da493647081042d4415fe4de0f5bb24b,","label":"S:82f38440744cc80733e05ebc99994ffa51e98b38,","caption":"S:16e5267b515d24466990a788a20171bebfa1c8d9,","metric":"S:494b73e11f53d41fde911aa6f4801348327f92a0,"};
const variables={};for(const[k,id]of Object.entries(variableIds))variables[k]=await figma.variables.getVariableByIdAsync(id);
const colors={background:'0A0A0A',surface:'101010',control:'262626',border:'3B3B3B',primary:'FFFFFF',secondary:'A3A3A3',muted:'747474',inverse:'101010'};
const rgb=h=>({r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255});
const defs={title:[36,42,'Bold'],section:[24,30,'Bold'],body:[16,24,'Regular'],card:[16,19,'Bold'],label:[14,18,'Medium'],caption:[12,16,'Medium'],metric:[24,29,'Semibold']};
function paint(k){return figma.variables.setBoundVariableForPaint({type:'SOLID',color:rgb(colors[k])},'color',variables[k]);}
function radius(n,v){n.cornerRadius=v;for(const k of ['topLeftRadius','topRightRadius','bottomLeftRadius','bottomRightRadius'])n.setBoundVariable(k,variables['r'+v]);}
function auto(parent,name,dir='VERTICAL',gap=8,w){const n=track(figma.createAutoLayout(dir));parent.appendChild(n);n.name=name;n.fills=[];n.itemSpacing=gap;if(variables['s'+gap])n.setBoundVariable('itemSpacing',variables['s'+gap]);if(w){n.resize(w,1);n.primaryAxisSizingMode=dir==='VERTICAL'?'AUTO':'FIXED';n.counterAxisSizingMode=dir==='VERTICAL'?'FIXED':'AUTO';}return n;}
function txt(parent,content,style='label',color='primary',width){const n=track(figma.createText());parent.appendChild(n);n.name=content;n.fontName={family:'SF Pro',style:defs[style][2]};n.textStyleId=styleIds[style];n.characters=content;n.fills=[paint(color)];if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);}return n;}
function rule(parent,w){const n=track(figma.createRectangle());parent.appendChild(n);n.name='Divider';n.resize(w,1);n.fills=[paint('control')];return n;}
function instance(parent,master){const n=track(master.createInstance());parent.appendChild(n);return n;}
function recolor(n,key){for(const c of n.findAll(x=>'fills'in x||'strokes'in x)){if('fills'in c&&Array.isArray(c.fills)&&c.fills.length)c.fills=c.fills.map(p=>p.type==='SOLID'?paint(key):p);if('strokes'in c&&Array.isArray(c.strokes)&&c.strokes.length)c.strokes=c.strokes.map(p=>p.type==='SOLID'?paint(key):p);mutated.push(c.id);}}
const photoHash='9f26d5eb827271a3470474b8a206dc3c60d2889b';
const photoPaint={type:'IMAGE',imageHash:photoHash,scaleMode:'FILL'};
async function nav(n,id){await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:id,navigation:'NAVIGATE',transition:null,resetScrollPosition:true}]}]);mutated.push(n.id);}

const controlIds={"Preview/Empty":"51:5413","Preview/One":"51:5417","Preview/Many":"51:5426","Detail/Empty":"51:5434","Detail/One":"51:5439","Detail/Many":"51:5448"};
const collection=figma.variables.createVariableCollection('Prana / Prototype counters');const mode=collection.modes[0].modeId;const variableMap={};
const literal=(value,type)=>({type,resolvedType:type,value});
const alias=v=>({type:'VARIABLE_ALIAS',resolvedType:v.resolvedType,value:{type:'VARIABLE_ALIAS',id:v.id}});
const expr=(fn,args,type)=>({type:'EXPRESSION',resolvedType:type,value:{expressionFunction:fn,expressionArguments:args}});
const set=(v,value)=>({type:'SET_VARIABLE',variableId:v.id,variableValue:value});
const change=id=>({type:'NODE',destinationId:id,navigation:'CHANGE_TO',transition:null});
async function click(n,actions){await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions}]);mutated.push(n.id);}
for(const context of ['Preview','Detail']){
 const empty=await figma.getNodeByIdAsync(controlIds[context+'/Empty']),one=await figma.getNodeByIdAsync(controlIds[context+'/One']),many=await figma.getNodeByIdAsync(controlIds[context+'/Many']);
 const count=figma.variables.createVariable(context+'/quantity',collection,'FLOAT');count.scopes=['TEXT_CONTENT'];count.setValueForMode(mode,2);
 const quantity=figma.variables.createVariable(context+'/quantity label',collection,'STRING');quantity.scopes=['TEXT_CONTENT'];quantity.setValueForMode(mode,'2 items');
 const total=figma.variables.createVariable(context+'/total label',collection,'STRING');total.scopes=['TEXT_CONTENT'];total.setValueForMode(mode,'$8');
 variableMap[context]={count:count.id,quantity:quantity.id,total:total.id};
 const labels=many.findOne(n=>n.type==='FRAME'&&n.name==='Quantity and total').children;
 labels[0].setBoundVariable('characters',quantity);labels[1].setBoundVariable('characters',total);mutated.push(labels[0].id,labels[1].id);
 const refresh=[set(quantity,expr('ADDITION',[alias(count),literal(' items','STRING')],'STRING')),set(total,expr('ADDITION',[literal('$','STRING'),expr('MULTIPLICATION',[alias(count),literal(4,'FLOAT')],'FLOAT')],'STRING'))];
 await click(empty,[change(one.id)]);
 await click(one.findOne(n=>n.name==='Remove item'&&n.type==='FRAME'),[change(empty.id)]);
 await click(one.findOne(n=>n.name==='Increase quantity'),[set(count,literal(2,'FLOAT')),set(quantity,literal('2 items','STRING')),set(total,literal('$8','STRING')),change(many.id)]);
 await click(many.findOne(n=>n.name==='Increase quantity'),[set(count,expr('ADDITION',[alias(count),literal(1,'FLOAT')],'FLOAT')),...refresh]);
 await click(many.findOne(n=>n.name==='Decrease quantity'),[{type:'CONDITIONAL',conditionalBlocks:[{condition:expr('GREATER_THAN',[alias(count),literal(2,'FLOAT')],'BOOLEAN'),actions:[set(count,expr('SUBTRACTION',[alias(count),literal(1,'FLOAT')],'FLOAT')),...refresh]},{actions:[change(one.id)]}]}]);
}
const notes=await figma.getNodeByIdAsync('51:5457');txt(notes,'Prototype counters demonstrate $4 × quantity; separate products need their own cart state in code.','label','secondary',880);mutated.push(notes.id);
const pdp=await figma.getNodeByIdAsync('47:5351');const board=await figma.getNodeByIdAsync('51:5407');const catalogue=await figma.getNodeByIdAsync('42:11131');
await pdp.screenshot({scale:1});await board.screenshot({scale:1});await catalogue.screenshot({scale:0.75});
return {createdNodeIds:created,mutatedNodeIds:mutated,prototypeCollection:collection.id,variables:variableMap,previewSet:'54:5421',previewVariants:['54:5361','54:5378','54:5400'],catalogueTemplate:'54:5424',avocadoInCatalogue:'54:5631',catalogueCardCount:catalogue.findAllWithCriteria({types:['INSTANCE']}).filter(n=>n.width===268&&n.height===402).length,pdpBounds:{width:pdp.width,height:pdp.height},boardBounds:{width:board.width,height:board.height}};

