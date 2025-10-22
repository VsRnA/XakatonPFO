import { ConflictError, NotFoundError } from '#errors';
import { rUser, rRole, rUserRoleAssigment } from '#repos';
import { hashPassword } from '#services/passwordHelper.js';
import { generateToken } from '#services/jwtHelper.js';
import { executeInTransaction } from '#db';

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
  const { email, firstName, lastName, middleName, password } = request.payload;

  return await executeInTransaction(async (transaction) => {
    const options = { transaction };

    const existingUser = await rUser.findByEmail(email, options);
    if (existingUser) {
      throw new ConflictError('Пользователь с таким email уже зарегистрирован', {
        code: 'EMAIL_ALREADY_EXISTS',
        data: { field: 'email', value: email },
      });
    }

    const userRole = await rRole.findByKeyWord('user', options);
    if (!userRole) {
      throw new NotFoundError('Роль пользователя не найдена в системе', {
        code: 'ROLE_NOT_FOUND',
        data: { role: 'user' },
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await rUser.create({
      email,
      firstName,
      lastName,
      middleName: middleName || null,
      password: hashedPassword,
    }, options);

    await rUserRoleAssigment.create({ 
      userId: newUser.id, 
      roleId: userRole.id 
    }, options);

    const userWithRoles = await rUser.findByIdWithRoles(newUser.id, options);

    const token = generateToken({ userId: userWithRoles.id });

    return {
      user: formatUserData(userWithRoles),
      token,
    };
  });
};