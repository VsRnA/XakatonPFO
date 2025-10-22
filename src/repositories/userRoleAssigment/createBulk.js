import db from '#db';

export default async (assignments, options = {}) => {
  return await db.userRoleAssignment.bulkCreate(assignments, options);
};