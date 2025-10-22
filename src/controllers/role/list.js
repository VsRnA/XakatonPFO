import { rRole } from '#repos';
import { ValidationError } from '#errors';

export default async (request) => {
  console.log(request);
  const page = parseInt(request.query.page) || 1;
  const limit = parseInt(request.query.limit) || 10;
  const search = request.query.search || '';

  if (page < 1) {
    throw new ValidationError('Параметр "page" должен быть положительным числом');
  }

  if (limit < 1 || limit > 100) {
    throw new ValidationError('Параметр "limit" должен быть в диапазоне от 1 до 100');
  }

  const offset = (page - 1) * limit;

  const { roles, total } = await rRole.list({
    limit,
    offset,
    search: search.trim(),
  });

  return roles
};
