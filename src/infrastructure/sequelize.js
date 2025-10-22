import db from '../models/index.js';

export { Op, QueryTypes, Sequelize } from 'sequelize';

/**
 * Массив всех Sequelize-моделей
 * @type {Object<string,typeof import('sequelize').Model>}
 */
const typedDB = db;
export default typedDB;

/**
 * Run callback-function and give a transaction object in argument
 * @param {function} callback The callback-function
 * @returns {Promise<any>}
 */
export async function executeInTransaction(callback) {
  const transaction = await db.sequelize.transaction();
  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
