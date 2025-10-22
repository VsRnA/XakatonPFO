import { ValidationError } from '#errors';
import { uploadFile, validateFileType, validateFileSize } from '#services/fileUpload.js';

const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];
const maxFileSize = parseInt('5242880');

export default async (request) => {
  const file = request.file;

  if (!validateFileType(file.mimetype, allowedMimeTypes)) {
    throw new ValidationError(`Недопустимый тип файла: ${file.mimetype}`);
  }

  if (!validateFileSize(file.size, maxFileSize)) {
    throw new ValidationError(`Размер файла превышает максимально допустимый (${maxFileSize} байт)`);
  }

  const result = await uploadFile(file, 'images');

  return {
    file: {
      key: result.key,
      url: result.url,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }
  };
};