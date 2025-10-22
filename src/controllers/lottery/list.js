import { rLottery } from '#repos';
import { getFileUrl } from '#services/fileUpload.js';

export default async (request) => {
  const { page = 1, limit = 10, search, status, organizatorId } = request.query;

  // Валидация параметров пагинации
  const parsedPage = parseInt(page);
  const parsedLimit = parseInt(limit);

  const offset = (parsedPage - 1) * parsedLimit;

  // Получение лотерей из БД
  const { lotteries, total } = await rLottery.list({
    limit: parsedLimit,
    offset,
    search: search?.trim() || null,
    status: status || null,
    organizatorId: parseInt(organizatorId),
  });

  const totalPages = Math.ceil(total / parsedLimit);

  const lotteriesWithImages = await Promise.all(
    lotteries.map(async (lottery) => {
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
          console.error(`Ошибка получения URL для лотереи ${lottery.id}:`, error);
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
    })
  );

  return {
    data: lotteriesWithImages,
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
    },
  };
};