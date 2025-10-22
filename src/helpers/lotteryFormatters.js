/**
 * Форматирует результаты расчёта лотереи
 */
export function formatCalculationResponse(lottery, calculation, winners, results) {
  return {
    message: 'Победители успешно определены',
    lottery: {
      id: lottery.id,
      name: lottery.name,
      status: 'Calculated',
    },
    calculation: {
      secretSeed: calculation.secretSeed,
      drandRandomness: calculation.drandRandomness,
      finalSeed: calculation.finalSeed,
      winningBarrels: calculation.winningBarrels,
      totalParticipants: calculation.totalParticipants,
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
}

/**
 * Форматирует ответ регистрации в лотерее
 */
export function formatRegistrationResponse(assignment, lottery) {
  return {
    message: 'Вы успешно зарегистрированы в лотерее',
    assignment: {
      userId: assignment.userId,
      lotteryId: assignment.lotteryId,
      entropy: assignment.entropy,
      status: assignment.status,
      registeredAt: assignment.metadata?.registeredAt,
    },
    lottery: {
      id: lottery.id,
      name: lottery.name,
      startAt: lottery.startAt,
      endAt: lottery.endAt,
    },
  };
}

/**
 * Форматирует результаты пользователя в лотерее
 */
export function formatUserResultResponse(lottery, userAssignment, allParticipants, user) {
  const userBarrels = JSON.parse(userAssignment.metadata?.barrelsNumber || '[]');
  const userMatchCount = userAssignment.metadata?.matchCount || 0;
  const winningBarrels = lottery.metadata?.winningBarrels || [];

  const matchedBarrels = userBarrels.filter(barrel => 
    winningBarrels.includes(barrel)
  );

  const winners = allParticipants.filter(p => p.status === 'won');
  const totalParticipants = allParticipants.length;

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
}