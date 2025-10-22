import { ValidationError, UnauthorizedError } from '#errors';
import { rUser } from '#repos';
import { comparePassword } from '#services/passwordHelper.js';
import { generateToken } from '#services/jwtHelper.js';

export default async (request) => {
  const { email, password } = request.payload;

  const user = await rUser.findByEmail(email);

  if (!user) {
    throw new UnauthorizedError('Неверный email');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Неверный email или пароль');
  }

  const userWithRoles = await rUser.findByIdWithRoles(user.id);

  const tokenPayload = {
    userId: userWithRoles.id,
  };

  const token = generateToken(tokenPayload);

  return {
    user: {
      id: userWithRoles.id,
      email: userWithRoles.email,
      firstName: userWithRoles.firstName,
      lastName: userWithRoles.lastName,
      middleName: userWithRoles.middleName,
      roles: userWithRoles.roles.map((role) => ({
        id: role.id,
        name: role.name,
        keyWord: role.keyWord,
      })),
      createdAt: userWithRoles.createdAt,
      updatedAt: userWithRoles.updatedAt,
    },
    token,
  };
};