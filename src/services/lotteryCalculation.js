import crypto from 'crypto';

/**
 * Генерирует выигрышные бочки из seed
 * @param {string} seed - Финальный seed для генерации
 * @param {number} count - Количество бочек для генерации
 * @param {number} maxNumber - Максимальное число (по умолчанию 90 как в русском лото)
 * @returns {number[]} - Массив выигрышных номеров
 */
export function generateWinningBarrels(seed, count = 6, maxNumber = 90) {
  const barrels = new Set();
  let currentSeed = seed;
  while (barrels.size < count) {
    const hash = crypto.createHash('sha256').update(currentSeed).digest('hex');
    const num = parseInt(hash.substring(0, 8), 16);

    const barrel = (num % maxNumber) + 1;
    
    barrels.add(barrel);

    currentSeed = hash;
  }

  return Array.from(barrels).sort((a, b) => a - b);
}

/**
 * Подсчитывает количество совпадений между бочками игрока и выигрышными
 * @param {number[]} playerBarrels - Бочки игрока
 * @param {number[]} winningBarrels - Выигрышные бочки
 * @returns {number} - Количество совпадений
 */
export function calculateMatches(playerBarrels, winningBarrels) {
  if (!Array.isArray(playerBarrels) || !Array.isArray(winningBarrels)) {
    return 0;
  }

  const winningSet = new Set(winningBarrels);
  let matches = 0;

  for (const barrel of playerBarrels) {
    if (winningSet.has(barrel)) {
      matches++;
    }
  }

  return matches;
}

/**
 * Проверяет валидность drand randomness (базовая проверка)
 * @param {string} randomness - Строка randomness от drand
 * @returns {boolean}
 */
export function validateDrandRandomness(randomness) {
  // Базовая проверка: должна быть hex-строкой
  const hexPattern = /^[a-f0-9]+$/i;
  return typeof randomness === 'string' && 
         randomness.length >= 64 && 
         hexPattern.test(randomness);
}