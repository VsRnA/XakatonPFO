import Sequelize from 'sequelize';
import config from './config.js';

const sequelize = new Sequelize(config.mysql.database, config.mysql.username, config.mysql.password, {
  host: config.mysql.host,
  port: config.mysql.port,
  dialect: config.mysql.dialect,
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_general_ci',
  },
  logging: false,
  pool: {
    max: 10,
    min: 2,
    acquire: 60000,
    idle: 10000,
  },
});

export default sequelize;
