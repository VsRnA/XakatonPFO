import { NotFoundError, ForbiddenError } from '#errors';
import { rLottery, rUserLotteryAssigned } from '#repos';

export default async (request) => {
  const { user } = request.context;
  const { lotteryId } = request.params;

  // Проверяем существование лотереи
  const lottery = await rLottery.findById(parseInt(lotteryId));
  if (!lottery) {
    throw new NotFoundError('Лотерея не найдена');
  }

  // Проверяем, что результаты уже подведены
  if (lottery.status !== 'Calculated') {
    throw new ForbiddenError('Результаты лотереи еще не подведены');
  }

  // Получаем участие пользователя в лотерее
  const userAssignment = await rUserLotteryAssigned.findByUserAndLottery(
    user.id,
    parseInt(lotteryId)
  );

  if (!userAssignment) {
    throw new NotFoundError('Вы не участвовали в этой лотерее');
  }

  // Получаем всех участников для определения общей статистики
  const allParticipants = await rUserLotteryAssigned.list(
    { lotteryId: parseInt(lotteryId) },
    { order: [['placement', 'ASC']] }
  );

  // Извлекаем данные из metadata
  const userBarrels = JSON.parse(userAssignment.metadata?.barrelsNumber || '[]');
  const userMatchCount = userAssignment.metadata?.matchCount || 0;
  const winningBarrels = lottery.metadata?.winningBarrels || [];

  // Определяем совпадающие бочки
  const matchedBarrels = userBarrels.filter(barrel => 
    winningBarrels.includes(barrel)
  );

  // Подсчитываем победителей и призовые места
  const winners = allParticipants.filter(p => p.status === 'won');
  const totalParticipants = allParticipants.length;

  // Определяем процент участников, которых обошел пользователь
  const betterThanCount = allParticipants.filter(p => {
    const pMatchCount = p.metadata?.matchCount || 0;
    return pMatchCount < userMatchCount;
  }).length;
  
  const percentile = totalParticipants > 1 
    ? Math.round((betterThanCount / (totalParticipants - 1)) * 100)
    : 0;

  return {
    lottery: {
      id: lottery.id,
      name: lottery.name,
      status: lottery.status,
      startAt: lottery.startAt,
      endAt: lottery.endAt,
      totalParticipants,
      winnersCount: winners.length,
      calculatedAt: lottery.metadata?.calculatedAt,
    },
    userResult: {
      userId: user.id,
      status: userAssignment.status,
      placement: userAssignment.placement,
      matchCount: userMatchCount,
      percentile,
      isWinner: userAssignment.status === 'won',
    },
    barrels: {
      player: userBarrels,
      winning: winningBarrels,
      matched: matchedBarrels,
    },
    verification: {
      entropy: userAssignment.entropy,
      secretSeed: lottery.seed,
      drandRandomness: lottery.metadata?.drandRandomness,
      finalSeed: lottery.metadata?.finalSeed,
      seedHash: lottery.seedHash,
    },
    leaderboard: allParticipants.slice(0, 10).map(p => ({
      userId: p.userId,
      placement: p.placement,
      matchCount: p.metadata?.matchCount || 0,
      status: p.status,
      isCurrentUser: p.userId === user.id,
    })),
  };
};