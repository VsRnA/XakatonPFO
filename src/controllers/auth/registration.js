import { ConflictError } from '#errors';
import { rUser, rRole, rUserRoleAssigment } from '#repos';
import { hashPassword } from '#services/passwordHelper.js';
import { generateToken } from '#services/jwtHelper.js';
import { executeInTransaction } from '#db';

export default async (request) => {
  const { email, firstName, lastName, middleName, password } = request.payload;

  return await executeInTransaction(async (transaction) => {
    const options = { transaction };

    const existingUser = await rUser.findByEmail(email, options);
    if (existingUser) {
      throw new ConflictError('Пользователь с таким email уже зарегистрирован');
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await rUser.create({
      email,
      firstName,
      lastName,
      middleName: middleName || null,
      password: hashedPassword,
    }, options);

    const userRole = await rRole.findByKeyWord('user', options);
    if (!userRole) {
      throw new Error('Роль пользователя не найдена в системе');
    }

    await rUserRoleAssigment.create({ 
      userId: newUser.id, 
      roleId: userRole.id 
    }, options);
    
    const userWithRoles = await rUser.findByIdWithRoles(newUser.id, options);

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
  });
};