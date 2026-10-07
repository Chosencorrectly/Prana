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
function auto(parent,name,dir='VERTICAL',gap=8,w){const n=track(figma.createAutoLayout(dir));parent.appendChild(n);n.name=name;n.fills=[];n.itemSpacing=gap;if(variables['s'+gap])n.setBoundVariable('itemSpacing',variables['s'+gap]);if(w){n.resize(w,1);n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='FIXED';}return n;}
function txt(parent,content,style='label',color='primary',width){const n=track(figma.createText());parent.appendChild(n);n.name=content;n.fontName={family:'SF Pro',style:defs[style][2]};n.textStyleId=styleIds[style];n.characters=content;n.fills=[paint(color)];if(width){n.textAutoResize='HEIGHT';n.resize(width,n.height);}return n;}
function rule(parent,w){const n=track(figma.createRectangle());parent.appendChild(n);n.name='Divider';n.resize(w,1);n.fills=[paint('control')];return n;}
function instance(parent,master){const n=track(master.createInstance());parent.appendChild(n);return n;}
function recolor(n,key){for(const c of n.findAll(x=>'fills'in x||'strokes'in x)){if('fills'in c&&Array.isArray(c.fills)&&c.fills.length)c.fills=c.fills.map(p=>p.type==='SOLID'?paint(key):p);if('strokes'in c&&Array.isArray(c.strokes)&&c.strokes.length)c.strokes=c.strokes.map(p=>p.type==='SOLID'?paint(key):p);mutated.push(c.id);}}
const photoHash='9f26d5eb827271a3470474b8a206dc3c60d2889b';
const photoPaint={type:'IMAGE',imageHash:photoHash,scaleMode:'FILL'};
async function nav(n,id){await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:id,navigation:'NAVIGATE',transition:null,resetScrollPosition:true}]}]);mutated.push(n.id);}

