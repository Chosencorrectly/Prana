# D-68 — перестановка действий корзины

16.10.2026, Europe/Moscow. Прямой запрос пользователя: снова поменять Close и Clear cart местами. Новое положение: Close слева, Clear cart справа; заменяет D-55. Иконки и их порядок внутри кнопок сохранены. DOM соответствует визуальному порядку. Менялись только CartSheet.tsx и cart.css.

IAB/iPhone430×932: кнопки44px/weight600, Close x399, Clear x702 в координатах браузера. Clear→подтверждение→Keep dishes сохраняет2 позиции/$28.90. Close→Menu возвращает фокус Cart; повторное открытие работает. Build/TypeScript/runtime29 passed, прежний JS>500kB warning. Модельные тесты, native touch, Pixel, empty и компактная шапка не перепроверялись. Runtime/motion/Web/публикации сохранены. Визуальная оценка пользователя впереди.

[Итоговый кадр](preview.png), [замеры](browser-audit.json). Локально, GitHub/Vercel остаются D-60.
