const root=await figma.getNodeByIdAsync('1385:2482');
function screen(code){return root.children.find(n=>n.name.startsWith('Screen / '+code+' /'));}
function annotation(code){return root.children.find(n=>n.name==='Пояснение / '+code);}
async function go(n,target){await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'NODE',destinationId:screen(target).id,navigation:'NAVIGATE',transition:{type:'DISSOLVE',duration:.2,easing:{type:'EASE_OUT'}}}]}]);}
function note(code,title,why,flow,risk){let n=annotation(code);if(!n){n=annotation('B06').clone();root.appendChild(n);n.name='Пояснение / '+code;made.push(n.id,...n.findAll(()=>true).map(x=>x.id));}const s=screen(code);n.x=s.x;n.y=s.y+956;const t=n.children.filter(x=>x.type==='TEXT');t[0].characters=code+' · '+title;t[1].characters=why;t[2].characters='Переходы: '+flow;if(risk){if(t[3])t[3].characters='Уточнить: '+risk;else text(n,'Уточнить: '+risk,13,'secondary','Regular',390);}return n;}
function clone(code,newCode,name,col,row){const s=screen(code).clone();root.appendChild(s);s.name='Screen / '+newCode+' / '+name;s.x=40+486*col;s.y=530+1410*row;made.push(s.id,...s.findAll(()=>true).map(x=>x.id));return s;}
async function disable(n,value){n.swapComponent(comps['Button/disabled']);label(n,value);n.name='Disabled / '+value;await n.setReactionsAsync([]);}

// 1. The old source map was Miami. Replace only the three maps in the proposal.
const mapFill=(await figma.getNodeByIdAsync('1381:2133')).fills;
for(const id of ['1381:2133','1382:2046','1382:2181']){const m=await figma.getNodeByIdAsync(id);m.name='Map / Padonan Bali / OpenStreetMap';m.fills=mapFill;const attribution=frame(m,'Map attribution',390,24,'surface');place(attribution,0,m.height-24);place(text(attribution,'© OpenStreetMap contributors',11,'text','Regular',366),12,5);}
note('C05','Отслеживание доставки','Статус и ожидаемое время видны до карты. География Padonan согласована с адресом. Карта — ориентир; точные координаты курьера, здания и ETA в макете не подтверждены.','Детали → C10; помощь → C11; Back → C01.','Демо-статусы и ETA; карта OpenStreetMap показывает район, а не проверенный маршрут.');
note('D03','Выбор точки на карте','Район Padonan на Бали соответствует тексту адреса. Поиск и ручной ввод остаются доступны без геопозиции; подтверждение отделено от перемещения карты.','Поиск → D04; подтвердить → D07; вне зоны → D06; permission denied → D11.','Точка приблизительная; точный дом и зона доставки требуют геокодера и backend.');
note('D06','Адрес вне зоны','Ошибка объясняет, почему адрес нельзя выбрать, и сохраняет путь к новой точке. Карта района Padonan служит иллюстрацией состояния.','Изменить точку → D03; другой адрес → D01.','Реальные границы доставки не предоставлены; принадлежность этого адреса к зоне не установлена.');

// 2. Incomplete and invalid phone codes cannot verify successfully.
const complete=clone('B06','B11','Полный код / готов к проверке',10,1);
for(const t of complete.findOne(n=>n.name==='One-time code').findAll(n=>n.type==='TEXT'))t.characters='1';
await go(complete.findOne(n=>n.name.endsWith('/ Verify number')),'B10');
await disable(screen('B06').findOne(n=>n.name.endsWith('/ Verify number')),'Verify number');
await go(screen('B06').findOne(n=>n.name==='One-time code'),'B11');
await disable(screen('B07').findOne(n=>n.name.endsWith('/ Verify number')),'Verify number');
await go(screen('B07').findOne(n=>n.name==='One-time code'),'B11');
note('B06','Неполный код','Номер получателя виден и доступен для исправления. Пока код неполный, подтверждение недоступно. Один логический ввод должен поддерживать вставку и SMS autofill.','Тап по коду имитирует полный ввод → B11; Change number → B05.','SMS, autofill и таймер требуют реализации; клавиатура в макете иллюстративна.');
note('B11','Полный код / готов к проверке','Verify number становится доступна только после полного ввода. Успех зависит от ответа сервера; неверный код остаётся отдельным состоянием B07.','Verify number → B10; сервер отклонил код → B07; Change number → B05.');

