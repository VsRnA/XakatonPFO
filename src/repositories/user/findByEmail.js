import db from '#db';

export default async (email, options) => {
  return await db.user.findOne({
    where: { email },
    raw: true,
  }, options );
};