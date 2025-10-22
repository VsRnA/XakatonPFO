import db from '#db';

export default async (userData, options) => db.user.create(userData, options);