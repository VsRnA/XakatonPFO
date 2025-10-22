import { NotFoundError, ForbiddenError } from '#errors';
import { rLottery, rUserLotteryAssigned } from '#repos';
import { generateWinningBarrels, calculateMatches } from '#services/lotteryCalculation.js';
import { executeInTransaction } from '#db';
import crypto from 'crypto';

export default async (request) => {
  const { user } = request.context;
  const { lotteryId, drandRandomness } = request.payload;

  return await executeInTransaction(async (transaction) => {
    const options = { transaction };

    // Проверяем существование лотереи
    const lottery = await rLottery.findById(parseInt(lotteryId), options);
    if (!lottery) {
      throw new NotFoundError('Лотерея не найдена');
    }

    // Проверяем, что пользователь - организатор
    if (lottery.organizatorId !== user.id) {
      throw new ForbiddenError('Только организатор может подвести итоги лотереи');
    }

    // Проверяем статус лотереи
    if (lottery.status !== 'finished') {
      throw new ForbiddenError('Лотерея должна быть в статусе "finished" для подведения итогов');
    }

    // Получаем всех участников лотереи
    const participants = await rUserLotteryAssigned.list({
      lotteryId,
    }, options);

    const secretSeed = lottery.seed;

    const calculatedSeedHash = crypto.createHash('sha256').update(secretSeed).digest('hex');
    if (calculatedSeedHash !== lottery.seedHash) {
      throw new Error('Несоответствие seed и seedHash - нарушена целостность данных');
    }

    const allEntropies = participants.map(p => p.entropy).sort();

    const finalSeedComponents = [
      secretSeed,
      drandRandomness,
      ...allEntropies,
    ].join('-');


    const finalSeed = crypto.createHash('sha256').update(finalSeedComponents).digest('hex');

    const winningBarrels = generateWinningBarrels(finalSeed, lottery.metadata.barrelLimit);

    const results = [];
    
    for (const participant of participants) {
      const playerBarrels = JSON.parse(participant.metadata?.barrelsNumber || '[]');
      
      const matchCount = calculateMatches(playerBarrels, winningBarrels);

      results.push({
        userId: participant.userId,
        entropy: participant.entropy,
        playerBarrels,
        matchCount,
      });
    }

    results.sort((a, b) => b.matchCount - a.matchCount);

    const maxMatches = results[0]?.matchCount || 0;
    const winners = results.filter(r => r.matchCount === maxMatches && r.matchCount > 0);

    let placement = 1;
    for (const result of results) {
      const isWinner = winners.some(w => w.entropy === result.entropy);
      
      await rUserLotteryAssigned.update(lotteryId, result, participants, isWinner, placement, options);

      const nextResult = results[placement];
      if (nextResult && nextResult.matchCount < result.matchCount) {
        placement++;
      }
    }

    await rLottery.update(
      parseInt(lotteryId),
      {
        status: 'Calculated',
        metadata: {
          ...lottery.metadata,
          finalSeed,
          drandRandomness,
          winningBarrels,
          calculatedAt: new Date().toISOString(),
          totalParticipants: participants.length,
          winnersCount: winners.length,
        },
      },
      options
    );

    return {
      message: 'Победители успешно определены',
      lottery: {
        id: lottery.id,
        name: lottery.name,
        status: 'Calculated',
      },
      calculation: {
        secretSeed,
        drandRandomness,
        finalSeed,
        winningBarrels,
        totalParticipants: participants.length,
      },
      winners: winners.map(w => ({
        userId: w.userId,
        entropy: w.entropy,
        playerBarrels: w.playerBarrels,
        matchCount: w.matchCount,
      })),
      results: results.map((r, index) => ({
        placement: r.matchCount > 0 ? index + 1 : null,
        userId: r.userId,
        matchCount: r.matchCount,
        status: winners.some(w => w.entropy === r.entropy) ? 'won' : 'lost',
      })),
    };
  });
};