import storage from '#infrastructure/storage.js';
import crypto from 'crypto';
import path from 'path';

export function generateFileName(originalName) {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const ext = path.extname(originalName);
  return `${timestamp}-${randomString}${ext}`;
}

export function validateFileType(mimeType, allowedTypes) {
  return allowedTypes.includes(mimeType);
}

export function validateFileSize(size, maxSize) {
  return size <= maxSize;
}

export async function uploadFile(file, folder = 'uploads') {
  const fileName = generateFileName(file.originalname);
  const key = `${folder}/${fileName}`;
  
  const result = await storage.upload(file.buffer, key, {
    contentType: file.mimetype,
    metadata: {
      originalName: file.originalname,
      uploadedAt: new Date().toISOString()
    }
  });
  
  return result;
}

export async function deleteFile(key) {
  return await s3Storage.delete(key);
}

export async function getFileUrl(key, expiresIn = 3600) {
  return await s3Storage.getSignedDownloadUrl(key, expiresIn);
}
