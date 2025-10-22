import db from '#db';

export default async (attachmentData, options = {}) => {
  return await db.entropyAttachment.create(attachmentData, options);
};