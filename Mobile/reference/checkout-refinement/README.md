# Checkout и корзина — уточнение D-54

13.10.2026, Europe/Moscow. Основание — обратная связь пользователя к D-53; реализация ожидает оценки. Публикаций и новых правок Figma нет.

- Шапка Checkout / Back to cart / Close заменяет исходную Cart / Close из макета. Back возвращает только корзину; Close закрывает весь sheet и клавиатуру напрямую.
- Новая ссылка на предложенную стрелку не была передана. Переиспользован оригинальный [back.svg](../../public/assets/auth/back.svg)22×22 из авторизации; крестик — исходный checkout SVG. Новые иконки не рисовались.
- Selection border time/payment перенесён из box-shadow на ::after: protected focus reset больше его не снимает.150ms opacity/background/color, прежний pressed и keyboard focus, без hover.
- CartRow появляется/исчезает за240ms через grid0fr↔1fr, opacity и spacing. Height:auto исключён из-за неверного измерения в масштабированном phone. Пустое состояние также плавно заменяется первой строкой. Исходные количества, цены и порядок сохранены.

[Браузерный аудит](browser-audit.json) содержит исходную попытку добавления, окончательную40-кадровую выборку `additionFinal`,32 выборки empty→first item,12 выборок удержания карты, focus/blur/navigation/promo проверки. `addition` — диагностическая запись до исправления height:auto, не итоговый вариант. Выборки включают tool latency, не заменяют FPS-профиль.

[Шапка и время](browser-header-time.jpg), [выбор карты](browser-payment.jpg). Это снимки браузера iPhone430×932 в уменьшенном окне. Физический touch, Pixel, системный reduced motion и screen reader не проверены. Build/integrity29 и16 модельных тестов прошли; подробности в [QA](../../design-qa.md), актуальный статус в [журнале проекта](../../../PROJECT_LOG.md).
