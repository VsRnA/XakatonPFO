import { rRole } from '#repos';
import { ValidationError } from '#errors';
import {
  findRoleOrFail,
  parseRoleData,
  checkKeyWordUniqueness,
  formatRoleResponse,
} from '#helpers/role.js';
import { parseInteger } from '#helpers/validation.js';

export default async (request) => {
  const id = parseInteger(request.params.id, 'id', { min: 1 });

  const role = await findRoleOrFail(id);

  const updateData = parseRoleData(request.payload, {
    requireName: false,
    requireKeyWord: false,
  });

  if (Object.keys(updateData).length === 0) {
    throw new ValidationError('Необходимо указать хотя бы одно поле для обновления', {
      code: 'NO_UPDATE_FIELDS',
      data: { availableFields: ['name', 'keyWord', 'description'] },
    });
  }

  if (updateData.keyWord && updateData.keyWord !== role.keyWord) {
    await checkKeyWordUniqueness(updateData.keyWord, id);
  }

  await rRole.update(id, updateData);

  const updatedRole = await rRole.findById(id);

  return formatRoleResponse(updatedRole);
};