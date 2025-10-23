import { findRoleOrFail, formatRoleResponse } from '#helpers/role.js';
import { parseInteger } from '#helpers/validation.js';

export default async (request) => {
  const id = parseInteger(request.params.id, 'id', { min: 1 });

  const role = await findRoleOrFail(id);

  return formatRoleResponse(role);
};