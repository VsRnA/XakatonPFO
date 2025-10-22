import db from '../models/index.js';
export { Op, QueryTypes, Sequelize } from 'sequelize';

const typedDB = db;
export default typedDB;

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
