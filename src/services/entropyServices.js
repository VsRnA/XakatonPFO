import crypto from 'crypto';

/**
 * Генерация энтропии на основе различных данных
 */
export function generateEntropy(userId, lotteryId, barrelHash, fileBuffer, timestamp = Date.now()) {
  // Хешируем содержимое файла
  const fileHash = crypto.createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex');
  
  // Комбинируем с остальными данными
  const data = `${userId}-${lotteryId}-${barrelHash}-${fileHash}-${timestamp}`;
  
  return crypto.createHash('sha256').update(data).digest('hex');
}
/**
 * Валидация хеша бочек
 */
export function validateBarrelHash(barrelHash) {
  const hashPattern = /^[a-f0-9]{64}$/i;
  return hashPattern.test(barrelHash);
}