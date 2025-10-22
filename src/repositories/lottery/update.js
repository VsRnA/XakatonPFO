import db from '#db';

export default async (id, updateData, options = {}) => {
  const [affectedCount] = await db.lottery.update(
    updateData,
    { 
      where: { id },
      ...options,
    }
  );
  return affectedCount;
};