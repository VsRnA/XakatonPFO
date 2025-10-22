import { NotFoundError } from '#errors';
import { rUser } from '#repos';

/**
 * Находит пользователя по ID или выбрасывает NotFoundError
 */
export async function findUserOrFail(id, options = {}) {
  const user = await rUser.findById(id, options);
  
  if (!user) {
    throw new NotFoundError('Пользователь не найден', {
      code: 'USER_NOT_FOUND',
      data: { id },
    });
  }
  
  return user;
}

/**
 * Форматирует данные пользователя для ответа
 */
export function formatUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    roles: user.roles?.map(role => ({
      id: role.id,
      name: role.name,
      keyWord: role.keyWord,
    })) || [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Форматирует массив пользователей
 */
export function formatUsersResponse(users) {
  return users.map(formatUserResponse);
}