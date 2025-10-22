import crypto from 'crypto';

/**
 * Генерация энтропии на основе различных данных
 */
export function generateEntropy(userId, lotteryId, barrelHash, attachmentKey, timestamp = Date.now()) {
  const data = `${userId}-${lotteryId}-${barrelHash}-${attachmentKey}-${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Валидация хеша бочек
 */
export function validateBarrelHash(barrelHash) {
  const hashPattern = /^[a-f0-9]{64}$/i;
  return hashPattern.test(barrelHash);
}