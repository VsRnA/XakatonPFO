import { getFileUrl } from '#services/fileUpload.js';

/**
 * Форматирует данные организатора
 */
export function formatOrganizator(organizator) {
  if (!organizator) return null;
  
  return {
    id: organizator.id,
    email: organizator.email,
    firstName: organizator.firstName,
    lastName: organizator.lastName,
  };
}

/**
 * Получает данные изображения с URL
 */
export async function getImageData(attachmentKey) {
  if (!attachmentKey) {
    return null;
  }

  try {
    const urlData = await getFileUrl(attachmentKey, 3600);
    return {
      attachmentKey,
      url: urlData.url,
      expiresIn: urlData.expiresIn,
    };
  } catch (error) {
    console.error(`Failed to get image URL for key ${attachmentKey}:`, error.message);
    return {
      attachmentKey,
      url: null,
      error: 'Не удалось получить URL изображения',
    };
  }
}

/**
 * Форматирует данные лотереи для ответа
 */
export async function formatLotteryResponse(lottery, options = {}) {
  const { includeImage = true } = options;

  const response = {
    id: lottery.id,
    name: lottery.name,
    description: lottery.description,
    amount: lottery.amount,
    startAt: lottery.startAt,
    endAt: lottery.endAt,
    organizator: formatOrganizator(lottery.organizator),
    metadata: lottery.metadata,
    status: lottery.status,
    seedHash: lottery.seedHash,
    drandRound: lottery.drandRound,
    createdAt: lottery.createdAt,
    updatedAt: lottery.updatedAt,
  };

  // Добавляем изображение если нужно
  if (includeImage) {
    response.image = await getImageData(lottery.attachmentKey);
  } else if (lottery.attachmentKey) {
    response.attachmentKey = lottery.attachmentKey;
  }

  return response;
}

/**
 * Форматирует массив лотерей
 */
export async function formatLotteriesResponse(lotteries, options = {}) {
  return Promise.all(
    lotteries.map((lottery) => formatLotteryResponse(lottery, options))
  );
}