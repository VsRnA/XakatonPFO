import crypto from 'crypto';

/**
 * Генерация энтропии на основе различных данных
 */
export function generateEntropy(userId, lotteryId, barrelsNumber, fileBuffer, timestamp = Date.now()) {
  // Хешируем содержимое файла
  const fileHash = crypto.createHash('sha256').update(Buffer.from(fileBuffer)).digest('hex');
  
  console.log(barrelsNumber);
  // Сортируем и stringify массив номеров бочек для консистентности
  const barrelsString = JSON.stringify(barrelsNumber.sort((a, b) => a - b));
  console.log(barrelsString);
  // Комбинируем с остальными данными
  const data = `${userId}-${lotteryId}-${barrelsString}-${fileHash}-${timestamp}`;
  
  return crypto.createHash('sha256').update(data).digest('hex');
}
