import { NotFoundError } from '#errors';
import { rLottery } from '#repos';
import { formatLotteryResponse } from '#helpers/lottery.js';
import { parseInteger } from '#helpers/validation.js';

export default async (request) => {
  const { id } = request.params;

  const lottery = await rLottery.findById(parseInteger(id, 'id', { min: 1 }));

  if (!lottery) {
    throw new NotFoundError('Лотерея не найдена', {
      code: 'LOTTERY_NOT_FOUND',
      data: { id },
    });
  }

  return formatLotteryResponse(lottery);
};