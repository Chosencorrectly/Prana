# Prana — Web & Mobile

| Прототип | Открыть | Исходники и запуск |
| --- | --- | --- |
| Mobile | [prana-mobile-01.vercel.app](https://prana-mobile-01.vercel.app) | [Mobile/](Mobile/README.md) |
| Web | [prana-web-01.vercel.app](https://prana-web-01.vercel.app) | [Web/prototype/](Web/prototype/README.md) |

Два независимых браузерных прототипа. [Журнал и актуальный статус](PROJECT_LOG.md). Исторические материалы Web сохранены в Web/; мобильное приложение, оригинальные изображения, тесты и QA — в Mobile/.

## Запуск

Node.js 24.x, npm. После клонирования выберите приложение:

```sh
git clone https://github.com/Chosencorrectly/Prana.git
cd Prana/Mobile
npm ci
npm run dev -- --host 127.0.0.1 --port 5181
```

Для Web используйте папку Web/prototype и порт5180. Сборка любого приложения: npm run build. Mobile: node --test tests/*.test.mjs; npm run check:runtime.

## Выпуск 22.10.2026 — D-76

Обновлены телефон, карточки блюд, корзина, полный профиль и checkout: аллергены, чаевые, три способа оплаты. Доставка бесплатная, налог нулевой. Проверены82теста и29защищённых runtime-файлов. Текущая публикация готовится; результат — в PROJECT_LOG.md.

## Проверка mobile

Skip → добавьте блюдо → Cart → Checkout → Add phone number. Введите международный номер и SMS-код1111. Промокод1111 имитирует скидку10%. Order открывает карту; панель имеет только2 положения, Close возвращает в меню. Баннер под адресом снова открывает заказ.

Адрес, SMS, заказ, оплата, карта и ETA — локальная демонстрация. Данные сбрасываются после reload, настоящие платежи/SMS не отправляются. Публикация выполняется вручную; автоматическая синхронизация Git/Vercel не настроена.
