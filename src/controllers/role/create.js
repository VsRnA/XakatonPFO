import { rRole } from '#repos';
import {
  parseRoleData,
  checkKeyWordUniqueness,
  formatRoleResponse,
} from '#helpers/role.js';

export default async (request) => {
  const roleData = parseRoleData(request.payload, {
    requireName: true,
    requireKeyWord: true,
  });

  await checkKeyWordUniqueness(roleData.keyWord);

  const role = await rRole.create(roleData);

  return formatRoleResponse(role);
};