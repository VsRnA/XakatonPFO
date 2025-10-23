import { rUserLotteryAssigned, rEntropyAttachment } from '#repos';
import { uploadFile, deleteFile } from '#services/fileUpload.js';
import { generateEntropy } from '#services/entropyServices.js';
import { executeInTransaction } from '#db';
import { parseInteger } from '#helpers/validation.js';
import {
  findLotteryOrFail,
  requireLotteryStatus,
  validateLotteryRegistrationPeriod,
  checkUserNotRegistered,
} from '#helpers/lotteryValidation.js';
import { formatRegistrationResponse } from '#helpers/lotteryFormatters.js';

export default async (request) => {
  const { user } = request.context;
  const { file } = request;
  const lotteryId = parseInteger(request.payload.lotteryId, 'lotteryId', { min: 1 });
  const { barrelsNumber } = request.payload;

  let uploadedFile = null;

  try {
    return await executeInTransaction(async (transaction) => {
      const options = { transaction };

      const lottery = await findLotteryOrFail(lotteryId, options);

      requireLotteryStatus(lottery, 'inProgress', 'Регистрация в эту лотерею недоступна');

      validateLotteryRegistrationPeriod(lottery);

      await checkUserNotRegistered(user.id, lotteryId, options);

      uploadedFile = await uploadFile(file, `lottery-${lotteryId}/user-${user.id}`);

      const entropy = generateEntropy(
        user.id,
        lotteryId,
        JSON.parse(barrelsNumber),
        file.buffer
      );

      const assignment = await rUserLotteryAssigned.create({
        userId: user.id,
        lotteryId,
        entropy,
        status: 'inProgress',
        placement: null,
        metadata: {
          barrelsNumber,
          registeredAt: new Date().toISOString(),
        },
      }, options);

      await rEntropyAttachment.create({
        entropy,
        attachmentKey: uploadedFile.key,
      }, options);

      return formatRegistrationResponse(assignment, lottery);
    });
  } catch (error) {
    if (uploadedFile) {
      await deleteFile(uploadedFile.key).catch((deleteError) => {
        console.error('Failed to delete file after registration error:', {
          key: uploadedFile.key,
          error: deleteError.message,
        });
      });
    }
    throw error;
  }
};