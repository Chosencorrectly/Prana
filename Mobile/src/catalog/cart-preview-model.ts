import type { Product } from './catalog-model';

export const cartScenarios = [
  { id: 'ready', label: 'Заполненная корзина', hint: 'Три блюда, четыре порции. Сумма и КБЖУ вычисляются из каталога.' },
  { id: 'loading', label: 'Загрузка', hint: 'Скелетон на 2,4 секунды, затем сохранённые блюда.' },
  { id: 'load-error', label: 'Ошибка загрузки', hint: 'Try again повторяет загрузку и возвращает блюда.' },
  { id: 'empty', label: 'Пустая корзина', hint: 'Browse menu возвращает в каталог.' },
  { id: 'stock', label: 'Ограничение количества', hint: 'Для Acai доступны две порции. Минус работает, третий плюс показывает уведомление.' },
  { id: 'offline', label: 'Нет соединения', hint: 'Сохранённая корзина доступна для просмотра. Изменения и checkout требуют связи.' },
  { id: 'update-error', label: 'Ошибка изменения количества', hint: 'Следующий плюс или минус завершится ошибкой без потери выбора. Повтор сработает.' },
  { id: 'clear', label: 'Подтверждение очистки', hint: 'Keep dishes и крестик сохраняют блюда. Clear cart открывает пустое состояние.' },
  { id: 'no-recommendations', label: 'Нет рекомендаций', hint: 'Список и оформление работают без блока Complete your meal.' },
  { id: 'photo-error', label: 'Фото не загрузилось', hint: 'Заглушка сохраняет размер строки и доступность всех действий.' },
] as const;
export type CartScenario = typeof cartScenarios[number]['id'];

// An explicitly opened preview is isolated from the user's menu basket.
// Fixtures choose real catalogue entries and retain their factual data.
export function cartPreviewQuantities(products: Product[], scenario: CartScenario) {
  if (scenario === 'empty') return {};
  const names = [/^acai bowl/i, /^chia pudding/i, /^buddha bowl/i];
  const chosen = names.map(name => products.find(product => name.test(product.name))).filter((product): product is Product => !!product);
  return Object.fromEntries(chosen.map((product, index) => [product.id, index === 0 ? 2 : 1]));
}
