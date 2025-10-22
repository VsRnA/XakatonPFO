import sequelize from './config/sequelize.js';
import config from './config/config.js';
import app from './config/express.js';

try {
  await sequelize.authenticate();
  console.log('Connection to the database has been established successfully.');

  app.listen(config.port, () => {
    console.info(`server started on port ${config.port} (${config.env})`);
  });
} catch (err) {
  console.error('Server initialization error:', err);
  process.exitCode = 1;
  process.kill(process.pid, 'SIGINT');
}

export default app;
