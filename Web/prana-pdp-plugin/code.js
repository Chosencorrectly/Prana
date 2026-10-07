async function main() {
  const page = await figma.getNodeByIdAsync('1:49359');
  await figma.setCurrentPageAsync(page);
  const target = await figma.getNodeByIdAsync('42:11131');
  if (!target) throw new Error('Target Prana catalogue was not found.');
  const fonts = await figma.listAvailableFontsAsync();
  const styles = await figma.getLocalTextStylesAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const cards = target.findAllWithCriteria({types:['INSTANCE']}).filter(n=>n.width>200);
  const report = {
    page:{id:page.id,name:page.name},
    target:{id:target.id,x:target.x,y:target.y,width:target.width,height:target.height,fills:target.fills},
    frames:page.children.map(n=>({id:n.id,name:n.name,type:n.type,x:n.x,y:n.y,w:n.width,h:n.height})),
    fonts:fonts.filter(f=>/SF Pro/.test(f.fontName.family)),
    styles:styles.map(s=>({id:s.id,name:s.name,fontName:s.fontName,fontSize:s.fontSize})),
    vars:vars.map(v=>({id:v.id,name:v.name,type:v.resolvedType})),
    cards:cards.slice(0,18).map(n=>({id:n.id,name:n.name,texts:n.findAllWithCriteria({types:['TEXT']}).map(t=>({id:t.id,text:t.characters,font:t.fontName,size:t.fontSize,fill:t.fills})),images:n.findAll(x=>'fills' in x && Array.isArray(x.fills)&&x.fills.some(p=>p.type==='IMAGE')).map(x=>({id:x.id,fills:x.fills})),main:n.mainComponent?{id:n.mainComponent.id,name:n.mainComponent.name}:null})),
    related:page.findAllWithCriteria({types:['TEXT']}).filter(n=>/avocado|toast/i.test(n.characters)).slice(0,20).map(n=>({id:n.id,text:n.characters,parent:n.parent.id}))
  };
  const json=JSON.stringify(report,null,2);
  figma.showUI('<html><body style="margin:16px;background:#171717;color:#eee;font:13px Arial"><b>Prana — read-only design inspection</b><textarea aria-label="Design inspection" style="margin-top:12px;width:100%;height:520px;background:#222;color:#eee">'+json.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</textarea></body></html>',{width:720,height:600});
}
main().catch(e=>figma.closePlugin('Prana: '+e.message));
