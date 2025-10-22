import { rLottery } from '#repos';
import { formatLotteriesResponse } from '#helpers/lottery.js';
import { parseInteger } from '#helpers/validation.js';

export default async (request) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    status, 
    organizatorId 
  } = request.query;

  const parsedPage = parseInteger(page, 'page', { min: 1 });
  const parsedLimit = parseInteger(limit, 'limit', { min: 1, max: 100 });
  const offset = (parsedPage - 1) * parsedLimit;

  const { lotteries, total } = await rLottery.list({
    limit: parsedLimit,
    offset,
    search: search?.trim() || null,
    status: status || null,
    organizatorId: organizatorId ? parseInteger(organizatorId, 'organizatorId', { min: 1 }) : null,
  });

  const totalPages = Math.ceil(total / parsedLimit);

  return {
    data: await formatLotteriesResponse(lotteries),
    pagination: {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
    },
  };
};