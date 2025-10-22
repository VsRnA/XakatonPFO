import { rRole } from '#repos';
import { ValidationError, NotFoundError } from '#errors';

export default async (request) => {
  const { id } = request.params;

  if (!id || isNaN(id)) {
    throw new ValidationError('Некорректный идентификатор роли');
  }

  const role = await rRole.findById(parseInt(id));
  if (!role) {
    throw new NotFoundError(`Роль с ID ${id} не найдена`);
  }

  return role;
};
