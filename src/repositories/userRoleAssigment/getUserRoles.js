import db from '#db';

export default async (userId) => {
  return await db.userRoleAssignment.findAll({
    where: { userId },
    include: ['role'],
  });
};