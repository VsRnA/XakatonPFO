import { rLottery } from '#repos';
import { deleteFile, uploadFile } from '#services/fileUpload.js';
import { executeInTransaction } from '#db';
import { 
  generateLotterySeed, 
  createSeedHash, 
  calculateDrandRound 
} from '#services/drandServices.js';
import { formatLotteryResponse } from '#helpers/lottery.js';
import { 
  requireAdmin, 
  validateLotteryDates, 
  parseLotteryMetadata,
  parseInteger 
} from '#helpers/validation.js';

export default async (request) => {
  const { user } = request.context;
  const { file } = request;
  const { 
    name, 
    description, 
    startAt, 
    endAt,
    barrelCount,
    barrelLimit,
    amount,
  } = request.payload;

  // Проверяем права
  requireAdmin(user);

  // Валидируем входные данные
  const { start, end } = validateLotteryDates(startAt, endAt);
  const metadata = parseLotteryMetadata(barrelCount, barrelLimit);
  const parsedAmount = parseInteger(amount, 'amount', { min: 1 });

  // Генерируем данные для лотереи
  const seed = generateLotterySeed();
  const seedHash = createSeedHash(seed);
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
        metadata,
        status: 'draft',
        amount: parsedAmount,
        seed,
        seedHash,
        drandRound,
      }, options);

      const createdLottery = await rLottery.findById(lottery.id, options);

      return formatLotteryResponse(createdLottery, { includeImage: false });
    });
  } catch (error) {
    
    if (uploadedFile) {
      await deleteFile(uploadedFile.key).catch((deleteError) => {
        console.error('Failed to delete file after lottery creation error:', {
          key: uploadedFile.key,
          error: deleteError.message,
        });
      });
    }
    throw error;
  }
};