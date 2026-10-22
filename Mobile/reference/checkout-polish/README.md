# D-76 — полировка checkout

22.10.2026, Europe/Moscow.

- Support→Total:48px в конце прокрутки; резерв181px=105px bottom+28px строки+48px.
- Сумма: тот же Prana Cart,28px/28px,600,#FFF, что и корзина.
- Carousel времени:2px сверху/снизу, border-box у обводки; горизонтальная механика не менялась.
- Radio: центр50%/50% иtranslate(-50%,-50%), внешние24px/внутренние12px.

Проверены iPhone иPixel: зазор48.17/48.05px после учёта масштаба (округление браузера), выбор интервала, Card→Google, Back/Close. [iPhone](iphone.png), [время](time.png), [Pixel](pixel.png). Build/TypeScript/runtime29 и82/82node-теста прошли. Вызов npm test сначала показал отсутствие общего скрипта; использована фактическая команда node --test tests/*.test.mjs. Build сохраняет прежнее предупреждение о bundle>500kB. Physical-device/system Reduce Motion/screenreader повторно не проверялись.

Пользователь явно запросил GitHub/Vercel выпуск; статус и commit/deployment будут добавлены после проверки.
