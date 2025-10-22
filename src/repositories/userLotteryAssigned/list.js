import db from '#db';

export default async (query, options) => {
  const where = {};
  
  if (query.lotteryId) where.lotteryId = parseInt(query.lotteryId);

  return db.userLotteryAssigned.findAll({
    where,
    ...options,
  });
}