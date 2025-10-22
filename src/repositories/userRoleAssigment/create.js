import db from '#db';

export default async ({ userId, roleId, assignedBy = null } , options) => {
  return await db.userRoleAssignment.create({
    userId,
    roleId,
    assignedBy,
  }, options);
};