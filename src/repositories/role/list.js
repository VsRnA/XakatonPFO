import db from '#db';
import { Op } from '#db';

export default async ({ limit, offset, search }) => {
  const where = {};
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { keyWord: { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await db.role.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    raw: true,
  });

  return { roles: rows, total: count };
};