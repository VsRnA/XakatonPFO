import crypto from 'crypto';


export const DRAND_GENESIS = 1692803367; // Unix timestamp genesis
export const DRAND_ROUND_TIME = 30; // 30 секунды между раундами

/**
 * Вычислить номер раунда drand на основе времени окончания лотереи
 */
export function calculateDrandRound(endDate) {
  const endTimestamp = Math.floor(endDate.getTime() / 1000);
  const round = Math.floor((endTimestamp - DRAND_GENESIS) / DRAND_ROUND_TIME);
  
  return round;
}

/**
 * Генерировать seed для лотереи
 */
export function generateLotterySeed() {
  return crypto.randomUUID();
}

/**
 * Создать hash от seed
 */
export function createSeedHash(seed) {
  return crypto.createHash('sha256').update(seed).digest('hex');
}