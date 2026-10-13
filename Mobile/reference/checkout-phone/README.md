# Checkout: отсутствующий номер и Support — D-56

13.10.2026, Europe/Moscow. Локальный браузерный прототип; пользовательская оценка впереди, публикации нет.

Источник: [сценарий](https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1306-3489), [пояснение](https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1056-1028), [Support](https://www.figma.com/design/sVUfk3wL7MabAwk1PIV1fv/Prana-App?node-id=1057-1031). Прочитаны все шесть notices, получены детальные панели ввода/кода и Support. [Обзор Figma](figma-overview.png), [размеры, SVG и адаптации](figma-source.json).

Checkout сразу предлагает Add phone number. Continue у номера недоступна до правдоподобного международного формата; у кода — до четырёх цифр. Неверный код оставляет форму открытой с inline-ошибкой. Код1111 подтверждает номер и возвращает в прежний Delivery с Order; сама отправка заказа остаётся следующим этапом. Back сохраняет ввод, resend ждёт43 секунды и очищает ошибку/код; повторный Continue на том же номере не обходит ожидание. Изменение номера аннулирует старую проверку. После закрытия/открытия и Clear cart подтверждение остаётся на уровне аккаунта до перезагрузки. Это намеренно отдельный от входа по SMS демонстрационный сценарий.

Высота панелей соответствует Figma: номер564px, код706px, включая общую клавиатуру301px. Continue399×54, y549,28px над клавиатурой. Один фон меняет верхнюю границу368↔226px, содержимое переходит через authStep. Никаких дополнительных bottom sheet. Исходная стрелка18×18 и WhatsApp20×20 сохранены SVG. Support400×211 после payment method, кнопка360×50; адрес WhatsApp не задан, действие пока aria-disabled.

Проверки: TypeScript/Vite/Sites packaging и integrity29 прошли;23 теста auth/checkout/phone/motion прошли. IAB: пустой и валидный номер, неполный и неверный код, исправление/1111, resend и cooldown через Back/Continue, сохранение параметров/прокрутки/суммы, повторное открытие, очистка корзины, исходный сценарий после reload. [Аудит](browser-audit.json). Браузерные кадры: [начало](browser-checkout-default.jpg), [номер](browser-phone.jpg), [пустой номер](browser-phone-empty.jpg), [код](browser-code-empty.jpg), [ошибка](browser-code-error.jpg), [Support](browser-support.jpg).

Параметры reduced motion заданы; системный reduced motion, физический touch, нативная клавиатура, screen reader и реальный SMS/API не проверялись. Предупреждение Vite о chunk >500kB сохраняется. Не считать успешную сборку production-готовностью.
