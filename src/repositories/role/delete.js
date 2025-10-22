import db from '#db';

export default async (id) => {
  return await db.role.destroy({ 
    where: { id },
  });
};