import { NotFoundError, ForbiddenError, ConflictError } from '#errors';
import { rLottery, rUserLotteryAssigned, rEntropyAttachment } from '#repos';
import { uploadFile, deleteFile } from '#services/fileUpload.js';
import { generateEntropy } from '#services/entropyServices.js';
import { executeInTransaction } from '#db';

export default async (request) => {
  const { user } = request.context;
  const file = request.file;
  const { lotteryId, barrelHash } = request.payload;


  let uploadedFile = null;

  try {
    return await executeInTransaction(async (transaction) => {
      const options = { transaction };

      // Проверяем существование лотереи
      const lottery = await rLottery.findById(parseInt(lotteryId), options);
      if (!lottery) {
        throw new NotFoundError('Лотерея не найдена');
      }

      // Проверяем статус лотереи
      if (lottery.status !== 'inProgress') {
        throw new ForbiddenError('Регистрация в эту лотерею недоступна');
      }

      // Проверяем даты лотереи
      const now = new Date();
      if (now < new Date(lottery.startAt)) {
        throw new ForbiddenError('Лотерея еще не началась');
      }
      if (now > new Date(lottery.endAt)) {
        throw new ForbiddenError('Лотерея уже завершена');
      }

      // Проверяем, не зарегистрирован ли уже пользователь
      const existingAssignment = await rUserLotteryAssigned.findByUserAndLottery(
        user.id,
        parseInt(lotteryId),
        options
      );

      if (existingAssignment) {
        throw new ConflictError('Вы уже зарегистрированы в этой лотерее');
      }

      // Загружаем файл в S3
      uploadedFile = await uploadFile(file, `lottery-${lotteryId}/user-${user.id}`);

      const entropy = generateEntropy(
        user.id,
        parseInt(lotteryId),
        barrelHash,
        uploadedFile.key
      );

      const assignment = await rUserLotteryAssigned.create({
        userId: user.id,
        lotteryId: parseInt(lotteryId),
        entropy,
        status: 'inProgress',
        placement: null,
        metadata: {
          barrelHash,
          registeredAt: new Date().toISOString(),
        },
      }, options);

      // Создаем запись о вложении
      await rEntropyAttachment.create({
        entropy,
        attachmentKey: uploadedFile.key,
      }, options);

      return {
        message: 'Вы успешно зарегистрированы в лотерее',
        assignment: {
          userId: assignment.userId,
          lotteryId: assignment.lotteryId,
          entropy: assignment.entropy,
          status: assignment.status,
          registeredAt: assignment.metadata?.registeredAt,
        },
        lottery: {
          id: lottery.id,
          name: lottery.name,
          startAt: lottery.startAt,
          endAt: lottery.endAt,
        },
      };
    });
  } catch (error) {
    if (uploadedFile) {
      try {
        await deleteFile(uploadedFile.key);
      } catch (deleteError) {
        console.error('Ошибка удаления файла после неудачной регистрации:', deleteError);
      }
    }
    throw error;
  }
};