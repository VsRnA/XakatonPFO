import { NotFoundError, ForbiddenError, ConflictError } from '#errors';
import { rLottery, rUserLotteryAssigned } from '#repos';

/**
 * Находит лотерею или выбрасывает ошибку
 */
export async function findLotteryOrFail(lotteryId, options = {}) {
  const lottery = await rLottery.findById(lotteryId, options);
  
  if (!lottery) {
    throw new NotFoundError('Лотерея не найдена', {
      code: 'LOTTERY_NOT_FOUND',
      data: { lotteryId },
    });
  }
  
  return lottery;
}

/**
 * Проверяет, что пользователь является организатором
 */
export function requireOrganizator(lottery, userId) {
  if (lottery.organizatorId !== userId) {
    throw new ForbiddenError('Только организатор может выполнить это действие', {
      code: 'NOT_ORGANIZATOR',
      data: { lotteryId: lottery.id, userId, organizatorId: lottery.organizatorId },
    });
  }
}

/**
 * Проверяет статус лотереи
 */
export function requireLotteryStatus(lottery, requiredStatus, errorMessage) {
  if (lottery.status !== requiredStatus) {
    throw new ForbiddenError(errorMessage || `Лотерея должна быть в статусе "${requiredStatus}"`, {
      code: 'INVALID_LOTTERY_STATUS',
      data: { 
        lotteryId: lottery.id, 
        currentStatus: lottery.status, 
        requiredStatus 
      },
    });
  }
}

/**
 * Проверяет, что лотерея активна для регистрации
 */
export function validateLotteryRegistrationPeriod(lottery) {
  const now = new Date();
  const startAt = new Date(lottery.startAt);
  const endAt = new Date(lottery.endAt);

  if (now < startAt) {
    throw new ForbiddenError('Лотерея ещё не началась', {
      code: 'LOTTERY_NOT_STARTED',
      data: { lotteryId: lottery.id, startAt: lottery.startAt },
    });
  }

  if (now > endAt) {
    throw new ForbiddenError('Лотерея уже завершена', {
      code: 'LOTTERY_ENDED',
      data: { lotteryId: lottery.id, endAt: lottery.endAt },
    });
  }
}

/**
 * Проверяет, не зарегистрирован ли уже пользователь
 */
export async function checkUserNotRegistered(userId, lotteryId, options = {}) {
  const existingAssignment = await rUserLotteryAssigned.findByUserAndLottery(
    userId,
    lotteryId,
    options
  );

  if (existingAssignment) {
    throw new ConflictError('Вы уже зарегистрированы в этой лотерее', {
      code: 'ALREADY_REGISTERED',
      data: { userId, lotteryId },
    });
  }
}

/**
 * Проверяет участие пользователя в лотерее
 */
export async function findUserAssignmentOrFail(userId, lotteryId, options = {}) {
  const assignment = await rUserLotteryAssigned.findByUserAndLottery(
    userId,
    lotteryId,
    options
  );

  if (!assignment) {
    throw new NotFoundError('Вы не участвовали в этой лотерее', {
      code: 'NOT_PARTICIPANT',
      data: { userId, lotteryId },
    });
  }

  return assignment;
}