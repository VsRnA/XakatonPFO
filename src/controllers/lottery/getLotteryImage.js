import { NotFoundError } from '#errors';
import { rLottery } from '#repos';
import { getFileUrl } from '#services/fileUpload.js';

export default async (request) => {
  const { id } = request.params;

  const lottery = await rLottery.findById(parseInt(id));

  if (!lottery) {
    throw new NotFoundError('Лотерея не найдена');
  }

  if (!lottery.attachmentKey) {
    throw new NotFoundError('У лотереи нет изображения');
  }

  const urlData = await getFileUrl(lottery.attachmentKey, 3600);

  return {
    attachmentKey: lottery.attachmentKey,
    url: urlData.url,
    expiresIn: urlData.expiresIn,
  };
};