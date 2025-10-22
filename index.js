import sequelize from './config/sequelize.js';
import config from './config/config.js';
import app from './config/express.js';
import { startLotteryStatusJob } from './src/cron/lotteryStatusJob.js';

try {
  await sequelize.authenticate();
  console.log('Connection to the database has been established successfully.');

  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`);
  });

  // Запуск крон таски
  startLotteryStatusJob();

} catch (err) {
  console.error('Server initialization error:', err);
  process.exitCode = 1;
  process.kill(process.pid, 'SIGINT');
}

export default app;
