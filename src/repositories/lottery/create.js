import db from '#db';

export default async (lotteryData, options = {}) => {
  return await db.lottery.create(lotteryData, options);
};