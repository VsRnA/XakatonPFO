import db from '#db';

export default async (id, updateData) => {
  const [affectedCount] = await db.role.update(updateData, { 
    where: { id },
  });
  return affectedCount;
};