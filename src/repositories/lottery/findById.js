import db from '#db';

export default async (id, options = {}) => {
  const lottery = await db.lottery.findByPk(id, {
    include: [
      {
        model: db.user,
        as: 'organizator',
        attributes: ['id', 'email', 'firstName', 'lastName'],
      },
    ],
    ...options,
  });

  if (!lottery) {
    return null;
  }

  return lottery.get({ plain: true });
};