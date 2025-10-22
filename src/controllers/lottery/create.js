import { ForbiddenError } from '#errors';
import { rLottery } from '#repos';
import { deleteFile, uploadFile } from '#services/fileUpload.js';
import { executeInTransaction } from '#db';
import { 
  generateLotterySeed, 
  createSeedHash, 
  calculateDrandRound 
} from '#services/drandServices.js';

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

  // Генерируем seed и его hash
  const seed = generateLotterySeed();
  const seedHash = createSeedHash(seed);

  // Вычисляем drand раунд на основе времени окончания
  const drandRound = calculateDrandRound(end);

  let uploadedFile = null;

  try {
    return await executeInTransaction(async (transaction) => {
      const options = { transaction };

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
        seed,
        seedHash, 
        drandRound, 
      }, options);

      const createdLottery = await rLottery.findById(lottery.id, options);

      return {
        id: createdLottery.id,
        name: createdLottery.name,
        description: createdLottery.description,
        attachmentKey: createdLottery.attachmentKey,
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
        seedHash: createdLottery.seedHash,
        drandRound: createdLottery.drandRound,
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