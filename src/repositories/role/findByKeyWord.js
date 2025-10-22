import db from '#db';

export default async (keyWord, options) => {
  return await db.role.findOne({ 
    where: { keyWord },
    raw: true,
  }, options);
};