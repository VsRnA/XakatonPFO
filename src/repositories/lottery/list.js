import db from '#db';
import { Op } from '#db';

export default async ({ 
  limit, 
  offset, 
  search, 
  status, 
  organizatorId,
  startAtFrom,
  startAtTo,
  endAtFrom,
  endAtTo,
  ids,
}, options = {}) => {
  const where = {};
  
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (status) {
    if (Array.isArray(status)) {
      where.status = { [Op.in]: status };
    } else {
      where.status = status;
    }
  }

  if (organizatorId) {
    where.organizatorId = organizatorId;
  }

  if (ids && Array.isArray(ids) && ids.length > 0) {
    where.id = { [Op.in]: ids };
  }

  if (startAtFrom || startAtTo) {
    where.startAt = {};
    if (startAtFrom) {
      where.startAt[Op.gte] = new Date(startAtFrom);
    }
    if (startAtTo) {
      where.startAt[Op.lte] = new Date(startAtTo);
    }
  }

  if (endAtFrom || endAtTo) {
    where.endAt = {};
    if (endAtFrom) {
      where.endAt[Op.gte] = new Date(endAtFrom);
    }
    if (endAtTo) {
      where.endAt[Op.lte] = new Date(endAtTo);
    }
  }

  const queryOptions = {
    where,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: db.user,
        as: 'organizator',
        attributes: ['id', 'email', 'firstName', 'lastName'],
      },
    ],
    ...options,
  };

  if (limit !== undefined && limit !== null) {
    queryOptions.limit = limit;
  }
  if (offset !== undefined && offset !== null) {
    queryOptions.offset = offset;
  }

  const { count, rows } = await db.lottery.findAndCountAll(queryOptions);

  return { 
    lotteries: rows.map(row => row.toJSON()), // или row.get({ plain: true })
    total: count 
  };
};