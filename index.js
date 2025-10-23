import sequelize from './config/sequelize.js';
import config from './config/config.js';
import app from './config/express.js';
import { startLotteryStatusJob } from './src/cron/lotteryStatusJob.js';

try {
  await sequelize.authenticate();
  console.log('Connection to the database - successfully.');

  app.listen(config.port, () => {
    console.info(`Server started on port ${config.port}`);
  });

  // Запуск крон таски
  startLotteryStatusJob();

} catch (err) {
  console.error('Server init error:', err);
  process.exitCode = 1;
  process.kill(process.pid, 'SIGINT');
}

export default app;
