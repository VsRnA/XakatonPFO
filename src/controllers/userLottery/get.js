// getUserResult.js
import { rUserLotteryAssigned } from '#repos';
import { parseInteger } from '#helpers/validation.js';
import {
  findLotteryOrFail,
  requireLotteryStatus,
  findUserAssignmentOrFail,
} from '#helpers/lotteryValidation.js';
import { formatUserResultResponse } from '#helpers/lotteryFormatters.js';

export default async (request) => {
  const { user } = request.context;
  const lotteryId = parseInteger(request.params.lotteryId, 'lotteryId', { min: 1 });

  const lottery = await findLotteryOrFail(lotteryId);

  requireLotteryStatus(lottery, 'Calculated', 'Результаты лотереи ещё не подведены');

  const userAssignment = await findUserAssignmentOrFail(user.id, lotteryId);

  const allParticipants = await rUserLotteryAssigned.list(
    { lotteryId },
    { order: [['placement', 'ASC']] }
  );

  return formatUserResultResponse(lottery, userAssignment, allParticipants, user);
};