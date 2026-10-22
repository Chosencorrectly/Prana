const board=await figma.getNodeByIdAsync('1378:1785');
if(board.children.some(n=>n.name==='Lane / '+laneKey))throw new Error('Lane already exists: '+laneKey);
const lane=frame(board,'Lane / '+laneKey,5320,1370);place(lane,40,430+laneIndex*1410);
text(lane,laneTitle,32,'text','Semibold',5200);
place(text(lane,laneDesc,18,'secondary','Regular',5200),0,48);
const screens=[];
for(let i=0;i<specs.length;i++){const o=makeScreen(lane,specs[i],i);await render(o);screens.push({id:specs[i].id,nodeId:o.phone.id,name:specs[i].name,contentBottom:o.body.y+o.body.height+62,noteHeight:o.note.height});}
return {createdNodeIds:[lane.id,...lane.findAll(()=>true).map(n=>n.id)],laneId:lane.id,screens};
