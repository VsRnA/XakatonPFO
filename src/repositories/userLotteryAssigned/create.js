import db from '#db';

export default async (assignmentData, options = {}) => {
  return await db.userLotteryAssigned.create(assignmentData, options);
};