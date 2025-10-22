import { ForbiddenError } from '#errors';
import { rLottery } from '#repos';
import { deleteFile, uploadFile } from '#services/fileUpload.js';
import { executeInTransaction } from '#db';

export default async (request) => {
  const { user } = request.context;
  const file = request.file;
  const { 
    name, 
    description, 
    startAt, 
    endAt,
    barrelCount,
    barrelLimit,
    amount,
  } = request.payload;

  if (!user || !user.roles.includes('admin')) {
    throw new ForbiddenError('Только администраторы могут создавать лотереи');
  }


  const start = new Date(startAt);
  const end = new Date(endAt);

  const metadata = {
    barrelCount: parseInt(barrelCount),
    barrelLimit: parseInt(barrelLimit),
  };

  let uploadedFile = null;

  try {
    return await executeInTransaction(async (transaction) => {
      const options = { transaction }

      uploadedFile = await uploadFile(file, 'lotteries');

      const lottery = await rLottery.create({
        name,
        description: description || null,
        attachmentKey: uploadedFile.key, 
        startAt: start,
        endAt: end,
        organizatorId: user.id,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
        status: 'draft',
        amount: parseInt(amount),
      }, options);

      const createdLottery = await rLottery.findById(lottery.id, options);

      return {
        id: createdLottery.id,
        name: createdLottery.name,
        description: createdLottery.description,
        attachmentGuid: createdLottery.attachmentGuid,
        startAt: createdLottery.startAt,
        endAt: createdLottery.endAt,
        organizator: {
          id: createdLottery.organizator.id,
          email: createdLottery.organizator.email,
          firstName: createdLottery.organizator.firstName,
          lastName: createdLottery.organizator.lastName,
        },
        metadata: createdLottery.metadata,
        status: createdLottery.status,
        createdAt: createdLottery.createdAt,
        amount: createdLottery.amount,
      };
    });
  } catch (error) {
    if (uploadedFile) {
      try {
        await deleteFile(uploadedFile.key);
      } catch (deleteError) {
        console.error('Ошибка удаления файла после неудачного создания лотереи:', deleteError);
      }
    }
    throw error;
  }
};