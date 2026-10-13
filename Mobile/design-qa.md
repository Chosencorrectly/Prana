# Prana mobile — визуальная и функциональная проверка

## D-60 — два snap и публикация, 13.10.2026

297/768 заменяют297/533/768. Проверены drag около прежнего среднего положения, Expand, End, tap ручки, Close и повторный вход; tap переключает на pointerup, клавиатурный click обрабатывается отдельно. Публичный [mobile](https://prana-mobile-01.vercel.app) прошёл Skip→блюдо→Cart→Checkout→номер→SMS1111→Order→297→768→297→Close→баннер→tracking. Все15 изображений tracking загружены, console error/warn0. [Аудит](reference/publication/browser-audit.json), [раскрыто](reference/publication/tracking-expanded.jpg), [свёрнуто](reference/publication/tracking-collapsed.jpg).

Отдельная экспортная копия: npm ci, build/TypeScript/integrity29 и54 теста passed. После уточнения pointerup повторная сборка passed. Vercel production READY; cloud build восстановил154/154 оригинальных assets из pin8354838 с SHA-256 и проверил runtime29. Прежний JS chunk>500kB warning. Системный reduced motion/физический touch/FPS отдельно не проверялись. GitHub Mobile/ и Web/prototype/ разделены; никакие реальные SMS/оплата не выполнялись. [Deployment и границы проверки](reference/publication/README.md).

## D-59 — баннер заказа и доступность кнопок, 13.10.2026

Прочитан полный контекст1240:676 и screenshot1240:668. Самодельный нижний shortcut заменён исходным баннером. В браузере: x14.99/y128.96,400×70,иллюстрация52×52,x343.98/y137.95,#191919,radius50; asset загружен. Старого progress внутри баннера нет. Source copy адаптирован к текущему order.status/eta без изменения стадии заказа. Категории/каталог учитывают дополнительные102px.

Проверены локальная покупка1 блюда → Checkout → номер → SMS1111 → Order → Close → баннер → тот же заказ → Close. Phone Continue: disabled→enabled→disabled, цвета#757575/#454545 ↔ #ea5c00/#fff, computed transition180ms. SMS Continue включается после4 цифр с тем же transition. Общие правила также покрывают адресные CTA/resend; эти дополнительные сценарии в этой итерации отдельно не прогонялись. Новых hover нет; reduced motion правило0ms, системное переключение отдельно не проверялось. FPS не измерялся.

Build/TypeScript и integrity29 прошли; прежнее предупреждение JS>500kB остаётся. Console error/warn:0. Новые модельные тесты для этой визуальной правки не добавлялись, существующие в этой итерации не перезапускались. [Кадр](reference/order-indicator/browser-menu.jpg), [замеры](reference/order-indicator/browser-audit.json), [источник/адаптации](reference/order-indicator/README.md). Ожидает оценки пользователя; публикации нет.

## D-58 — активный заказ, 13.10.2026

Прочитаны1085:1797/1310:3491,4 полных макета и4 notices. [Реестр/кадры/адаптации](reference/active-order/README.md), [аудит](reference/active-order/browser-audit.json), [SVG и raster assets](reference/active-order/asset-audit.json). D-57/D-58 ждут совместного просмотра; user approval не подразумевается.

- TypeScript/Vite/упаковка/integrity29 passed;31 модельный тест(order6/cart2/address5/phone4/promo5/motion9). JS610.66kB/gzip181.63, CSS69.26kB/gzip13.32; прежнийwarning>500kB.
- IAB:4 блюда → новый адрес сapt1204/access2481/комментарием → Save/Deliver here → SMS1111 → promo1111 → Order. В активном заказе$48.85−$4.89=$43.96; корзина после оформления пустая. Отдельно проверены независимость снимка и пустой/неподтверждённый заказ моделями.
- Начальныйtop297, drag до533,Expand до768 и обратно. Панель/карта не заменяются; ETA/status/stage1 постоянны. Scroll351.485 иShow less сохраняются между snap; послеClose/reopen сохраненыscroll870.297,expanded иTotal$43.96. Крестик имеет тот жеPDP-фонwhite13%/blur35. Escape закрывает в Menu, фокус восстанавливается.
- Show more раскрывает четвёртое блюдо. Внизу доступныTotal,200points иSupport. Нет hover; общий нижнийblur4/12/34. Каждый новый asset загружен; исходныеSVGdimensions сохранены. По visual QA поправлен цвет комментария и заданы исходные размеры тонкимSVG-dividers.

Физическийtouch/screen reader/FPS и системныйreduced motion не проверялись. ETA/маршрут/курьер/баллы — fixtures, не реальные сервисы. Публикаций нет.

## D-57 — изменение адреса, 13.10.2026

Источники1057:1242/1309:3490, все7 notices1094:1368…1428 прочитаны. [Источник/адаптации/кадры](reference/checkout-address/README.md), [аудит](reference/checkout-address/browser-audit.json). Новая реализация ожидает оценки; D-56 положительно оценён пользователем в текущем запросе.

- TypeScript/Vite/упаковка/integrity29 passed. JS598.79kB/gzip178.92; CSS62.82kB/gzip12.16. Прежний warning>500kB. 23 tests: address5 + phone4 + promo5 + motion9 passed.
- IAB/iPhone430×932: вход из Delivery, список Home/Work, +Add; поиск Brickell/1000/zzzz; свой scroll и визуальная клавиатура; выбор1000BrickellPlaza возвращает карту. Реальный mouse-drag переносит pin в красную область, warning остаётся и Continue disabled; стрелки возвращают доступность.
- Все6 полей заполнены; Edit location/Back сохраняют координату и значения. Save добавляет третью выбранную строку, checkout всё ещё содержит старый адрес. Выход без Deliver here не применяет его. Deliver here меняет checkout и комментарий Meet at reception. Edit существующей записи не создаёт дубликат; отменённое Floor25 осталось24 при повторном открытии. Save с открытой клавиатурой работает.
- Escape скрывает клавиатуру/фокусирует Back, затем возвращает map/list. Search без клавиатуры расширяет выдачу408→675px. Поле Floor и последнее Address label находятся выше Save после стабилизации. SVG/image local-loaded и размеры22/13/18/24/40/370×1 проверены; карта889×1147. Длинный адрес обрезается в шапке меню.
- Карта/геокодирование/зона условные, только шесть source fixtures. Нет API/геолокации. Pickup нового flow исключён. Не проверялись Pixel, физический touch, native keyboard, screen reader и system reduced motion; FPS не измерялся. Protected runtime/desktop/Figma/публикации не изменены.


## D-56 — отсутствующий номер в checkout и Support, 13.10.2026

Прочитаны общий сценарий1306:3489, пояснение1056:1028 и все шесть notices; детально получены phone/code panels и Support1057:1162. [Реестр Figma/адаптаций](reference/checkout-phone/figma-source.json), [кадры и протокол](reference/checkout-phone/README.md).

- TypeScript/Vite/Sites packaging и integrity29 прошли.23 теста auth5 + promo5 + phone4 + motion9 прошли. JS585.08kB/gzip175.28, CSS53.67kB/gzip10.83; прежний warning >500kB сохраняется.
- IAB: Add phone number по умолчанию, disabled Continue для пустого номера/неполного кода, валидный номер, ошибка2222 без выхода, resend с очисткой и таймером43s. Back/Continue сохраняет номер и продолжающийся cooldown. Код1111 возвращает в Delivery, CTA Order, клавиатура скрывается, фокус на Order.
- До/после подтверждения совпали scroll797.03, leave=false, выбранные второй time/card, promo1111, Total$10.75. Close/reopen сохраняет подтверждённый номер. Clear cart сбрасывает товары/промокод, но новый заказ сохраняет Order. Reload возвращает дефолт Add phone number.
- После Escape клавиатура скрывается и фокус переходит на Back; повторный Escape возвращает в Checkout с фокусом Add phone number. Один BottomSheet, скрытые сцены inert; нет новых hover.
- Замеры в логических px: phone surface top368/height564, поле400×61 at15/456, Continue399×54 at16/549, keyboard301 at631. Support400×211, кнопка360×50, WhatsApp20×20 загружен. Нижние фейды используют общий BottomFade4/12/34 вне анимированных opacity-родителей.

Contact support не открывает внешнюю переписку: адрес отсутствует. Реальные SMS, API оформления/сохранения, системный reduced motion, touch и screen reader не проверялись. Локальная реализация ждёт пользовательской оценки; публикации нет.

Обновлено: 13.10.2026, Europe/Moscow. Источник: [Prana-App, авторизация](https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1028-27187); источники следующих этапов приведены ниже. Реализация: http://127.0.0.1:5181/, папка `mobile/`. Пользователь одобрил анимацию перехода по D-43 и положительно оценил открытие PDP в D-52, затем одобрил закрытие D-52 в запросе D-53; это не общая приёмка приложения. Публикации нет.

## D-55 — действия в шапке Cart и скрытый Edit, 13.10.2026

По прямой правке пользователя Clear cart перенесён влево, иконка стала белой, добавлена подпись. Close — справа, Edit скрыт у всех блюд до отдельного этапа кастомизации. SVG не перерисован: исходный clear.svg отображается через brightness(0)/invert(1). Источник этой адаптации — запрос, Figma не изменён.

- IAB/iPhone430×932: текст Clear cart и белая иконка видимы слева, Close справа; Edit отсутствует в DOM. При прокрутке центральный адрес помещается между кнопками. Drag-область с отступами125px не пересекает кнопки. Проверено закрытие перетаскиванием за центр шапки, фокус вернулся Cart.
- Clear cart открывает прежнее подтверждение; Escape отменяет без удаления блюда и возвращает фокус Clear cart. Подтверждение очищает корзину, скрывает Clear, Close остаётся справа. Close в empty закрывает панель и возвращает фокус Search. Повторное добавление/открытие работает.
- TypeScript/Vite/упаковка и integrity29 прошли. JS578.34kB/gzip173.82kB, CSS49.76kB/gzip10.20kB; прежнее предупреждение >500kB. Новых тестов и повторного запуска модельных suites для этой небольшой визуальной правки не было. Браузерная проверка mouse/keyboard; физический touch/Pixel/system reduced motion/screen reader не проверялись. Protected runtime, desktop и публикации не менялись. Результат ожидает просмотра.

[Первый экран](reference/cart-toolbar/browser-initial.jpg), [компактная шапка](reference/cart-toolbar/browser-scrolled.jpg), [аудит](reference/cart-toolbar/browser-audit.json).

## D-54 — шапка checkout, устойчивый выбор и добавление строк, 13.10.2026

Источник — явные поправки пользователя к D-53, нового Figma URL для стрелки в сообщении нет. Использован исходный `assets/auth/back.svg`22×22. Новый заголовок Checkout исправляет ошибку макета; source-ledger D-53 сохраняет исторический Cart. Figma не редактировался.

- Баг воспроизведён в IAB: до нажатия selected-time имел inset shadow; после выбора другого aria-pressed=true/focus=true, но boxShadow=none из-за общего правила protected runtime. У карты та же реализация. Замена тени на отдельный border устранила конфликт без изменения runtime/focus.
- Выбранное время после нажатия и после ухода фокуса: ringOpacity1, selected=true.12 выборок удержания второй карты: ringOpacity1 на всём пути, только pressed opacity1→0.78; после blur обводка1. Старый вариант теряет выделение, новый сохраняет его. Keyboard Tab фокусирует Close с отдельным outline2px. Hover не добавлен.
- Back to cart вернул Cart, focus Proceed to Checkout; повторный вход сохранил время и карту. Close удалил и checkout, и корзину, document.title стал Menu, фокус вернулся Cart. Проверен Close при открытом поле/клавиатуре с применённым1111: оба слоя закрылись; в сценарии, где исходная кнопка Cart исчезала при очистке, fallback-фокус вернулся Search. При повторном входе promo сохранён: $8.95 → $8.05.
- Добавление Aloe из рекомендаций:40 выборок после окончательной правки, высота82→117→124→126px/opacity0.635→1, без изменения scroll109.901; рекомендации смещаются непрерывно. Первый вариант height:auto выявил ошибку измерения масштаба и был заменён grid0fr↔1fr. Удаление строки/подтверждённая очистка сохранились. Из empty добавлен Coco:32 выборки, empty298→174→67→21→удалён, строка97→126→130→131px, счётчик/сумма1/$8.95. При открытии уже существующие строки opacity1.
- Итоговый build: TypeScript/Vite/упаковка, integrity29 passed; JS578.42kB/gzip173.84kB, CSS49.70kB/gzip10.15kB, прежнее предупреждение >500kB.16/16 существующих тестов: cart2/checkout5/motion9. Новых тестов для визуальной правки не добавляли. Console warn/error пусты. React checklist: стабильные ключи и общие данные, контекстный onClose, сохранённые focus/inert, persistent AnimatePresence, без таймеров/слушателей/новых зависимостей.
- Физический touch/Pixel, системный reduced motion, screen reader, остальные suites и FPS-профиль не проверялись. Protected runtime/desktop/Figma/публикации не менялись. Результат D-54 ожидает просмотра пользователя.

[Аудит и параметры](reference/checkout-refinement/README.md), [шапка/время](reference/checkout-refinement/browser-header-time.jpg), [карта](reference/checkout-refinement/browser-payment.jpg).

## D-53 — Delivery checkout, 13.10.2026

Источник: [Prana-App 1028:34599](https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1028-34599), [скриншот Figma](reference/checkout/figma-delivery.png), [реестр узлов, 13 SVG и адаптаций](reference/checkout/figma-source.json). High-fidelity context, metadata и screenshot прочитаны; motion context без узлов. Material Close из Code Connect заменён экспортом точного Figma vector (SHA совпал с существующим крестиком корзины), а не нарисован заново. SVG сохранены в исходных размерах; house/promo масштабируются обёрткой до исходных слотов 16/18px. Защищённая живая status bar сохранена.

- IAB, iPhone 430×932: макет 430×1568 преобразован в MobileScroll с закреплёнными header/Total/Order. Из-за safe area 62 вместо 56 документные координаты смещены на 6px. Замеры: tabs y126.006 / 400.018×58.989; address y263.987 / 400.018×129.998; Leave y399.972 / h72.989; time y529.954 / h53.992; promo y647.916 / h64.991; calculation y791.899 / h220.995; points y1053.891 / h159.995; payment y1270.878 / h105.988. CTA x15.996 / y842.008 / 399.013×53.992, то есть 36px снизу. Горизонтального overflow нет, все исходные SVG загружены.
- Cart → Proceed to Checkout фокусирует Delivery. Checkout использует прежний FlowStack/authStep. Девять выборок входа показали сдвиг сцены 24→0px и opacity 0→1; opacity host/footer оставалась 1, альфа масок блюра 0.602→0.939→0.998→1. Кадры просмотрены; времена включают задержки инструмента и не являются FPS-профилем.
- Промокод повторяет web: 400ms debounce + 650ms mock validation, loader 700ms, feedback 150ms. В браузере Chicken omelet + Acai = 2/$31.90; 1111 → Applied / −$3.19 / Total $28.71. Редактирование сразу снимает скидку; неверный код → Promo code not found; очистка → idle. В 17 выборках наблюдались debouncing/validating/applied и вращение loader.
- Клавиатура 301px: после автопрокрутки поле занимает y255.834–320.825, верх нижнего блока y454.010; поле доступно над ним. Панель корзины сохраняет y62 / h870. Enter скрывает клавиатуру и фокусирует Back to cart; следующий Escape возвращает корзину и фокус Proceed to Checkout, не закрывая панель целиком.
- Leave at the door переключается; выбор второй сохранённой карты меняет aria-pressed. Повторный вход сохраняет локальные параметры, код и прокрутку: 711.881→711.881. Увеличение Acai в корзине даёт 3/$47.85; сохранённый 1111 пересчитывает Total в $43.06. Полная очистка корзины сбрасывает promo в пустой idle. Каталог и корзина показывают базовую стоимость, скидка применяется в checkout.
- Проверены нижние фейды: каталог, корзина и checkout используют общий BottomFade с 4/12/34px; в корзине прежний простой градиент заменён. Footer checkout вынесен из opacity-анимации сцены. Прежняя photo/fade/blur-поверхность PDP сохранена, D-52 одобрен пользователем в этом запросе.
- `npm run build`: TypeScript/Vite/упаковка и integrity 29 прошли. JS 577.54kB/gzip 173.69kB, CSS 48.86kB/gzip 9.98kB; прежнее предупреждение >500kB сохраняется. 30/30 тестов: checkout 5, cart 2, catalog 5, dish 5, search 4, motion 9. Проверены отмена старого ответа промо, IME, dispose, округление и пересчёт. Console warn/error пусты. React checklist: общие данные, отмена таймеров/прокрутки, focus/inert, защита вложенного Escape, стабильные callback и существующий FlowStack; новых зависимостей нет.
- Ограничения: физический touch/Pixel, системный reduced motion, screen reader, auth/runtime-browser/sites suites не запускались. Адрес/комментарий, повторяющиеся интервалы/карты, баллы/срок, Free и +$2 — образцы Figma. Pickup, редактирование адреса/телефона/комментария, списание баллов, добавление карты, отправка и отслеживание заказа отложены. Order не создаёт заказ. Protected runtime/Figma/desktop/публикации не менялись. Реализация Delivery ожидает оценки пользователя.

Свидетельства: [browser audit](reference/checkout/browser-audit.json), [вход](reference/checkout/entry-trace.json), [promo trace](reference/checkout/promo-trace.json), [начало](reference/checkout/browser-initial.jpg), [середина](reference/checkout/browser-middle.jpg), [низ](reference/checkout/browser-bottom.jpg), [клавиатура](reference/checkout/browser-keyboard.jpg), [loader](reference/checkout/browser-loader.jpg), [блюр корзины](reference/checkout/browser-cart-blur.jpg). QA выполнен в отдельной вкладке, она закрыта; пользовательская вкладка сохранена.

## D-52 — возврат без отдельного появления контента, 13.10.2026

По обратной связи D-48 заменён пробным вариантом: источник постоянно видим, закрывающаяся photo/fade-поверхность возвращается и растворяется в одном320ms переходе. Пользователь положительно оценил открытие; его параметры и реализация не менялись.

- IAB/iPhone430×932:12 выборок большой карточки Acai и10 маленькой Chia. На всём пути contentOpacity1/transition0s; у Chia также kcalOpacity1/transition0s. Фото большой карточки1→0.355→0.097→0.030→0.005→удалено, при этом ширина430→398. После удаления слоя нет дополнительной фазы. Кадры середины и завершения просмотрены; время включает tool latency, не является FPS-замером.
- Большая карточка закрыта X: фокус вернулся View Acai, scroll0, inert снят по завершении. Chia: покупка1/$12.95, scroll блюда247.525, Escape с фокусом на Close вернул карточку/фокус и общий счётчик; каталог scroll359.406 (автопрокрутка к маленькой карточке перед её открытием). Повторное открытие достигло430×817/opacity1, правый mouse-drag закрыл блюдо. Физический touch не проверен.
- Из корзины открыта Aloe; Close вернул корзину и фокус View Aloe, содержимое рекомендации opacity1/transition0s. Console warn/error0. Поиск использует тот же ProductCard; отдельный поисковый browser-flow в этой итерации не повторялся.
- TypeScript/build/integrity29 passed;16/16 тестов: cart2/catalog5/dish5/search4. JS565.82kB/gzip171.00kB; прежнее предупреждение >500kB сохраняется. React review: удалены лишние state/context/props/callback, новых listeners/timers нет; общие количества, отмена flight, inert/focus и стабильные keys сохранены. Новые тесты для этой визуальной правки не добавлялись.
- Ограничения: после Add заменённая кнопка потеряла фокус, и Escape вне диалога не сработал; Escape с фокусом Close прошёл. Это существующий крайний случай управления фокусом, его поведение в D-52 не менялось. Auth/motion/runtime/sites suites, системный reduced motion, Pixel/screen reader не проверялись. Protected runtime/Figma/desktop/публикации не менялись. Закрытие впоследствии одобрено пользователем в запросе D-53.

[Кадры и откат](reference/dish-return-simplified/README.md), [аудит](reference/dish-return-simplified/browser-audit.json), [первый экран после возврата](reference/dish-return-simplified/final-preview.jpg).

## D-51 — корзина и раскрытие снизу, 12.10.2026

Источник: [Prana-App1294:3487](https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1294-3487), [обзор](reference/cart/figma-overview.png), [реестр high-fidelity узлов/адаптаций/SVG](reference/cart/figma-source.json). Motion context без keyframes; движение создано по запросу пользователя. Регулятор перенесён с desktop CartPage, данные общие с каталогом. На этапе D-51 Checkout/Edit оставлены неактивными; Checkout впоследствии подключён в D-53.

- Браузер IAB на iPhone430×932, уменьшенное окно: панель y114.992/height817.008, первая фотография x14.991/y183.974/100.991×100.991; регулятор143.999×43.998, кнопки40px; CTA x14.991/y816.018/399.013×53.992, footer211.001. Горизонтального overflow нет. Источник y110/56 адаптирован к runtime y115/62. Два новых SVG загружены в исходных размерах11.6667 и13.6×14.9333; иконки регулятора16px. Сумка побайтово совпадает с desktop.
- Chia+Acai+Avocado:3/$40.85; плюс Chia→4/$53.80, минус→3/$40.85, trash при единице. Прокрутка сворачивает53px шапки и проявляет адрес. Рекомендация Aloe открыла общий PDP, покупка дала4/$55.85; Escape закрыл только PDP и вернул фокус карточке. При покупке добавилась строка; точное сохранение scroll корзины при изменении состава не заявляется (наблюдалось282.178→258.416).
- Clear cart: отмена Escape сохраняет корзину, подтверждение показывает пустое состояние, скрывает CTA/нижнюю кнопку Cart, фокусирует заголовок. Удаление единственного блюда через Enter также даёт empty state. Add food to cart возвращает меню; при отсутствии Cart фокус получает Search.
- Close вернул каталог на прежний scroll529.703, фокус Cart:3/$40.85; inert сохранялся до конца exit, затем снялся. Проверены открытие Enter и закрытие **вертикальным mouse-drag вниз за шапку**; корзина закрылась, фокус/управление вернулись. Touch на устройстве не проверен.
- В12 замерах входа opacity панели1 и footer211 постоянны; трансформация плавно59.388→14.392→2.221→0.641→0.160→0. В10 замерах выхода слой уходит вниз, затем удаляется. Промежуточные/итоговые кадры просмотрены. Это инструментальные выборки, без FPS-замера.
- TypeScript/build/integrity29 passed.16/16 тестов: cart2, catalog5, dish5, search4. JS566.16kB/gzip171.10kB; сохраняется предупреждение >500kB. Console warn/error0. React review: общие количества, функциональные обновления, стабильные keys, переиспользованный ProductCard, inert exit-состояний, очистка scroll-listener, фокус после удаления/закрытия и защита Escape вложенного UI.
- Auth/motion/runtime/sites suites, физический touch/Pixel, системный reduced motion и screen reader в этой итерации не проверены. Protected runtime, Figma, desktop и публикации не менялись. Оценка пользователем впереди.

Свидетельства: [аудит](reference/cart/browser-audit.json), [вход](reference/cart/open-trace.json), [выход](reference/cart/close-trace.json), [первый экран](reference/cart/browser-initial.jpg), [прокрутка](reference/cart/browser-scrolled.jpg).

## D-50 — крестик поиска, начальная доступность и blur Up, 12.10.2026

Источник изменений — обратная связь пользователя. Поиск теперь виден от scroll0 даже с пустой корзиной. X сначала очищает любое непустое поле, включая пробелы, и возвращает фокус; X на пустом поле закрывает поиск. Это заменяет соответствующие правила D-49 ниже, остальные сценарии сохраняются.

- IAB mouse/keyboard: начальные Search opacity1/не inert и Up inert; `Avocado` → Clear search очищает строку и оставляет поиск/клавиатуру открытыми; следующий Close search закрывает и возвращает фокус кнопке. После Enter клавиатура скрыта, очистка повторно фокусирует поле и открывает её. Пробелы также очищаются первым нажатием. Закрытие восстановило scroll317.822; Back to top вернул0, Search остался видимым, поверхность Up opacity0/inert.
- Воспроизведён скачок blur при opacity предка0→1: до исправления вид поверхности менялся на последнем кадре. После исправления wrapper всегда opacity1; собственная поверхность с blur35px и отдельная стрелка плавно проявляются0→1. В12 замерах blur35px и opacity предка1 постоянны; поверхность0.016→0.767→0.946→0.990→1. Просмотрены промежуточный и конечный кадры. Это выборочные DOM/скриншот-замеры с задержкой инструмента, не FPS-профиль.
- TypeScript/build и integrity29 прошли; `npm run test:search`4/4. JS556.52kB/gzip169.07kB, прежнее предупреждение >500kB. Console warn/error0 в проверенной вкладке. Другие suites не запускались, новых тестов для локальной UI-правки нет. Runtime, данные и исходные SVG не менялись.
- Физический touch, системный reduced motion, Pixel и screen reader в этой итерации не проверены. Figma/desktop/публикации не менялись; результат ожидает оценки пользователя.

Свидетельства: [аудит](reference/catalog-search-refinement/browser-audit.json), [до](reference/catalog-search-refinement/before-trace.json), [после](reference/catalog-search-refinement/after-trace.json), [вход](reference/catalog-search-refinement/after-1.jpg), [конечный кадр](reference/catalog-search-refinement/after-6.jpg), [поиск наверху](reference/catalog-search-refinement/final-preview.jpg).

## D-49 — поиск и нижние контролы, 12.10.2026

Историческая проверка: scroll-only Search, немедленное закрытие X и анимация Up впоследствии заменены D-50 выше.

Источник: Prana-App `1240:667`, четыре состояния и отдельные high-fidelity контексты нижних контролов/заголовков. [Реестр и SVG](reference/catalog-search/figma-source.json), [общий снимок Figma](reference/catalog-search/figma-overview.png). Существующие шапка, смешанный каталог и реальные данные сохранены; не относящийся к запросу courier banner не добавляли. Cart navigation отложен прямым ответом пользователя; кнопка пока показывает сумму без перехода.

- Браузер IAB: после скролла показаны Up/Search/Cart; Back to top возвращает scrollTop0, Cart остаётся, Up/Search уходят. Переключение категории Healthy bowls сохраняет активное меню. Нижний padding150px очищает область контролов.
- Поле расширяется и получает фокус, нижняя граница держится примерно9.44px над клавиатурой. Enter закрывает клавиатуру. `Avocado` и `  AVOCADO  ` находят19 реальных товаров; пустая строка/пробелы возвращают обычный каталог. `asdasdasd` показывает сообщение и8 стабильных предложений. Переход к PDP при открытой клавиатуре скрывает её; обратный переход сохраняет запрос, количество и фокус.
- Добавление Chia+Avocado дало2 items/$24.90; закрытие поиска восстановило scroll600. На свежем запуске после категории X/Escape восстановил scroll2711.881; Back to top дал0 с Cart1/$11.95. Удаление последнего товара убрало Cart; повторный open/close работает. Проверены 4 оригинальных SVG: загружены, непустые, геометрия корневых размеров сохранена (браузерное округление до долей px). На свежем запуске console warn/error0.
- TypeScript/build и integrity29 прошли.14/14 тестов: catalog5, dish5, search4; новые тесты проверяют поиск/пустую выдачу/реальные предложения/общую сумму в центах. JS556.47kB/gzip169.06kB, сохраняется предупреждение >500kB. Auth/motion/runtime/sites suites в этой итерации не запускались. React review: общие данные, memo карточек, стабильные callbacks покупки/PDP, уникальные id в выдаче, inert уходящего слоя, cleanup scroll animation/listeners.
- Движение проверено визуально и по DOM, без записи FPS. Progressive blur Figma приблизительно реализован тремя масками; системный reduced motion, физический touch, Pixel и screen reader в этой итерации не проверены. Protected runtime, Figma, desktop и публикации не менялись. Пользовательская оценка реализации впереди.

Свидетельства: [аудит](reference/catalog-search/browser-audit.json), [после скролла](reference/catalog-search/browser-scrolled.jpg), [результаты](reference/catalog-search/browser-results.jpg), [пустая выдача](reference/catalog-search/browser-empty.jpg), [корзина наверху](reference/catalog-search/browser-top-cart.jpg).

## D-48 — плавный возврат содержимого карточки, 12.10.2026

Причина замеченного скачка: содержимое каталога уже было видимым под раскрытой фотографией и открывалось целиком при удалении перекрывающего слоя. Теперь для X/Escape оно скрывается под фото и проявляется за200ms после завершения его возврата; маленький kcal входит синхронно. Исходные элементы и состояние покупки сохраняются. Свайп не скрывает содержимое нижнего экрана.

- Браузер: большая Acai — opacity0 при collapse, затем0.416→0.928→0.989→1; маленькая Avocado — контент и kcal синхронно0→0.623→0.941→0.995→1, количество1 сохранено. Проверены выборочные кадры обоих размеров. Это DOM-замеры с задержкой инструмента, не измерение FPS.
- Правый mouse-drag: во время closing исходная карточка opacity1 без флага возврата; после завершения inert снят, фокус возвращён на View Avocado, количество1. Console warn/error0 в QA-вкладке.
- TypeScript/build, integrity29 и10 существующих тестов (catalog5/5, dish5/5) прошли. Новых тестов для визуальной правки нет; auth/motion/runtime/sites suites в этой итерации не запускались. Сохраняется предупреждение чанка549.91kB/gzip167.39kB. React review: стабильные callbacks/keys, memo карточек, общий счётчик и прежнее восстановление фокуса.
- Reduced-motion80ms проверен в коде; системный reduced motion и физический touch в этой итерации не проверены. Реализация ожидает просмотра пользователя. Runtime, Figma, desktop и публикации не менялись.

Свидетельства: [большая карточка](reference/dish-return/large-trace.json), [маленькая](reference/dish-return/small-trace.json), [аудит](reference/dish-return/final-audit.json), [превью](reference/dish-return/final-preview.jpg). Правила передачи: [MOTION.md](MOTION.md).

## D-47 — мерцание фейда при раскрытии, 12.10.2026

- Пользователь сообщил: фейд появляется, будто исчезает на мгновение и возвращается; итоговый вид корректный. В IAB воспроизведён скачок blur большой Avocado. [До, DOM](reference/dish-fade/before-trace.json): group opacity.405→.734→1, затем visibility переключается между двумя фото. Снимки [перед скачком](reference/dish-fade/before-1.jpg) / [после](reference/dish-fade/before-2.jpg) показывают резкое включение размытия.
- Исправление: одна постоянно видимая фотография с собственными градиентом и blur вне opacity-группы текста/контролов. Параметры source fade→detail fade меняются непрерывно с фото. Вторая hero image и переключение visibility удалены. Скролл и overscroll двигают эту же поверхность; close отключает синхронизацию и использует текущую геометрию.
- [После, DOM](reference/dish-fade/after-trace.json): во всех14 замерах одна фотография, visibility visible, opacity1; blur16.158→16.812→16.976→17px, конечная альфа.99009→.99779→.99971→1 без провала. Времена включают задержку UI-инструмента и не являются профилем FPS. [Кадр раскрытия](reference/dish-fade/after-0.jpg) / [конечный](reference/dish-fade/after-3.jpg) просмотрены. Маленькая Chia также даёт непрерывный выход прозрачного фейда к чёрному.
- Браузерная регрессия: вертикальный drag до scroll278.218 показывает About/КБЖУ, CTA bottom47.989; close из прокрутки, короткий/длинный правый drag проверены. TypeScript/build + integrity29 passed; test:dish5/5. Новые тесты для визуального исправления не добавлялись; прочие19 тестов и test:runtime/test:sites не перезапускались. Runtime/lock не менялись. Предупреждение размера JS-чанка549.65kB/gzip167.32kB сохраняется.
- Физический touch/Pixel/системный reduced motion не проверены. Результат ожидает визуальной оценки пользователя; Figma/desktop/публикации не менялись.
- Финальный чистый reload: [аудит](reference/dish-fade/final-audit.json), [экран](reference/dish-fade/final-preview.jpg); одна видимая фотография, opacity1, blur17px, fade317.994px, CTA bottom47.989, console warn/error0. Во время редактирования HMR один раз сообщил об изменении длины dependency-array эффекта; на чистом запуске сообщение отсутствует. Быстрый open→close также вернул каталог без зависания.

## D-46 — открытое блюдо, 12.10.2026

Прочитаны оба актуальных источника Prana-App:1294:1990 и1294:2579, контекст со screenshot и download_assets. [Реестр](reference/dish/figma-source.json), исходные [начальное](reference/dish/figma-initial.png) / [продолжение](reference/dish/figma-content.png). Original close12.8333×12.8333 и basket16×16 сохранены в `public/assets/dish/`. Фото/данные87 товаров прежние; Chia КБЖУ535/12/29/61 вместо placeholders. Только вес345g этого блюда — fixture Figma. Заголовок600 по предыдущему запросу, source700; это явная адаптация.

- [Браузерное начальное состояние](reference/dish/browser-initial.jpg), [под скроллом](reference/dish/browser-scrolled.jpg), [DOM и сценарии](reference/dish/browser-audit.json). Нормализовано к430×932: panel y114.992/817.008h; hero816.992h; fade317.994h; close44.988; CTA251.997×63.986, y820.024, bottom47.989. Nutrition398.007×68.998, y988.961. Заголовок600, описание rgba(255,255,255,.75). Геометрия соответствует источнику с округлением масштаба; вместо source47px выполнено явное пожелание48px.
- Проверены большая Chia и маленькая Avocado, раскрытие/close, закрытие после scroll278.218, быстрое open→close, Escape, Tab Close→Add→Close, восстановление opener. Каталог после закрытия Avocado сохранил scroll359.406 и количество1; общий Chia счётчик проверен до2 и обратно0. Кнопка покупки большой карточки кликается отдельно и не открывает PDP.
- Mouse gestures: короткий правый возвращается, левый не закрывает, длинный правый закрывает и сохраняет количество; вертикальный показывает About/КБЖУ, CTA остаётся bottom47.989. Следующий Add tap после короткого жеста проходит. Вертикальный drag, начатый во время spring-back, заканчивается без бокового остатка. Исправлены remount-зависание фото при обратном движении и прерывание возвратного spring; повторная проверка выполнена на чистом запуске.
- 24/24 Node tests: auth5/motion9/catalog5/dish5; `npm run build` включает TypeScript и integrity29 — passed. Финальный чанк548.74kB/gzip167.11kB даёт прежний warning>500kB, не ошибку. Console warn/error0. Защищённые runtime-файлы и lock не менялись. test:runtime/test:sites не запускались. По React checklist проверены cleanup/cancellation, стабильные ключи, общая quantity-state, отсутствие вложенных кнопок, inert/focus.
- Ограничения: mouse-drag в IAB не означает touch на устройстве; Pixel, системный reduced motion, полноценный screen reader не проверены. Reduced-motion ветка просмотрена. Новые экран и анимация ожидают визуальной оценки. Figma/desktop/публикации не менялись; корзина/checkout впереди.

## D-45 — отступы, типографика и фейд, 12.10.2026

Пользователь дал положительную общую оценку с пятью конкретными правками. Актуальный Figma1194:5225 повторно прочитан: Semibold и75% описания подтверждены; source-gap16px. Фейд в Figma по-прежнему229px; выбранные300px — настройка реализации для более длинных реальных текстов, а не утверждение о размере источника. [Сверка](reference/catalog-refinement/figma-check.json).

- Большой блок переведён на две колонки: текст+nutrition слева, purchase140px справа. Между колонками32px, между описанием и тегами16px. Кнопка/счётчик остаются снизу справа. Фото398×457 и маленькие189×189 сохранены.
- Названия обеих карточек font-weight600; большое описание rgba(255,255,255,.75), фейд300px с прежним конечным rgba(18,18,18,.8).
- Браузерные замеры всех29 больших карточек текущей раскладки: gap по вертикали15.995–15.998px, по горизонтали31.993px с учётом масштаба. Все87 названий600; содержимое ни одной большой карточки не вышло за верх фото. Add→1→0 сохраняет отступ32px и положение левого блока. [Данные](reference/catalog-refinement/browser-audit.json) · [экран](reference/catalog-refinement/browser-full.jpg).
- TypeScript/build и integrity29 passed; существующее предупреждение о чанке539.65kB осталось. Console warn/error0. Runtime-хеши не менялись, новых тестов для CSS нет, прежние19 модельных тестов не перезапускались. Figma/desktop/публикации не менялись. Физическое устройство и screen reader в этой правке не проверялись.
- Пять поверхностей: изменены только типографика, отступы и высота/цвет overlay; оригинальные фото/SVG, viewport, содержимое, цены, размеры и поведение покупки сохранены. Новый результат ожидает просмотра пользователя.

## D-44 — каталог после авторизации, 12.10.2026

Источник: [Prana-App1194:5225](https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1194-5225), контекст и screenshot прочитаны в этой итерации. Figma не менялся. Реализовано локально для оценки; одобрение D-43 относится к прежней анимации авторизации, а не к новому каталогу.

### Визуальная сверка

- [Источник430×1566](reference/catalog/figma-catalog.png), [сравнение первых932px](reference/catalog/comparison-home.png), [браузер с рамкой](reference/catalog/browser-home-full.jpg), [меню в середине](reference/catalog/browser-middle-full.jpg), [компактное окно](reference/catalog/browser-compact-full.jpg).
- [DOM-замеры и проверенные действия](reference/catalog/browser-audit.json). Нормализация масштаба даёт x16/y248/398×457 для большой карточки,189×189/y725 для маленького фото, заголовок y195. Отклонение измеренной позиции менее0.03px. Панель меню y115, category chips y131/h32; gutter20, card radius20, межсекционный отступ48.
- Найдено и исправлено: вертикальный исходный JPEG растягивал маленькое фото до252px; абсолютное заполнение внутри aspect-ratio1 восстановило189×189. Повторный DOM-замер подтвердил квадрат. Фото87 товаров побайтово совпадают с desktop-манифестом.
- Пять поверхностей: **геометрия** соответствует проверенным размерам; **типографика**24/29 medium, названия14/17 или16/19 bold, описания12/14; **цвет**#121212/#242424/#262626, source-muted#525252 и glass-теги; **ассеты**оригинальныеSVG с нативной геометрией и фото из веба; **контент**87 реальных позиций вместо Figma-примеров,14 категорий и24 помеченных временных описания. КБЖУ не дополнялось; null скрыт,0 сохранён.
- Адаптации: большая кнопка140px вместо114px в образце для настоящих цен; длинные названия переносятся целиком, описания ограничены3 строками в большой и2 в маленькой карточке. Адрес/AG — fixtures. Рамка/status/home indicator остаются штатными; вместо source9:41 отображается живой статус шаблона. SF Pro local-only и JPEG-сжатие браузерного screenshot ограничивают попиксельную оценку сглаживания. Полный снимок имеет1089×1228, вырезка430×932 без масштабирования.

### Проверенное поведение

- Phone → Code:5330 оставляет ошибку,1111 открывает каталог; клавиатура скрыта, старые сцены inert, активен один каталог, Back отсутствует. Выборочный промежуточный DOM показывал уходящую форму с opacity0.33/x−13.78, входящий каталог0.0575/x20.89 и завершающееся закрытие клавиатуры. В финале idle, keyboard top932. Skip также открывает каталог. Это выборочные кадры/состояния, не FPS-профиль или видеозапись.
- Большая карточка: Add →1→2→3, сумма$47.85 при цене$15.95; обратный путь3→2→1→0 возвращает Add. Маленькая карточка независимо1→2→1→0. Enter работает; при удалении последней единицы фокус переходит к Add с focus-visible. Порядок и размеры карточек при покупке не меняются.
- Выбор Healthy bowls/Main dishes останавливается с заголовком на y195. Фейды: начало0/127, середина127/127, конец127/0. Горизонтальное перетаскивание меняет rail1093→757; вертикальный drag23809→24310 не добавил товар. Ручная прокрутка вверх из Broths & soups выделяет Healthy bowls. Hover-правил в app CSS нет; применяется прежний pressed.
- Компактная проверка: запрос viewport640×900, фактический DOM viewport634×891; экран342.33×741.97, scale0.7961. Горизонтального overflow нет, scrollLeft оболочки0. Временный override после проверки снят.
- Console warn/error в проверочной вкладке:0. Все87 фото после перемещения по каталогу загружены. Первая фотография предзагружается во время авторизации; товары остаются локальным снимком, без внешнего API.
- `node --test tests/auth.test.mjs tests/motion.test.mjs tests/catalog.test.mjs`:19/19 (5+9+5). TypeScript и финальный `npm run build` прошли; integrity29 прошёл. Только два нужных runtime-хеша обновлены после проверки модели reset. Build выдал предупреждение о едином JS-чанке539.65kB / gzip164.21kB; ошибка сборки отсутствует. `test:runtime` и `test:sites` в D-44 не запускались; упаковка не менялась, её прежние4 теста относятся к D-40.
- React Best Practices: функциональное обновление количеств, стабильная раскладка через lazy state, memo карточек со стабильным callback, очистка observers/listeners/animations, семантические кнопки/aria-label/output и inert уходящего слоя. Новые зависимости не добавлялись.

Физический iPhone/touch/edge-swipe, системный reduced motion, полноценный screen reader и Pixel не проверялись. Reduced motion проверен в модели authStep и просмотрен в новой логике покупки/scroll. Отдельные страницы корзины/PDP/checkout, редактирование адреса/профиля, backend и публикация не входят в текущий результат. Реализация готова к пользовательской оценке.

## D-43 — удаление hover и одобрение motion, 12.10.2026

- Удалены шесть hover-правил: Back, основные CTA, Apple/Google, юридические ссылки, Skip и Resend. Pointer-отклик — только pressed (opacity0.78/70ms, возврат150ms), в том числе в BottomSheet. Focus-visible сохранён для клавиатуры компьютера. оринятые переходы не менялись.
- В браузере указатель наведён на Continue with Phone: `:hover=true`, фон остаётся rgb(255,255,255), текст rgb(0,0,0), opacity1; значения совпадают с исходным состоянием. [Замер](reference/hover-removed.json). В app CSS не осталось `:hover`; hover внешнего переключателя устройства относится к оболочке превью.
- Build/TypeScript и integrity29 прошли. аовые тесты для удаления CSS не создавались, auth/motion-наборы не перезапускались: логика не менялась, предыдущие13 тестов относятся к D-42. Figma не перечитывался и не редактировался: выполнена прямая поправка пользователя, без переноса новых макетов. Desktop и публикации не менялись.
- оользователь явно одобрил анимацию и попросил постепенно переиспользовать её принципы в аналогичных переходах. Это решение сохранено в AGENTS/MOTION; на этапе D-43 следующий сценарий ещё не был выбран; позднее реализован каталог D-44.

## D-42 — первая реализация motion, 12.10.2026

оользователь разрешил реализовать предложение для оценки вживую; визуальное утверждение не получено. оовторно прочитаны актуальные Figma Sign in1028:27419 и Phone1028:27649 с их скриншотами. Конечный дизайн и исходные ассеты сохранены; меняется движение.

- Исправлен скачок общей области top0→122px: теперь top0 постоянен, отступ каждой формы локальный. Surface y62/radius34 неподвижна; CTA y552 с первого появления, без подъёма из y819.
- 24px/140ms уход; вход с80ms за240ms; фокус на180ms и keyboard260ms. Масштабирования и blur нет. ори Phone↔Code клавиатура уже открыта, фокус передаётся сразу.
- Устранена обнаруженная в окне1280×720 браузерная прокрутка самой оболочки при keyboard entrance. `.device-screen` использует `overflow: clip`; штатный MobileScroll остаётся. оовторные8 снимков/DOM-проб: scrollTop0, scene y0, CTA y552 (погрешность нормализации масштаба менее0.001px). [Данные](reference/motion-implemented/frames.json), [промежуточный кадр](reference/motion-implemented/frame-0.jpg), [конечный](reference/motion-implemented/frame-7.jpg).
- орямой/обратный путь и сохранение телефона проверены. Phone→Code и Code→Phone: keyboard visible=true, transform=none, фокус целевого поля. Быстрый Back после примерно281ms оставляет Sign in без клавиатуры; один активный маршрут. оовторные команды, Back до180ms, старый callback после отмены и unmount покрыты модельными тестами.
- Escape закрывает клавиатуру, повторный фокус открывает; код5330 даёт ошибку,1111 открывает подтверждение. Обычная проверка геометрии в исходной вкладке1062×1290 также дала430×932, поле y293, CTA y552, keyboard y631. аовая проверочная вкладка использовала1280×720 и масштаб0.6346.
- 8/8 motion +5/5 auth, TypeScript/build и integrity29 — passed. Console после финальной чистой перезагрузки без warn/error. Desktop не менялся, публикации нет.

Это выборочные кадры с задержкой инструмента click, а не полное видео/FPS-профиль. ороверка reduced motion выполнена на модели (нулевой сдвиг, фокус0ms, fade80ms) и просмотром CSS/KeyboardDock; системная настройка в браузере не эмулировалась. Физический touch/edge-swipe, Pixel и нативный iPhone остаются непроверенными. [Спецификация и источники](MOTION.md).

## D-40 — историческая сверка конечных экранов

Следующие результаты относятся к первоначальной статической/функциональной реализации. Они не означают принятия пользователем её анимации; motion позднее переработан в D-42 выше.

### Область сравнения

Исходники `reference/figma-{splash,sign-in,phone,code-empty,code-filled,code-error}.png`: каждый 430×932. Реализация `reference/browser-*.png`: каждый экран обрезан до тех же 430×932 из снимка браузера 1100×1240. DOM подтвердил размер экрана 430×932 и scale=1. Использован заданный пользователем размер, заменяющий исходные 393×852 шаблона. Экран на снимке начинается x335/y154 (DOM 334.984/153.984, округление менее 0.02px); полные снимки сохранены как `browser-*-full.png`.

API браузера отдаёт снимки с JPEG-сжатием даже при имени .png. Итоговые вырезки нормализованы Pillow в PNG без масштабирования; резкость такого свидетельства ниже исходного Figma PNG. Это ограничивает попиксельные выводы о сглаживании шрифта. Рамка, камера, живое время и Home Indicator — системная оболочка шаблона, а не содержимое макета.

оолные совместные сравнения (Figma слева, браузер справа):

- [Splash](reference/comparison-splash.png), [Sign in](reference/comparison-sign-in.png).
- [Phone](reference/comparison-phone.png), [пустой код](reference/comparison-code-empty.png), [заполненный код](reference/comparison-code-filled.png), [ошибка](reference/comparison-code-error.png).
- Детали: [типографика и кнопки](reference/comparison-type-detail.png), [поле кода](reference/comparison-code-detail.png), [клавиатура](reference/comparison-keyboard-detail.png).

## Findings и исправления

1. **[P2, исправлено] Обрезались нижние части smiley/microphone.** оервоначальное скрытие нижних 34px PNG вместе с исходным Home Indicator задевало значки. В `.keyboard-asset` оставлено скрытие только 17px. оовторный снимок `comparison-keyboard-detail.png` показывает оба значка целиком и одну нижнюю полоску. Также устранён тонкий стык фоновых поверхностей у фиксированного хедера перекрытием на 1px.
2. **Исправление поведения до финальной QA:** ограничение длины нативного input могло обрезать форматированный номер или код до нормализации. Удалены HTML maxLength, границы остаются в `normalizePhone` / `normalizeCode`. ороверены `+1 (202) 555-0100` и `1 1-1 1`.
3. **[P3, ограничение окружения] Шрифт зависит от системы.** Локальный SF Pro с fallback сохранён по практике проекта; гарантия одинакового начертания на чужих компьютерах требует отдельно решённого webfont. В текущем сравнении размеры, переносы и иерархия сохранены. ае делаем вывод о пиксельной идентичности сглаживания по сжатому снимку.

оосле повторной визуальной сверки открытых P0/P1/P2 не осталось в объёме авторизации для desktop browser preview.

## оять поверхностей сверки

| ооверхность | Результат |
| --- | --- |
| Шрифт | 24/29 заголовки, 14/17 описания, 16/19 кнопки, 20/24 ввод; переносы и центрирование соответствуют. Локальный SF Pro / fallback и сжатие снимка ограничивают оценку сглаживания |
| Геометрия | Верх панели y62, radius34; поле телефона x61.5/y293, 307×70; четыре слота 62×70; CTA y552, 307×54; клавиатура y631, 430×301. ооловина пикселя по x — центрирование нечётной ширины307 на холсте430 |
| Цвет | #121212 основная поверхность, #313030 поля, #9f9f9f вторичный текст, #737373 подсказки, #d82727 ошибка, белые CTA. Три градиента изображения повторяют Figma |
| Изображения | Исходная фотография пакета, логотип и SVG-иконки сохранены; размеры SVG берутся из корней файлов. Клавиатура — запрошенный пользователем статичный исходник; скриншоты полных экранов не используются вместо вёрстки |
| Текст | Telegram заменён на SMS по заданию. Исправлены опечатки Phone; русское описание только в Figma error-state приведено к английскому языку остальных экранов. Отсчёт динамический, поэтому на снимке может отличаться от статичных 12 секунд. Resend показывается и после ошибки, когда истечёт отсчёт |

Focus-обводка активного поля добавлена для управления с компьютера. Успех, неполный код, ошибка номера, пояснения для внешнего входа и документов — дополнительные функциональные состояния, не отдельные утверждённые Figma-макеты. Экран `Plan your whole week` не включён.

## Фактические проверки

- In-app browser: Splash → Sign in → Phone → Code; пустой номер не пропускается, форматированная вставка очищается; номер сохраняется при Back и сбрасывается после reload.
- оустой/неверный код, красная ошибка 5330, исправление выбранного кода физической клавиатурой, `1111` и форматированная вставка `1 1-1 1` → подтверждение. [Успех](reference/browser-success.png).
- Resend становится доступен по истечении 12 секунд, очищает поле и перезапускает отсчёт. аа время ожидания повторной кнопки нет.
- Фокус открывает клавиатуру; Escape, blur, переход и панель закрывают. оеретягивание вниз мышью проверено. Кнопка следует за клавиатурой. Tab переводит фокус на Resend с видимой обводкой 2px; Enter отправляет форму.
- Apple, Google, Skip, Public Offer и Privacy Policy показывают корректные пояснения; панели закрываются кнопкой/через Escape. аи один такой переход не запускает внешнюю авторизацию.
- Окно 640×900: весь iPhone масштабируется до экрана ~345.98×749.90, нет горизонтального overflow, поле, CTA и клавиатура видны. [Снимок](reference/browser-compact-full.png).
- Оригинальные ассеты загружены. В консоли после восстановления сервера (с 14:24 UTC) новых warn/error нет; старые сообщения о разрыве Vite websocket при отключении питания не относятся к текущему запуску.
- `npm ci`, TypeScript, `npm run build` — passed; `check:runtime` — 28 защищённых файлов; `test:auth` — 5/5; `test:sites` — 4/4. Финальный build повторён после правки focus-CSS: passed, упаковка создана. оубликация не выполнялась.

## Границы проверки

Физический iPhone, touch pointer / edge-swipe, системная клавиатура настоящего мобильного браузера, Pixel, разные ОС/шрифты, полноценный screen reader и переключение системного reduced motion в браузере не проверялись. В коде есть MotionConfig reducedMotion=user, reduced-motion CSS и отдельная поддержка у KeyboardDock; это не заменяет проверку на целевом устройстве. Playwright-набор шаблона `test:runtime` не запускался; интерактивные проверки выполнялись через разрешённый браузерный инструмент. Desktop не менялся, его исторические тесты не пересчитаны в этой итерации.

## Implementation checklist

- [x] оеренести целевые состояния и оригинальные ассеты.
- [x] ороверить 430×932 / клавиатуру301, ошибки и успешный `1111`.
- [x] Исправить обнаруженную обрезку и выполнить повторное совместное сравнение.
- [x] Выполнить build, integrity и уместные тесты.
- [ ] оолучить визуальную оценку пользователя; отдельно выбрать следующий мобильный сценарий.

final result: passed
