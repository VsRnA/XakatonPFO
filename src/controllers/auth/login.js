import { UnauthorizedError } from '#errors';
import { rUser } from '#repos';
import { comparePassword } from '#services/passwordHelper.js';
import { generateToken } from '#services/jwtHelper.js';

// Коды ошибок
const ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
};

// Хелпер для форматирования данных пользователя
function formatUserData(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    roles: user.roles.map((role) => ({
      id: role.id,
      name: role.name,
      keyWord: role.keyWord,
    })),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export default async (request) => {
  const { email, password } = request.payload;

  const user = await rUser.findByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Неверный email или пароль', {
      code: ERROR_CODES.INVALID_CREDENTIALS,
      data: { field: 'email' },
    });
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Неверный email или пароль', {
      code: ERROR_CODES.INVALID_CREDENTIALS,
      data: { field: 'password' },
    });
  }

  const userWithRoles = await rUser.findByIdWithRoles(user.id);

  const token = generateToken({ userId: userWithRoles.id });

  return {
    user: formatUserData(userWithRoles),
    token,
  };
};