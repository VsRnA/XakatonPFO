import db from '#db';

export default async (userId, options = {}) => {
  return await db.userRoleAssignment.destroy({
    where: { userId },
    ...options,
  });
};