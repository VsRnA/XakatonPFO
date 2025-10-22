import { NotFoundError} from '#errors';
import { rUser, rRole, rUserRoleAssigment } from '#repos';
import { executeInTransaction } from '#db';

export default async (request) => {
  const { id } = request.params;
  const { roleIds } = request.payload;
  const currentUser = request.context.user;

  return await executeInTransaction(async (transaction) => {
    const options = { transaction }
    const user = await rUser.findById(parseInt(id), options);
    if (!user) {
      throw new NotFoundError('Пользователь с указанным ID не найден');
    }

    const roles = await Promise.all(
      roleIds.map(roleId => rRole.findById(roleId, options))
    );

    if (roles.some(role => !role)) {
      throw new NotFoundError('Одна или несколько указанных ролей не найдены');
    }

    await rUserRoleAssigment.deleteByUserId(parseInt(id), options);

    const assignments = roleIds.map(roleId => ({
      userId: parseInt(id),
      roleId: roleId,
    }));

    await rUserRoleAssigment.createBulk(assignments, options);

    const updatedUser = await rUser.findByIdWithRoles(parseInt(id), options);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      middleName: updatedUser.middleName,
      roles: updatedUser.roles.map(role => ({
        id: role.id,
        name: role.name,
        keyWord: role.keyWord,
      })),
      updatedAt: updatedUser.updatedAt,
    };
  });
};