import { rUser, rUserRoleAssigment } from '#repos';
import { executeInTransaction } from '#db';
import { parseInteger } from '#helpers/validation.js';
import { findUserOrFail, formatUserResponse } from '#helpers/user.js';
import { validateRoleIds } from '#helpers/role.js';

export default async (request) => {
  const userId = parseInteger(request.params.id, 'id', { min: 1 });
  const { roleIds } = request.payload;

  return await executeInTransaction(async (transaction) => {
    const options = { transaction };

    await findUserOrFail(userId, options);

    await validateRoleIds(roleIds, options);

    await rUserRoleAssigment.deleteByUserId(userId, options);

    const assignments = roleIds.map(roleId => ({
      userId,
      roleId,
    }));

    await rUserRoleAssigment.createBulk(assignments, options);

    const updatedUser = await rUser.findByIdWithRoles(userId, options);

    return formatUserResponse(updatedUser);
  });
};