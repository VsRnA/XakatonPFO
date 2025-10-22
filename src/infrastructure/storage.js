import S3Storage from '../lib/storage.js';
import config from '../../config/config.js';

const storage = new S3Storage({
  bucketName: config.storage.bucketName,
  region: config.storage.region,
  accessKeyId: config.storage.accessKeyId,
  secretAccessKey: config.storage.accessKey,
  endpoint: config.storage.endPoint,
  s3ForcePathStyle: true
});

export default storage;