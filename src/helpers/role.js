// #helpers/roleHelpers.js
import { ValidationError, ConflictError, NotFoundError } from '#errors';
import { rRole } from '#repos';

const KEYWORD_PATTERN = /^[a-z_]+$/;

/**
 * Валидирует keyWord роли
 */
export function validateKeyWord(keyWord) {
  if (!KEYWORD_PATTERN.test(keyWord)) {
    throw new ValidationError(
      'Ключ роли может содержать только латинские буквы в нижнем регистре и символ "_"',
      {
        code: 'INVALID_KEYWORD_FORMAT',
        data: { keyWord, pattern: KEYWORD_PATTERN.source },
      }
    );
  }
}

/**
 * Проверяет существование роли по keyWord
 */
export async function checkKeyWordUniqueness(keyWord, excludeId = null) {
  const existingRole = await rRole.findByKeyWord(keyWord);
  
  if (existingRole && (!excludeId || existingRole.id !== excludeId)) {
    throw new ConflictError(`Роль с ключом "${keyWord}" уже существует`, {
      code: 'KEYWORD_ALREADY_EXISTS',
      data: { keyWord, existingRoleId: existingRole.id },
    });
  }
}

/**
 * Находит роль по ID или выбрасывает NotFoundError
 */
export async function findRoleOrFail(id) {
  const role = await rRole.findById(id);
  
  if (!role) {
    throw new NotFoundError('Роль не найдена', {
      code: 'ROLE_NOT_FOUND',
      data: { id },
    });
  }
  
  return role;
}

/**
 * Форматирует данные роли для ответа
 */
export function formatRoleResponse(role) {
  return {
    id: role.id,
    name: role.name,
    keyWord: role.keyWord,
    description: role.description,
    createdAt: role.createdAt,
    updatedAt: role.updatedAt,
  };
}

/**
 * Форматирует массив ролей
 */
export function formatRolesResponse(roles) {
  return roles.map(formatRoleResponse);
}

/**
 * Валидирует и парсит данные роли для создания/обновления
 */
export function parseRoleData(payload, options = {}) {
  const { requireName = true, requireKeyWord = true } = options;
  const { name, keyWord, description } = payload;

  if (requireName && !name) {
    throw new ValidationError('Поле "name" обязательно', {
      code: 'NAME_REQUIRED',
      data: { field: 'name' },
    });
  }

  if (requireKeyWord && !keyWord) {
    throw new ValidationError('Поле "keyWord" обязательно', {
      code: 'KEYWORD_REQUIRED',
      data: { field: 'keyWord' },
    });
  }

  const data = {};
  
  if (name !== undefined) data.name = name;
  if (keyWord !== undefined) {
    validateKeyWord(keyWord);
    data.keyWord = keyWord;
  }
  if (description !== undefined) data.description = description || null;

  return data;
}

/**
 * Проверяет существование всех ролей по массиву ID
 */
export async function validateRoleIds(roleIds, options = {}) {
  if (!Array.isArray(roleIds) || roleIds.length === 0) {
    throw new ValidationError('Необходимо указать хотя бы одну роль', {
      code: 'ROLES_REQUIRED',
      data: { roleIds },
    });
  }

  const roles = await Promise.all(
    roleIds.map(roleId => rRole.findById(roleId, options))
  );

  const notFoundIds = roleIds.filter((id, index) => !roles[index]);

  if (notFoundIds.length > 0) {
    throw new NotFoundError('Одна или несколько ролей не найдены', {
      code: 'ROLES_NOT_FOUND',
      data: { notFoundIds },
    });
  }

  return roles;
}