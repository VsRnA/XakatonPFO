import { readdir } from 'fs/promises';
import path from 'path';
import Sequelize from 'sequelize';
import sequelize from '../../config/sequelize.js';
import config from '../../config/config.js';

const __dirname = config.modelsDir;
const basename = 'index.js';
const db = { Sequelize, sequelize };

async function initDb () {
  const fileNames = (await readdir(__dirname)).filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
  const modelsInitFunctions = (await Promise.all(fileNames.map(fileName => import(path.resolve(__dirname, fileName))))).map(o => o.default)
  const models = modelsInitFunctions.map(modelInit => {
    return modelInit(sequelize, Sequelize)
  });
  models.forEach(model => {
    if (model.associate) {
      model.associate(sequelize.models)
    }
    db[model.name] = model
  })

  await sequelize.sync({ alter: true }); 
  
  return db;
}
export default await initDb();
