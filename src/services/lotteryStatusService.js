import { rLottery } from '#repos';
import { executeInTransaction } from '#db';

/**
 * Запуск лотерей, у которых наступила дата начала
 */
export async function startScheduledLotteries() {
  try {
    const now = new Date();
    
    // Используем findAll с фильтрами
    const { lotteries: lotteriesToStart } = await rLottery.list({
      status: 'draft',
      startAtTo: now, // startAt <= now
      limit: null,
      offset: null,
    });
    
    if (lotteriesToStart.length === 0) {
      console.log('Нет лотерей для запуска');
      return { started: 0 };
    }

    let startedCount = 0;

    for (const lottery of lotteriesToStart) {
      try {
        await executeInTransaction(async (options) => {
          await rLottery.update(lottery.id, { status: 'inProgress' }, options);
          console.log(`Лотерея #${lottery.id} "${lottery.name}" запущена`);
          startedCount++;
        });
      } catch (error) {
        console.error(`Ошибка запуска лотереи #${lottery.id}:`, error);
      }
    }

    console.log(`✓ Запущено лотерей: ${startedCount} из ${lotteriesToStart.length}`);
    return { started: startedCount, total: lotteriesToStart.length };
  } catch (error) {
    console.error('Ошибка в startScheduledLotteries:', error);
    throw error;
  }
}

/**
 * Завершение лотерей, у которых наступила дата окончания
 */
export async function finishScheduledLotteries() {
  try {
    const now = new Date();
    
    const { lotteries: lotteriesToFinish } = await rLottery.list({
      status: 'inProgress',
      endAtTo: now,
      limit: null,
      offset: null,
    });
    
    if (lotteriesToFinish.length === 0) {
      console.log('✓ Нет лотерей для завершения');
      return { finished: 0 };
    }

    let finishedCount = 0;

    for (const lottery of lotteriesToFinish) {
      try {
        await executeInTransaction(async (options) => {
          await rLottery.update(lottery.id, { status: 'finished' }, options);
          console.log(`Лотерея #${lottery.id} "${lottery.name}" завершена`);
          finishedCount++;
        });
      } catch (error) {
        console.error(`Ошибка завершения лотереи #${lottery.id}:`, error);
      }
    }

    console.log(`Завершено лотерей: ${finishedCount} из ${lotteriesToFinish.length}`);
    return { finished: finishedCount, total: lotteriesToFinish.length };
  } catch (error) {
    console.error('Ошибка в finishScheduledLotteries:', error);
    throw error;
  }
}

/**
 * Проверка и обновление всех статусов лотерей
 */
export async function updateAllLotteryStatuses() {
  console.log('🔄 Начало проверки статусов лотерей:', new Date().toISOString());
  
  try {
    const startResult = await startScheduledLotteries();
    const finishResult = await finishScheduledLotteries();
    
    console.log('Проверка статусов завершена:', {
      started: startResult.started,
      finished: finishResult.finished,
    });
    
    return {
      started: startResult.started,
      finished: finishResult.finished,
    };
  } catch (error) {
    console.error('Ошибка обновления статусов лотерей:', error);
    throw error;
  }
}