// 3. Cancelled-order help must retain order 137 and unknown payment status.
const help=clone('C09','C12','Помощь по отменённому заказу',11,2);
for(const t of help.findAll(n=>n.type==='TEXT')){if(t.characters==='Help with order #138')t.characters='Help with order #137';if(t.characters==='Delivered · 16 Oct')t.characters='Cancelled · 14 Oct';if(t.characters==='Total paid')t.characters='Order total';if(t.characters==='Your order details stay attached to this request.')t.characters='Payment status is unavailable. Your order details stay attached.';}
for(const n of help.findAll(n=>n.name.startsWith('Go / '))){if(n.name.endsWith('/ Try again')){n.name='Retry / C12';await n.setReactionsAsync([]);}else if(n.name.endsWith('/ Back')||n.name.endsWith('/ Back to order')){n.name='Go / C08 / '+(n.name.endsWith('/ Back')?'Back':'Back to order');await go(n,'C08');}}
const cancelledHelp=screen('C08').findOne(n=>n.name.endsWith('/ Need help?'));cancelledHelp.name='Go / C12 / Need help?';await go(cancelledHelp,'C12');
note('C12','Помощь по отменённому заказу','Поддержка получает номер #137 и статус отмены. Сумма названа итогом заказа, без неподтверждённого утверждения об оплате или возврате.','Back / Back to order → C08; Try again повторяет загрузку контакта.','Канал поддержки, статус оплаты и правила возврата не предоставлены.');
const c8=annotation('C08');for(const t of c8.children.filter(n=>n.type==='TEXT'))t.characters=t.characters.replace(/C09/g,'C12');

// 4. Separate document identities, and native history Back retains entry point.
const terms=clone('G06','G09','Условия использования недоступны',8,6);
for(const [code,title,heading,copy] of [['G06','Privacy policy','Privacy policy unavailable','We couldn’t load the privacy policy. Please try again when you’re connected.'],['G09','Terms of use','Terms of use unavailable','We couldn’t load the terms of use. Please try again when you’re connected.']]){const s=screen(code);for(const t of s.findAll(n=>n.type==='TEXT')){if(t.characters==='Document')t.characters=title;if(t.characters==='Document is unavailable')t.characters=heading;if(t.characters==='We couldn’t load this document. Please try again when you’re connected.')t.characters=copy;if(t.characters==='Back to settings')t.characters='Back';}note(code,title+' / недоступно','Название документа сохраняется даже при ошибке. Back возвращает к экрану, с которого документ открыли: настройкам, Credits или удалению аккаунта.','Try again повторяет запрос; Back использует историю навигации.','Утверждённый юридический текст не предоставлен; его содержание не выдумано.');}
for(const s of [screen('G01'),screen('G04')]){const n=s.findOne(n=>n.name.endsWith('/ Terms of use'));n.name='Go / G09 / Terms of use';await go(n,'G09');}
for(const code of ['F03','G06','G09']){const s=screen(code);for(const n of s.findAll(n=>n.name.startsWith('Go / '))){if(n.name.endsWith('/ Back')||n.name.endsWith('/ Back to settings')){n.name='History / Back';await n.setReactionsAsync([{trigger:{type:'ON_CLICK'},actions:[{type:'BACK'}]}]);}if(n.name.endsWith('/ Try again')){n.name='Retry / '+code;await n.setReactionsAsync([]);}}}
note('F03','Условия бонусной программы недоступны','Не заменяем договорные правила вымышленными условиями. Ошибка сохраняет название раздела; Back возвращает к исходному экрану баллов или настроек.','Try again повторяет запрос; Back использует историю навигации.','Курс, сроки, ограничения и утверждённый текст программы ещё не предоставлены.');

// 5. Deletion-code errors stay inside deletion, never phone-number editing.
const badDelete=clone('H04','H09','Ошибка кода удаления',8,7);
const codeField=badDelete.findOne(n=>n.name==='Field / Verification code');
codeField.findOne(n=>n.type==='TEXT'&&n.characters==='1 1 1 1').characters='0 0 0 0';
text(codeField,'This code is incorrect or has expired. Try again.',14,'error','Regular',390);
await go(codeField,'H04');
await disable(badDelete.findOne(n=>n.name.endsWith('/ Delete account')),'Delete account');
note('H04','Подтверждение личности','Удаление требует свежего подтверждения. Финальная кнопка прямо называет действие; ошибка кода остаётся в этом сценарии и не переводит в смену телефона.','Delete account → H05; ошибка кода → H09; Back → H03.','Пример показывает полный код; при неполном вводе финальная кнопка недоступна.');
note('H09','Ошибка кода удаления','Причина ошибки показана под кодом, остальные данные сохранены. Удаление недоступно до исправления; смена номера не появляется внутри опасного действия.','Тап по полю имитирует исправление → H04; Send a new code → H04; Back → H03.','В реализации повторная отправка очищает код и запускает серверный таймер.');

// 6. The whole switch row receives a 48pt target, independently of text height.
const switches=root.findAll(n=>n.type==='FRAME'&&n.layoutMode==='HORIZONTAL'&&n.children.some(c=>c.name==='Switch / On'||c.name==='Switch / Off'));
for(const n of switches){n.minHeight=48;n.counterAxisSizingMode='AUTO';n.counterAxisAlignItems='CENTER';}
const intro=root.findAll(n=>n.type==='TEXT'&&!n.parent.name.startsWith('Screen /'));
for(const t of intro){if(/(?:69|71) экран/.test(t.characters))t.characters=t.characters.replace(/(?:69|71) экран/g,'75 экран');}
figma.viewport.scrollAndZoomIntoView([screen('A01')]);
return {board:root.id,newScreens:['B11','C12','G09','H09'].map(c=>({code:c,id:screen(c).id})),switches:switches.map(n=>({id:n.id,h:n.height,min:n.minHeight})),created:made};

