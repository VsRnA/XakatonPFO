import db from '#db';

export default async (userId, lotteryId, options = {}) => {
  return await db.userLotteryAssigned.findOne({
    where: { userId, lotteryId },
    ...options,
  });
};