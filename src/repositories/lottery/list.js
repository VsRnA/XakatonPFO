import db from '#db';
import { Op } from '#db';

export default async ({ limit, offset, search, status, organizatorId }, options = {}) => {
  const where = {};
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (organizatorId) {
    where.organizatorId = organizatorId;
  }

  const { count, rows } = await db.lottery.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: db.user,
        as: 'organizator',
        attributes: ['id', 'email', 'firstName', 'lastName'],
      },
    ],
    ...options,
  });

  return { 
    lotteries: rows.map(row => row.get({ plain: true })), 
    total: count 
  };
};