import db from '#db';

export default async (lotteryId, result, participants, isWinner, placement, options = {}) => {
  const updateData = {
    status: isWinner ? 'won' : 'lost',
    placement: result.matchCount > 0 ? placement : null,
    metadata: {
      ...participants.find(p => p.entropy === result.entropy).metadata,
      matchCount: result.matchCount,
      calculatedAt: new Date().toISOString(),
    },
  };

  const [affectedCount] = await db.userLotteryAssigned.update(
    updateData,
    {
      where: {
        lotteryId: parseInt(lotteryId),
        entropy: result.entropy,
      },
      ...options,
    }
  );

  return affectedCount;
};
