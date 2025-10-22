import db from '#db';

export default async (lotteryId, options = {}) => {
  return await db.userLotteryAssigned.count({
    where: { lotteryId },
    ...options,
  });
};