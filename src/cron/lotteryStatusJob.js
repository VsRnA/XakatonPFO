import cron from 'cron';
import { updateAllLotteryStatuses } from '#services/lotteryStatusService.js';

const CronJob = cron.CronJob;

/**
 * Cron задача для проверки и обновления статусов лотерей
 * Запускается каждую минуту
 */
export const lotteryStatusJob = new CronJob(
  '* * * * *', // Каждую минуту
  async () => {
    try {
      await updateAllLotteryStatuses();
    } catch (error) {
      console.error('Ошибка в cron задаче lotteryStatusJob:', error);
    }
  },
  null, // onComplete
  false, // start - не запускать автоматически
  'Europe/Moscow' // timezone
);

/**
 * Запуск cron задачи
 */
export function startLotteryStatusJob() {
  lotteryStatusJob.start();
  console.log('Cron задача проверки статусов лотерей запущена (каждую минуту)');
}

/**
 * Остановка cron задачи
 */
export function stopLotteryStatusJob() {
  lotteryStatusJob.stop();
  console.log('Cron задача проверки статусов лотерей остановлена');
}