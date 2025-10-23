import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production')
    .default('development'),
  PORT: Joi.number().default(4060),
  JWT_SECRET: Joi.string().required()
    .description('JWT Secret required to sign'),
  MYSQL_HOST: Joi.string().required()
    .description('MySQL host url'),
  MYSQL_PORT: Joi.number().default(3306), 
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_DB: Joi.string().required(),
  MODELS_DIR: Joi.string().default('src/models'),
  TIMEWEB_ACCESS_KEY_ID: Joi.string(),
  TIMEWEB_SECRET_ACCESS_KEY: Joi.string(),
  TIMEWEB_BUCKET_NAME: Joi.string(),
  TIMEWEB_REGION: Joi.string(),
  TIMEWEB_ENDPOINT: Joi.string(),
}).unknown().required();

const { error, value: envVars } = envVarsSchema.validate(process.env); // Joi.validate() устарел

if (error) {
  throw new Error(`Configuration validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwtSecret: envVars.JWT_SECRET,
  jwtExpiresIn: '7d',
  mysql: {
    username: envVars.MYSQL_USER,
    password: envVars.MYSQL_PASSWORD,
    database: envVars.MYSQL_DB,
    host: envVars.MYSQL_HOST,
    port: envVars.MYSQL_PORT,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
    },
  },
  modelsDir: envVars.MODELS_DIR,
  storage: {
    accessKeyId: envVars.TIMEWEB_ACCESS_KEY_ID,
    accessKey: envVars.TIMEWEB_SECRET_ACCESS_KEY,
    bucketName: envVars.TIMEWEB_BUCKET_NAME,
    region: envVars.TIMEWEB_REGION,
    endPoint: envVars.TIMEWEB_ENDPOINT,
  }
}

export default config;