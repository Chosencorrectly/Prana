# D-76 — полировка checkout

22.10.2026, Europe/Moscow.

- Support→Total:48px в конце прокрутки; резерв181px=105px bottom+28px строки+48px.
- Сумма: тот же Prana Cart,28px/28px,600,#FFF, что и корзина.
- Carousel времени:2px сверху/снизу, border-box у обводки; горизонтальная механика не менялась.
- Radio: центр50%/50% иtranslate(-50%,-50%), внешние24px/внутренние12px.

Проверены iPhone иPixel: зазор48.17/48.05px после учёта масштаба (округление браузера), выбор интервала, Card→Google, Back/Close. [iPhone](iphone.png), [время](time.png), [Pixel](pixel.png). Build/TypeScript/runtime29 и82/82node-теста прошли. Вызов npm test сначала показал отсутствие общего скрипта; использована фактическая команда node --test tests/*.test.mjs. Build сохраняет прежнее предупреждение о bundle>500kB. Physical-device/system Reduce Motion/screenreader повторно не проверялись.

**D-76 опубликован 22.10.2026.** Накопленные изменения Mobile D-61…D-76 доступны на [Vercel](https://prana-mobile-01.vercel.app) и в [GitHub](https://github.com/Chosencorrectly/Prana/tree/main/Mobile). Commit сборки: `cc6cb734e7328b8aecf9df1974102d2bd823bfa8`; commit assets: `baa168f2a4a8dabec6f06c92fda7f46c1ddcadc0`; deployment: `dpl_BwKs7bpUQ47ggGm4R1jETFDBvMep`, READY. Облачная сборка за 9 секунд проверила и восстановила 212 из 212 assets (142397354 байта); проверка 29 файлов runtime прошла. Локально прошли сборка и 82 из 82 тестов. Публичные JS/CSS побайтно совпали с локальной сборкой. В браузере проверены вход с 1111111111 и демокодом 1111, профиль, корзина, интервалы доставки, Milk → Apply, Apple Pay и зазор до Total 48px. Ошибок в консоли и незагруженных изображений нет. Код Web/prototype не изменён, публичный Web отвечает HTTP 200. Реальные платежи/SMS/API и полная визуальная приёмка не заявляются.

Публичный браузерный прогон: [JSON](public-browser-audit.json), [кадр](published.png); [HTTP+SHA](http-audit.json), [лог облачной сборки](vercel-build-log.json), [идентификаторы](publication.json). В окне30min Vercel не вернул error/fatal function logs; это статическое приложение, не подключённый мониторинг клиентских ошибок. Первая попытка dpl_JaX3Yj6ELtqgWfXU2HwCuwdsWXaM остановилась до сборки: projectRoot=Mobile, файлы были вкорне. Повтор с путямиMobile/ завершилсяREADY без изменения кода/настроек безопасности. Productionprotection сохранена; Gitauto-deploy не добавлен.