const root=await figma.getNodeByIdAsync('47:5351');if(root.children.length)throw new Error('PDP already composed');mutated.push(root.id);root.paddingBottom=64;root.itemSpacing=0;root.counterAxisAlignItems='CENTER';
const header=auto(root,'Header','HORIZONTAL',0,1440);header.resize(1440,62);header.primaryAxisSizingMode='FIXED';header.counterAxisSizingMode='FIXED';header.paddingLeft=160;header.paddingRight=160;header.primaryAxisAlignItems='SPACE_BETWEEN';header.counterAxisAlignItems='CENTER';
const address=auto(header,'Delivery address','HORIZONTAL',12);address.counterAxisAlignItems='CENTER';const pin=instance(address,await figma.getNodeByIdAsync('1:11'));pin.resize(24,24);recolor(pin,'primary');const addressText=auto(address,'Delivery address labels','VERTICAL',0);txt(addressText,'Deliver to','caption','secondary');txt(addressText,'Jl.Paya Padonan No21a','label');
const rightHeader=auto(header,'Header actions','HORIZONTAL',24);rightHeader.counterAxisAlignItems='CENTER';const cartButton=auto(rightHeader,'Cart','HORIZONTAL',8);cartButton.counterAxisAlignItems='CENTER';const cart=instance(cartButton,await figma.getNodeByIdAsync('1:13'));cart.resize(16,16);recolor(cart,'primary');txt(cartButton,'Cart','label');const avatar=auto(rightHeader,'Account','HORIZONTAL',0);avatar.resize(36,36);avatar.primaryAxisSizingMode='FIXED';avatar.counterAxisSizingMode='FIXED';avatar.primaryAxisAlignItems='CENTER';avatar.counterAxisAlignItems='CENTER';avatar.fills=[paint('control')];radius(avatar,100);txt(avatar,'AG','caption');
const content=auto(root,'Page content','VERTICAL',32,1120);content.paddingTop=40;
const back=auto(content,'Back to menu','HORIZONTAL',8);back.counterAxisAlignItems='CENTER';txt(back,'←','body','secondary');txt(back,'Back to menu','label','secondary');await nav(back,'42:11131');
const main=auto(content,'Dish details / 600 + 48 + 472','HORIZONTAL',48);main.counterAxisAlignItems='MIN';
const left=auto(main,'Photo and product information','VERTICAL',40,600);
const photo=track(figma.createRectangle());left.appendChild(photo);photo.name='Avocado Toast / source photo';photo.resize(600,552);photo.fills=[photoPaint];radius(photo,20);
const ingredients=auto(left,'Ingredients','VERTICAL',16,600);txt(ingredients,'Ingredients','section');txt(ingredients,'Avocado smash, gluten-free sourdough, eggs, roasted beets, red onion, arugula, cilantro, house crunch mix.','body','secondary',568);
rule(left,600);
const nutrition=auto(left,'Nutrition breakdown','VERTICAL',20,600);const nh=auto(nutrition,'Nutrition header','HORIZONTAL',0,600);nh.primaryAxisSizingMode='FIXED';nh.primaryAxisAlignItems='SPACE_BETWEEN';nh.counterAxisAlignItems='CENTER';txt(nh,'Nutrition','section');txt(nh,'Per serving','caption','secondary');
for(const [label,value]of [['Energy','423 kcal'],['Protein','13 g'],['Fat','24 g'],['Carbs','42 g']]){const row=auto(nutrition,label,'HORIZONTAL',0,600);row.primaryAxisSizingMode='FIXED';row.primaryAxisAlignItems='SPACE_BETWEEN';txt(row,label,'body','secondary');txt(row,value,'body');if(label!=='Carbs')rule(nutrition,600);}
const info=auto(main,'Product information / sticky top 96','VERTICAL',24,472);info.paddingTop=8;
const heading=auto(info,'Heading and dietary tags','VERTICAL',16,472);
const tags=auto(heading,'Dietary tags','HORIZONTAL',8);for(const s of ['GF','LF']){const tag=auto(tags,s,'HORIZONTAL',0);tag.paddingLeft=10;tag.paddingRight=10;tag.paddingTop=5;tag.paddingBottom=5;tag.fills=[paint('control')];radius(tag,100);txt(tag,s,'caption','secondary');}
txt(heading,'Avocado Toast','title','primary',472);
txt(heading,'Gluten-free sourdough, poached egg','body','secondary',448);
rule(info,472);
const facts=auto(info,'Nutrition summary','VERTICAL',12,472);txt(facts,'Nutrition per serving','caption','secondary');
const metrics=auto(facts,'Kcal and macros','HORIZONTAL',0,472);metrics.primaryAxisSizingMode='FIXED';metrics.primaryAxisAlignItems='SPACE_BETWEEN';
for(const[value,label]of [['423','kcal'],['13 g','Protein'],['24 g','Fat'],['42 g','Carbs']]){const group=auto(metrics,label,'VERTICAL',4);txt(group,value,'metric');txt(group,label,'caption','secondary');}
rule(info,472);
const buy=auto(info,'Purchase','VERTICAL',16,472);txt(buy,'$4','section');const control=instance(buy,await figma.getNodeByIdAsync('51:5434'));control.name='Purchase / interactive state';
const notes=await figma.getNodeByIdAsync('51:5457');mutated.push(notes.id);
for(const line of ['Data: Avocado Toast, composition and nutrition from the supplied reference.','GF / LF only. Weight, allergens and modifiers are absent from the supplied data.','Show optional data only when provided; modifiers go immediately before Purchase.','Desktop: right information column sticks at 96 px within the product section.','Nutrition figures are shown per serving; confirm this basis against product data.','Photo is cropped from the supplied preview. Replace with the original high-resolution asset.','New type uses SF Pro; SF Pro Display is unavailable in this Figma connection.'])txt(notes,line,'label','secondary',880);
root.placeholder=false;const temp=await figma.getNodeByIdAsync('47:5352');if(temp){temp.remove();mutated.push('47:5352');}
return {createdNodeIds:created,mutatedNodeIds:mutated,pdp:root.id,information:info.id,purchase:control.id,back:back.id,photo:photo.id,bounds:{x:root.x,y:root.y,width:root.width,height:root.height},textCount:root.findAllWithCriteria({types:['TEXT']}).length};

