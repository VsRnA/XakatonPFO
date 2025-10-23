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

  // Собираем энтропии всех участников
  const entropies = allParticipants.map(p => p.entropy);

  return formatUserResultResponse(
    lottery, 
    userAssignment, 
    allParticipants, 
    user,
    {
      secretSeed: lottery.seed,
      seedHash: lottery.seedHash,
      drandRandomness: lottery.metadata.drandRandomness,
      drandRound: lottery.metadata.drandRound,
      finalSeed: lottery.metadata.finalSeed,
      winningBarrels: lottery.metadata.winningBarrels,
      totalParticipants: lottery.metadata.totalParticipants,
      barrelLimit: lottery.metadata.barrelLimit,
      barrelCount: lottery.metadata.barrelCount || 15,
      playerEntropies: entropies,
    }
  );
};