import db from '#db';

export default async (roleData) => {
  return await db.role.create(roleData);
};