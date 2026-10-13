# D-59 — баннер заказа и доступность кнопок

13.10.2026, Europe/Moscow. Реализовано и проверено локально; пользовательская оценка впереди.

- Источник: [экран1240:668](https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1240-668), полный дочерний контекст1240:676 в [figma-context.txt](figma-context.txt). [Screenshot источника](figma-menu.png).
- Оригинальный courier raster: `public/assets/active-order/courier-banner.png`,606757 bytes, слот52×52 наx329/y9 внутри баннера. Без перерисовки/подмены.
- Баннер400×70,x15/y129,radius50,#191919,внутренние отступы24/19. Существующая полоса категорий64px сохранена: её нижняя граница281 вместо285 у68px источника; эта внеобъёмная геометрия каталога не менялась. Баннер резервирует102px над ней.
- Текст динамический: order.status и order.eta. Source Courier on the way/about40min не переводит заказ автоматически в другую стадию; текущее демо показывает Looking for courier/12:20–12:35 PM, согласованно с картой. Free delivery/зеленое время и оригинальное оформление сохранены.
- [Браузерный кадр](browser-menu.jpg), [аудит геометрии/CTA/console](browser-audit.json). Номер: выключено→включено→выключено; SMS1111; Order/Close/повторный вход через баннер проверены. CTA colors180ms,pressed70/150ms,без hover. Системный reduced motion и FPS не измерялись.
- Build/TypeScript/integrity29 passed. Прежний JS chunk warning>500kB. Публикация/Git/Vercel не выполнялись.
