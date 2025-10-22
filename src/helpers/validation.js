// #helpers/validation.js
import { ForbiddenError, ValidationError } from '#errors';

/**
 * Проверяет наличие роли у пользователя
 */
export function requireRole(user, role) {
  if (!user || !user.roles?.includes(role)) {
    throw new ForbiddenError(`Требуется роль: ${role}`, {
      code: 'ROLE_REQUIRED',
      data: { requiredRole: role },
    });
  }
}

/**
 * Проверяет права администратора
 */
export function requireAdmin(user) {
  requireRole(user, 'admin');
}

/**
 * Парсит и валидирует integer
 */
export function parseInteger(value, fieldName, options = {}) {
  const { min, max } = options;
  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    throw new ValidationError(`Некорректное значение для ${fieldName}`, {
      code: 'INVALID_INTEGER',
      data: { field: fieldName, value },
    });
  }

  if (min !== undefined && parsed < min) {
    throw new ValidationError(`${fieldName} должно быть не меньше ${min}`, {
      code: 'VALUE_TOO_SMALL',
      data: { field: fieldName, value: parsed, min },
    });
  }

  if (max !== undefined && parsed > max) {
    throw new ValidationError(`${fieldName} должно быть не больше ${max}`, {
      code: 'VALUE_TOO_LARGE',
      data: { field: fieldName, value: parsed, max },
    });
  }

  return parsed;
}

/**
 * Валидирует даты лотереи
 */
export function validateLotteryDates(startAt, endAt) {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ValidationError('Некорректный формат даты', {
      code: 'INVALID_DATE_FORMAT',
      data: { startAt, endAt },
    });
  }

  if (start >= end) {
    throw new ValidationError('Дата начала должна быть раньше даты окончания', {
      code: 'INVALID_DATE_RANGE',
      data: { startAt, endAt },
    });
  }

  if (end <= now) {
    throw new ValidationError('Дата окончания должна быть в будущем', {
      code: 'END_DATE_IN_PAST',
      data: { endAt },
    });
  }

  return { start, end };
}

/**
 * Парсит метаданные лотереи
 */
export function parseLotteryMetadata(barrelCount, barrelLimit) {
  return {
    barrelCount: parseInteger(barrelCount, 'barrelCount', { min: 1 }),
    barrelLimit: parseInteger(barrelLimit, 'barrelLimit', { min: 1 }),
  };
}