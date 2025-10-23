import { rLottery, rUserLotteryAssigned } from '#repos';
import { generateWinningBarrels } from '#services/lotteryCalculation.js';
import { executeInTransaction } from '#db';
import { parseInteger } from '#helpers/validation.js';
import {
  findLotteryOrFail,
  requireOrganizator,
  requireLotteryStatus,
} from '#helpers/lotteryValidation.js';
import {
  verifySeedHash,
  calculateFinalSeed,
  processParticipantResults,
  determineWinners,
} from '#helpers/lotteryCalculation.js';
import { formatCalculationResponse } from '#helpers/lotteryFormatters.js';

export default async (request) => {
  const { user } = request.context;
  const lotteryId = parseInteger(request.payload.lotteryId, 'lotteryId', { min: 1 });
  const { drandRandomness, drandRound } = request.payload;

  return await executeInTransaction(async (transaction) => {
    const options = { transaction };

    const lottery = await findLotteryOrFail(lotteryId, options);

    requireOrganizator(lottery, user.id);

    requireLotteryStatus(lottery, 'finished', 'Лотерея должна быть в статусе "finished" для подведения итогов');

    const participants = await rUserLotteryAssigned.list({ lotteryId }, options);

    verifySeedHash(lottery.seed, lottery.seedHash);

    const entropies = participants.map(p => p.entropy);
    const finalSeed = calculateFinalSeed(lottery.seed, drandRandomness, entropies);

    const winningBarrels = generateWinningBarrels(finalSeed, lottery.metadata.barrelLimit, lottery.metadata.barrelCount);

    const results = processParticipantResults(participants, winningBarrels);

    const winners = determineWinners(results);

    let placement = 1;
    for (const result of results) {
      const isWinner = winners.some(w => w.entropy === result.entropy);
      
      await rUserLotteryAssigned.update(
        lotteryId,
        result,
        participants,
        isWinner,
        placement,
        options
      );

      const nextResult = results[placement];
      if (nextResult && nextResult.matchCount < result.matchCount) {
        placement++;
      }
    }

    await rLottery.update(
      lotteryId,
      {
        status: 'Calculated',
        metadata: {
          ...lottery.metadata,
          finalSeed,
          drandRandomness,
          drandRound,
          winningBarrels,
          calculatedAt: new Date().toISOString(),
          totalParticipants: participants.length,
          winnersCount: winners.length,
        },
      },
      options
    );

    return formatCalculationResponse(
      lottery,
      {
        secretSeed: lottery.seed,
        seedHash: lottery.seedHash,
        drandRandomness,
        drandRound,
        finalSeed,
        winningBarrels,
        totalParticipants: participants.length,
        barrelLimit: lottery.metadata.barrelLimit,
        barrelCount: lottery.metadata.barrelCount || 15,
        playerEntropies: entropies,
      },
      winners,
      results
    );
  });
};