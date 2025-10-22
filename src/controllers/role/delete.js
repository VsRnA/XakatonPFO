import { rRole } from '#repos';
import { findRoleOrFail } from '#helpers/role.js';
import { parseInteger } from '#helpers/validation.js';

export default async (request) => {
  const id = parseInteger(request.params.id, 'id', { min: 1 });

  await findRoleOrFail(id);
  await rRole.delete(id);

  return { 
    message: 'Роль успешно удалена',
    id,
  };
};