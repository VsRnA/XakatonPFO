import { rRole } from '#repos';
import { formatRolesResponse } from '#helpers/role.js';
import { parseInteger } from '#helpers/validation.js';

export default async (request) => {
  const page = parseInteger(request.query.page || 1, 'page', { min: 1 });
  const limit = parseInteger(request.query.limit || 10, 'limit', { min: 1, max: 100 });
  const search = request.query.search?.trim() || '';

  const offset = (page - 1) * limit;

  const { roles, total } = await rRole.list({
    limit,
    offset,
    search,
  });

  const totalPages = Math.ceil(total / limit);

  return {
    data: formatRolesResponse(roles),
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};