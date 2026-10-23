# Prana — Web и Mobile

**D-78 опубликован 23.10.2026 (Europe/Moscow).** По явному запросу пользователя выпущен вариант с двумя подполями: флаг → редактируемый код → шеврон → национальный номер. [Mobile на Vercel](https://prana-mobile-01.vercel.app) · [исходники GitHub](https://github.com/Chosencorrectly/Prana/tree/main/Mobile). Commit исходников: `2c310e7f880d850d08cb4864fde1b0390d774662`; deployment: `dpl_EpM3QfFUxGYqFHhsWXgAUUC16end`, production READY. Все 88 тестов и локальная сборка прошли; облачная сборка за 11 секунд восстановила 212 assets из прежнего pin и проверила runtime29. Публичные JS/CSS побайтно совпали с локальными. В браузере проверены два подполя, очистка/набор кода +62 с автофлагом, сохранение национальных цифр и демовход +1/1111111111 → SMS1111 → Menu; console errors/warnings: 0. Web не изменён. Ограничение «только локально» снято для этого выпуска; более ранние статусы ниже исторические. Реальные SMS/API и проверка физических устройств не заявляются.

**D-76 опубликован 22.10.2026.** Накопленные изменения Mobile D-61…D-76 доступны на [Vercel](https://prana-mobile-01.vercel.app) и в [GitHub](https://github.com/Chosencorrectly/Prana/tree/main/Mobile). Commit сборки: `cc6cb734e7328b8aecf9df1974102d2bd823bfa8`; commit assets: `baa168f2a4a8dabec6f06c92fda7f46c1ddcadc0`; deployment: `dpl_BwKs7bpUQ47ggGm4R1jETFDBvMep`, READY. Облачная сборка за 9 секунд проверила и восстановила 212 из 212 assets (142397354 байта); проверка 29 файлов runtime прошла. Локально прошли сборка и 82 из 82 тестов. Публичные JS/CSS побайтно совпали с локальной сборкой. В браузере проверены вход с 1111111111 и демокодом 1111, профиль, корзина, интервалы доставки, Milk → Apply, Apple Pay и зазор до Total 48px. Ошибок в консоли и незагруженных изображений нет. Код Web/prototype не изменён, публичный Web отвечает HTTP 200. Реальные платежи/SMS/API и полная визуальная приёмка не заявляются.

Проект Prana содержит два опубликованных браузерных прототипа сервиса здоровой еды.

- `prototype/` — desktop: React 19, Vite 6, CSS и Motion 14; опубликован.
- `mobile/` — мобильное приложение: авторизация, меню/PDP/поиск, корзина, checkout, телефон, адрес и tracking с2 положениями панели. В GitHub — `Mobile/`.

- [Mobile](https://prana-mobile-01.vercel.app) · [Web](https://prana-web-01.vercel.app) · [GitHub](https://github.com/Chosencorrectly/Prana)
- [Передача Mobile и результаты проверки](Mobile/reference/publication/README.md)
- [Журнал проекта и границы готовности](PROJECT_LOG.md)
- [Описание приложения](Web/prototype/README.md)
- [Проверки интерфейса](Web/prototype/design-qa.md)
- [Motion-система](Web/prototype/MOTION.md)
- [Мобильное приложение: запуск и сценарий](Mobile/README.md) · [мобильная QA](Mobile/design-qa.md)
- [Палитра и исходники дизайна](Web/design-work/README.md)

## Запуск после клонирования

В GitHub приложения разделены: mobile — `Mobile/`, web — `Web/prototype/`. Локальная исходная структура сохраняет `mobile/` и `prototype/`. Для mobile после clone перейдите в `Prana/Mobile`, выполните `npm ci` и `npm run dev -- --host 127.0.0.1 --port 5181`. Ниже команды Web.
Рекомендуется Node.js 24.x (версия опубликованной сборки).

```sh
git clone https://github.com/Chosencorrectly/Prana.git
cd Prana/Web/prototype
npm ci
npm run dev -- --host 127.0.0.1 --port 5180
```

Откройте http://127.0.0.1:5180/.

## Сборка и проверки

Из папки приложения:

```sh
npm run build
npm run test:motion
npm run test:cart
npm run test:profile
```

Статический сайт собирается в `dist/client`. Для проверки сборки — `npm run preview`.
Для Vercel корень проекта в этом репозитории — **`Web/prototype`**;
сборка `npm run build:vercel`, output `dist/client`. Текущая публикация ручная:
GitHub auto-deploy к существующему проекту Vercel не подключён.

## Что передано

`prototype/` содержит приложение, 87 исходных фото каталога, оригинальную 3D-иллюстрацию
пустой корзины, тесты, настройки сборки, документацию и результаты проверок.
`design-work/` — палитра, Figma-реестры и вспомогательные скрипты;
`prana-pdp-plugin/` — исторический Figma-плагин.
`PROJECT_LOG.md` — основной актуальный журнал. `HANDOFF_PROMPT.md` сохранён как
исторический промпт начала работы; его старый статус не заменяет журнал.

## Границы прототипа

Работают каталог, поиск, PDP, корзина, промокод `1111` (демо −10%), переход к checkout,
редактирование профиля, календарь и marketing toggle. Состояние хранится в памяти
браузера и сбрасывается при перезагрузке. Checkout тупиковый: заказ и оплата не
отправляются. Адреса, карты и история заказов демонстрационные; авторизации и backend нет.
Мобильная авторизация реализована отдельно по D-40: iPhone430×932, визуальная клавиатура301px, демо-SMS1111. Для запуска из локального корня: `cd mobile`, `npm ci`, `npm run dev -- --host 127.0.0.1 --port 5181`. Настоящая авторизация отсутствует и там; следующий мобильный сценарий ещё не выбран. SF Pro подключён через локальные font-face;
на устройствах без шрифта используется системный fallback, бинарники шрифтов не включены.

Каталог — локальный снимок, а не live API. Фактические данные источника сохранены;
24 временных описания имеют метку `prototype-draft`. Подробные ограничения и
явно одобренные пользователем изменения перечислены в журнале.
