import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsV2Command,
  HeadObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

class S3Storage {
  constructor(config) {
    this.bucketName = config.bucketName;
    this.region = config.region || 'us-east-1';
    this.endpoint = config.endpoint;
    
    const clientConfig = {
      region: this.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      }
    };

    if (config.endpoint) {
      clientConfig.endpoint = config.endpoint;
      clientConfig.forcePathStyle = config.s3ForcePathStyle !== undefined 
        ? config.s3ForcePathStyle 
        : true;
    }
    
    this.client = new S3Client(clientConfig);
  }

  /**
   * Загрузить файл в S3
   * @param {Buffer|Stream|String} file - Содержимое файла
   * @param {String} key - Путь к файлу в bucket (например: 'images/photo.jpg')
   * @param {Object} options - Дополнительные опции (contentType, metadata и т.д.)
   */
  async upload(file, key, options = {}) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: options.contentType || 'application/octet-stream',
        Metadata: options.metadata || {},
        ACL: options.acl || 'private'
      });

      const response = await this.client.send(command);
      

      let fileUrl;
      if (this.endpoint) {
        fileUrl = `${this.endpoint}/${this.bucketName}/${key}`;
      } else {
        fileUrl = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
      }

      return {
        success: true,
        key: key,
        etag: response.ETag,
        url: fileUrl
      };
    } catch (error) {
      console.error('Ошибка загрузки в S3:', error);
      throw error;
    }
  }

  /**
   * Скачать файл из S3
   * @param {String} key - Путь к файлу в bucket
   */
  async download(key) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const response = await this.client.send(command);

      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      
      return {
        success: true,
        data: Buffer.concat(chunks),
        contentType: response.ContentType,
        metadata: response.Metadata
      };
    } catch (error) {
      console.error('Ошибка скачивания из S3:', error);
      throw error;
    }
  }

  /**
   * Удалить файл из S3
   * @param {String} key - Путь к файлу в bucket
   */
  async delete(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.client.send(command);
      
      return {
        success: true,
        message: `Файл ${key} успешно удален`
      };
    } catch (error) {
      console.error('Ошибка удаления из S3:', error);
      throw error;
    }
  }

  /**
   * Получить список файлов в bucket
   * @param {String} prefix - Префикс для фильтрации (например: 'images/')
   * @param {Number} maxKeys - Максимальное количество файлов
   */
  async list(prefix = '', maxKeys = 1000) {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys
      });

      const response = await this.client.send(command);
      
      return {
        success: true,
        files: response.Contents || [],
        count: response.KeyCount
      };
    } catch (error) {
      console.error('Ошибка получения списка файлов:', error);
      throw error;
    }
  }

  /**
   * Проверить существование файла
   * @param {String} key - Путь к файлу в bucket
   */
  async exists(key) {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Получить подписанный URL для загрузки файла
   * @param {String} key - Путь к файлу в bucket
   * @param {Number} expiresIn - Время жизни ссылки в секундах (по умолчанию 1 час)
   */
  async getSignedUploadUrl(key, expiresIn = 3600) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      
      return {
        success: true,
        url: url,
        key: key,
        expiresIn: expiresIn
      };
    } catch (error) {
      console.error('Ошибка создания подписанного URL:', error);
      throw error;
    }
  }

  /**
   * Получить подписанный URL для скачивания файла
   * @param {String} key - Путь к файлу в bucket
   * @param {Number} expiresIn - Время жизни ссылки в секундах (по умолчанию 1 час)
   */
  async getSignedDownloadUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const url = await getSignedUrl(this.client, command, { expiresIn });
      
      return {
        success: true,
        url: url,
        key: key,
        expiresIn: expiresIn
      };
    } catch (error) {
      console.error('Ошибка создания подписанного URL:', error);
      throw error;
    }
  }
}

export default S3Storage;