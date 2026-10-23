# Prana mobile — визуальная и функциональная проверка

**D-78 опубликован 23.10.2026 (Europe/Moscow).** По явному запросу пользователя выпущен вариант с двумя подполями: флаг → редактируемый код → шеврон → национальный номер. [Mobile на Vercel](https://prana-mobile-01.vercel.app) · [исходники GitHub](https://github.com/Chosencorrectly/Prana/tree/main/Mobile). Commit исходников: `2c310e7f880d850d08cb4864fde1b0390d774662`; deployment: `dpl_EpM3QfFUxGYqFHhsWXgAUUC16end`, production READY. Все 88 тестов и локальная сборка прошли; облачная сборка за 11 секунд восстановила 212 assets из прежнего pin и проверила runtime29. Публичные JS/CSS побайтно совпали с локальными. В браузере проверены два подполя, очистка/набор кода +62 с автофлагом, сохранение национальных цифр и демовход +1/1111111111 → SMS1111 → Menu; console errors/warnings: 0. Web не изменён. Ограничение «только локально» снято для этого выпуска; более ранние статусы ниже исторические. Реальные SMS/API и проверка физических устройств не заявляются.

## D-78 — два подполя телефона, 23.10.2026

Phone/auth/motion31/31, build/TypeScript/runtime29 passed. IAB: автофокус номера, смена фокуса на код, очистка кода без потери цифр, +6→+62, международная вставка в код и номер, CA из списка, +81/disabled→+971/enabled. Pixel: поля/маска/CTA и SMS1111→Menu. Ошибок/предупреждений console нет. Основная вкладка пользователя показывала прежний фиксированный код: после reload и открытия Enter Phone подтверждены отдельные textbox Country calling code и Phone number. [QA/ограничения](reference/phone-input/d78.md), [основная вкладка](reference/phone-input/d78-user-tab.jpg). Только локально.

## D-77 — редактируемый код страны, 23.10.2026

Локально: 88/88 модельных тестов (17 phone), TypeScript/build и integrity29 прошли. В IAB проверены автофокус/клавиатура, +1 и 10 единиц, переполнение, полная очистка и Backspace кода/плюса, частичный +6 → +62, замена кода выделением, международная вставка, Canada из списка, Backspace у разделителя, неизвестный +81 и известный +971. Pixel: набор/маска/CTA и полный демовход1111 → Menu. Консоль без ошибок/предупреждений на момент проверки. [Протокол](reference/phone-input/d77.md), [автофлаг](reference/phone-input/d77-editable-code.jpg), [default](reference/phone-input/d77-default.jpg), [Pixel](reference/phone-input/d77-pixel.jpg). Пользовательская оценка впереди; публикаций нет, физические устройства/реальные SMS не проверялись.

**D-76 опубликован 22.10.2026.** Накопленные изменения Mobile D-61…D-76 доступны на [Vercel](https://prana-mobile-01.vercel.app) и в [GitHub](https://github.com/Chosencorrectly/Prana/tree/main/Mobile). Commit сборки: `cc6cb734e7328b8aecf9df1974102d2bd823bfa8`; commit assets: `baa168f2a4a8dabec6f06c92fda7f46c1ddcadc0`; deployment: `dpl_BwKs7bpUQ47ggGm4R1jETFDBvMep`, READY. Облачная сборка за 9 секунд проверила и восстановила 212 из 212 assets (142397354 байта); проверка 29 файлов runtime прошла. Локально прошли сборка и 82 из 82 тестов. Публичные JS/CSS побайтно совпали с локальной сборкой. В браузере проверены вход с 1111111111 и демокодом 1111, профиль, корзина, интервалы доставки, Milk → Apply, Apple Pay и зазор до Total 48px. Ошибок в консоли и незагруженных изображений нет. Код Web/prototype не изменён, публичный Web отвечает HTTP 200. Реальные платежи/SMS/API и полная визуальная приёмка не заявляются.

Исторические пометки «локально/не опубликовано» ниже отражают дату соответствующего этапа; текущая публикация — D-78.

## D-76 — полировка checkout,22.10.2026

Build/TypeScript/runtime29 и82/82 node-теста passed. iPhone/Pixel: финальный зазор48px (DOM48.17/48.05 с округлением масштабированной оболочки), совпадение суммы сCart28/28/600 иfont-family, целая рамка интервала и radio50%/translate. Возврат/закрытие и переключение Card→Google проверены. [Кадры/протокол](reference/checkout-polish/README.md). Реальные устройства и системный Reduce Motion повторно не проверялись.

## D-75 — состав checkout и новые состояния, 22.10.2026

82/82 node-теста, build/TypeScript/integrity29 passed. В IAB: multiple allergies/Apply/Back, Custom validation, процент после скидки/изменение количества, Card/discard/bank/save, radio стрелками, SMS1111, полный заказ с одинаковым итогом$33.02, сохранение при reopen, empty/disabledPay. Pixel: Gluten/scroll, клавиатура/CTA, Escape keyboard→Back. Final console errors0/broken images0, button600/dock ancestors opacity1. [Полный протокол и явно непроверенные сценарии](reference/checkout-refresh/README.md), [JSON](reference/checkout-refresh/browser-audit.json). Physical devices/provider sheets/system Reduce Motion не проверены; offline/card-error/no-card новый визуальный прогон не выполнен. Только локально, без публикаций.

## D-74 — ввод телефона с ведущей1,22.10.2026

До исправления воспроизведено:10единиц не включают SMS; при дальнейшем наборе каждая11-я цифра вызывает удаление первой1. Причина — эвристика национального префикса в readPhoneInput и повторная интерпретация1 в AsYouType. Обычный набор теперь не изменяет цифры; дляUS/CA полнота равна10цифрам, явный+1 при вставке отделяется один раз. Браузер: каретка после3/6/10цифр —4/8/12;10единиц включают кнопку,13цифр сохраняются с выключенной кнопкой,3Backspace восстанавливают доступность. Проверены замена выделения, вставка/удаление в середине, Delete/Backspace рядом с пробелом, очистка, международная вставка, Канада, SMS1111→каталог.27тестов/build/TypeScript/integrity29passed, consoleerrors0. [Аудит](reference/phone-input/d74-audit.json), [кадр](reference/phone-input/d74-fixed.png). Physical touch не проверялся; публикаций нет.

## D-73 — профиль и настройки,22.10.2026

Локальный перенос актуальной1443:4821:59фреймов/55уникальных демосценариев. Открыты все55состояний, broken images0; это маршрутная/контентная проверка, не визуальная приёмка каждого перехода. Пройдены guest→existing auth, личные данные/валидация/save/retry/discard, birthday, phone/SMS1111 и ошибка, card verify/bank/save/edit/default/remove, адрес search/details/save/remove/outside zone, notifications/permission/retry, documents retry, logout/cancel/guest. Повтор в основной корзине корректно объединилAcai1 сAcai1+Buddha1:3items/$50.85; после профильного SMS checkout показалOrder, локальный заказ появился вMy orders. Изолированный preview сохранил исходную корзину. Главная/форма/клавиатура проверены также наPixel10.

72/72node-теста passed (7новых), npm run build/TypeScript/runtime29passed. Bundle warning846kB остаётся. Исправлены Escape/Radix, лишний возврат при Discard адреса, HMR-контексты и сохранение исходящих подписей удаления. Финальный запуск отдельно от исторических HMR-ошибок. Физический touch, системный Reduce Motion, Dynamic Type/screen reader и browser runtime suite не проверены. [Полный протокол](reference/profile/README.md), [итоговый экран](reference/profile/final-profile.png), [coverage](reference/profile/coverage.json), [verification](reference/profile/verification.json). Нет реальных API/SMS/банка/push, юридические тексты временные. Ожидает оценки, публикаций нет.

## D-72 — контраст итогов, 19.10.2026

IAB/iPhone: computed Items/сумма rgb(255,255,255), итоговые нутриенты rgb(189,189,189), opacity1. Ранее нутриенты получали#555555 от общего p; теперь app-owned селектор задаёт цвет явно. Количество9/$152.55 сохранено, геометрия/motion не менялись. [Кадр](reference/cart-refresh/footer-contrast-detail.png), [замер](reference/cart-refresh/footer-contrast-audit.json). Build/TypeScript/runtime29 passed, прежний warning>500kB; модельные тесты/Pixel/остальные сценарии повторно не запускались для изменения цвета. Пользователь положительно оценил остальную корзину; публикаций нет.

## D-71 — новая корзина и состояния, 19.10.2026

Актуальная секция1294:3487,10 экранов прочитаны с design context/screenshots; главный1409:7495. IAB/iPhone430×932: panel y62,toolbar61,photo96,CTA390×52/600,header icons20 внутри44,quantity40; BottomFade4/12/34,footer opacity1. Проверены ready/loading2,4с/retry900ms/empty, stock2/минус/быстрые плюсы, offline без изменения/checkout, quantity error с сохранением и успешным повтором, no-recs/photo fallback. Real fixture3 строки/4 порции/$63.80/2350kcal/62pr/104fa/310ca, неизвестное в итоге — прочерк.

Clear Keep/Tab/Escape/фокус и подтверждение→empty→Browse прошли. Preview не изменяет основную корзину:6/$83.75 сохранены после очистки демо; Checkout получает тот же subtotal, Back возвращает CTA focus. Добавления из поиска/рекомендаций общие, PDP закрывается прежним motion, source content opacity1; возврат фото Coco в пределах0,2px от положения после открытия. Pixel427×952: overflow0,footer над safe bottom48. ОригинальныеSVG20/14/12/24 и bag148 загружены; все87фото сохранены.

Финальные29/29 cart/catalog/checkout/dish/motion tests и build/TypeScript/runtime29 passed. JS780.32kB/gzip224.01kB, прежний warning>500kB. После старта Vite12:27UTC новых console errors/warnings не было; две ошибки websocket до старта сервера12:26:52UTC отделены в журнале. React review: cleanup timers/listeners/observer, lazy preview state, stable keys, focus/inert и общий state. [Источники, кадры, выводы команд, точные ограничения и выжимка](reference/cart-refresh/README.md).

Native touch/screen reader/Dynamic Type/OS reduced motion/FPS/другие ОС не проверялись; весь checkout phone/address/order заново не проходился. API/сохранение/stock отсутствуют, offline-правило временное. Это разрешённая реализация на визуальную оценку, без публикации. D-70 полностью не переносился.

## D-68 — Close слева, Clear cart справа, 16.10.2026

IAB/iPhone: DOM и визуальный порядок Close→Clear, кнопки44px/600, x399 и702. Clear открывает подтверждение, Keep dishes сохраняет2/$28.90; Close возвращает Menu и фокус Cart, повторный вход работает. Build/TypeScript/runtime29 passed; прежний warning>500kB. Модельные тесты не повторялись для перестановки; native touch/Pixel/empty/компактная шапка не перепроверялись. [Кадр/аудит](reference/cart-toolbar-swap/README.md). Локально, оценка впереди; D-55 заменён только в расположении действий.

## D-67 — фейд большой карточки, 16.10.2026

Updated Figma1194:5225/1291:970/1292:1017:303px градиент с80% затемнения на48.472%; адаптация stop50%. IAB/iPhone: Acai до/после наscroll0, длинный Prana oats на светлом фото, малая Chia. Computed302.986px/50%; вход до100%, возврат до50%, source content opacity1/transition0s. Overlay удаляется, фокус View Acai иscroll0 восстановлены. [Кадры и замеры](reference/large-card-fade/README.md). TypeScript/build/runtime29 passed,10/10 catalog/dish tests, console0; прежний warning>500kB. Новые тесты не добавлялись; покупка/checkout/native touch/Pixel/system reduced motion/FPS не перепроверялись. Runtime/Web/публикации не менялись; визуальная оценка впереди.

## D-66 — Semibold и корзина2px, 16.10.2026

Computed weight всех проверенных кнопок Sign in/каталога/Cart/Checkout —600; у PDP надпись и цена600/16px, высота64, ширина216px. Описание/теги500 сохранены. Новый SVG из1359:5944 загружен по отдельному URL, native/render20×20; оригинальный экспорт с авторской2px обводкой не редактировался. Add→close даёт Cart1/$12.95, повторный вход сохраняет Add. [Кадр/исходник/аудит](reference/dish-button-refinement/README.md). Build/TypeScript/runtime29 passed, console0, прежний JS>500kB warning. Тесты модели не повторялись для CSS/font-face/asset. Native touch/Pixel/system reduced motion/отрисовка шрифта на других ОС не проверены. Локально, оценка впереди; публикаций нет.

## D-65 — подробная карточка и Add→close, 16.10.2026

Сверены обновлённый1294:1990 и старый длинный1294:2579; первый взят актуальным. В браузере430×932: panel817, info321×123/y558, description321×38, теги32px/y649/#26262685%/blur6, CTA213.34×64/y705 с реальной ценой$12.95, иконка20×20. Gap24px, снизу48px. Fade307px; длинный текст расширяет его до374px. Все3 изображения загружены. Реальные КБЖУ Chia535/12/29/61 сохранены. [Экран/источники](reference/dish-refresh/README.md), [аудит](reference/dish-refresh/browser-audit.json).

Пройдены Add из small/large, source opacity1 во время collapse; первое добавление1, повторный вход+doubleclick только ещё1; Enter из поиска ещё1, запрос/фокус/scroll сохраняются. В Cart видны3 порции Chia. Рекомендации Aloe/Coco добавляются в ту же корзину; неполные КБЖУ показывают только известные значения. Первоначальный сдвиг фото рекомендации на150px исправлен: before/during/after518.77/518.64/519.26, итоговое отклонение<0.5px. Длинный текст помещается, Close не добавляет. Старый случай потери фокуса при замене Add на счётчик снят новой механикой; возврат фокуса после Enter подтверждён.

21/21 тест (dish5/catalog5/cart2/motion9); build/TypeScript/runtime29 passed, build повторён после scroll anchoring. Console error/warn0. React review: переиспользование QuantityControl, guard повторного клика, ключи, focus/inert, cleanup ResizeObserver. Прежний warning JS>500kB остаётся. Native touch, screen reader, системный reduced motion и полный Pixel не проверялись. Локально на оценку; публикаций нет. Basket-add.svg включить в будущий asset manifest.

## D-64 — маска номера и отступы, 15.10.2026

Для US/CA проверен последовательный набор305→555→0123: каретка4/8/12, SMS disabled/disabled/enabled. Backspace после второго пробела удаляет цифру (каретка6), повторный ввод восстанавливает группу. Delete у первого разделителя удаляет следующую цифру и выключает CTA; вставка возвращает каретку5 и активную CTA. Вставка `+1 (305) 555-0123` отображается как отдельный+1 и `305 555 0123`. Значения tel скрыты в DOM-инспекции; точный текст проверен на screenshot и модельными тестами.

Поле307×72 сохранено; левый inset флага19.99px с учётом масштаба, правый padding20px, scrollLeft0. [Полный экран](reference/phone-input/browser-mask-full.png), [деталь](reference/phone-input/browser-mask-detail.png), [неполный номер](reference/phone-input/browser-mask-partial.png), [аудит](reference/phone-input/mask-audit.json). Console error/warn0;13/13 тестов phone8/auth5, build/TypeScript/integrity29 passed. Сохраняется прежний warning JS>500kB. Другие страны используют прежнее национальное форматирование; сверхдлинная вставка не обрезается и не включает SMS. Нативная клавиатура/touch и системный reduced motion отдельно не проверялись. Локально, визуальная оценка впереди, публикаций нет.

## D-63 — зависание курсора над странами, 15.10.2026

Баг воспроизведён: перевод указателя с trigger внутрь списка и wheel меняли scroll до252.48, но transform круглого курсора оставался translate3d(111.997px,329.385px,0). Причина — stopPropagation на pointermove/up/cancel в app-owned wrapper. Удалена блокировка этих трёх событий; pointerdown оставлен для изоляции родительского scroll.

После исправления центр курсора совпал с двумя целевыми точками страницы:650.002/595.003 и700.002/660.004. Wheel и drag работают, outerScroll0, выбранные US не меняются после свайпа, cursorPressed=false после отпускания, keyboard=true. Затем явный выбор Singapore закрыл список и вернул фокус в номер с открытой клавиатурой. [Аудит](reference/phone-input/cursor-audit.json), [позиция1](reference/phone-input/browser-cursor-first.png), [позиция2](reference/phone-input/browser-cursor-second.png).

Build/TypeScript/integrity29 прошли; прежнее предупреждение JS>500kB. Модельные тесты не повторялись: исправление событий проверено непосредственно в браузере. Physical touch/system reduced motion отдельно не запускались. Runtime не изменён, GitHub/Vercel не публиковались.

## D-62 — автофокус и активный фон телефона, 15.10.2026

Локальный IAB, reload→Continue with Phone без дополнительного тапа по полю: document.activeElement=phone-input, keyboardVisible=true, белая каретка; существующий автофокус подтверждён, код навигации не менялся. Добавленная подсветка даёт rgb(59,58,58), переход background-color0.18s. После Escape: фокус снят, keyboardVisible=false, фонrgb(49,48,48). При открытом выборе страны каретка скрыта и фон обычный; после закрытия фокус/светлый фон возвращаются. [Активное поле](reference/phone-input/browser-focus-active.png), [без фокуса](reference/phone-input/browser-focus-inactive.png), [аудит](reference/phone-input/focus-audit.json).

Build/TypeScript/integrity29 прошли; JS>500kB — прежнее предупреждение. Для CSS-правки новые модельные тесты не добавлялись, предыдущие20 не перезапускались. Проверка касается браузерной оболочки с визуальной клавиатурой; реальная мобильная клавиатура и системный reduced motion отдельно не проверялись. Внешних публикаций нет, оценка оттенка пользователем впереди.

## D-61 — телефон и выбор страны, 15.10.2026

Повторно просмотрены обновлённая секция1354:4362 и состояния empty/list/scrolled/partial/filled, включая1355:4375. В локальном IAB: поле307×72 при x61.49/y292.98, список307×171/y368.97 (scrollHeight560), CTA307×54/y552.02, клавиатура301/y631.01. Сверены фон#313030, disabled#3d3d3d и полный номер с белой CTA. [Источники и кадры](reference/phone-input/README.md).

Пройдены: US/+1 после reload; пустой/частичный/полный ввод и обратное выключение CTA при удалении; вставка +1 и +62 из буфера; неподдержанный+81 оставляет прежний номер и блокирует CTA с подсказкой; редактирование возле пробела; Canada/+1 без потери цифр; drag списка без случайного выбора и с outerScroll0; Indonesia/Bali, End→Singapore; Escape закрывает список при открытой клавиатуре; Phone→SMS→Back сохраняет страну/номер; SMS1111→Menu. Console error/warn0. Сборка/TypeScript/integrity29 и20 тестов phone6/auth5/motion9 прошли. Тест первоначально предполагал, что Singapore не принимает10 цифр; метаданные библиотеки допускают такую длину, сценарий исправлен на France9 вместо изменения реальных metadata.

React Best Practices: проверены cleanup scroll/ResizeObserver/outside listener, стабильные ключи, семантические disabled/combobox/listbox, keyboard handlers и граница runtime. Системный reduced motion, screen reader, native touch/keyboard и полный Pixel-аудит отдельно не запускались. Прежнее предупреждение JS>500kB сохраняется. Это локальная реализация на оценку пользователя; GitHub/Vercel не менялись. Новые assets должны войти в manifest при публикации в конце сессии.

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
