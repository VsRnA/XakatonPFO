import { ValidationError, NotFoundError } from '#errors';
import { rLottery } from '#repos';
import { getFileUrl } from '#services/fileUpload.js';

export default async (request) => {
  const { id } = request.params;

  const lottery = await rLottery.findById(parseInt(id));

  if (!lottery) {
    throw new NotFoundError('Лотерея с указанным ID не найдена');
  }

  let imageData = null;
  
  if (lottery.attachmentKey) {
    try {
      const urlData = await getFileUrl(lottery.attachmentKey, 3600);
      imageData = {
        attachmentKey: lottery.attachmentKey,
        url: urlData.url,
        expiresIn: urlData.expiresIn,
      };
    } catch (error) {
      console.error(`Ошибка получения URL изображения для лотереи ${lottery.id}:`, error);
      imageData = {
        attachmentKey: lottery.attachmentKey,
        url: null,
        error: 'Не удалось получить URL изображения',
      };
    }
  }

  return {
    id: lottery.id,
    name: lottery.name,
    description: lottery.description,
    image: imageData,
    amount: lottery.amount,
    startAt: lottery.startAt,
    endAt: lottery.endAt,
    organizator: {
      id: lottery.organizator.id,
      email: lottery.organizator.email,
      firstName: lottery.organizator.firstName,
      lastName: lottery.organizator.lastName,
    },
    metadata: lottery.metadata,
    status: lottery.status,
    createdAt: lottery.createdAt,
    updatedAt: lottery.updatedAt,
    seedHash: lottery.seedHash,
  };
};