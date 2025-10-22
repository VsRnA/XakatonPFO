import db from '#db';

export default async (id, options = {}) => {
  const user = await db.user.findByPk(id, {
    include: [
      {
        model: db.role,
        as: 'roles',
        through: { attributes: [] },
      },
    ],
    ...options,
  });

  if (!user) {
    return null;
  }

  return user.get({ plain: true });
};