import express from 'express';
import passport from 'passport';
import multer from 'multer';
import Gateway from '#infrastructure/gateway.js';
import * as allRoutes from '#routes';
import { loadOpenapiRoutes, validateRequest } from '#lib/openapi.js';
import Auth from '../../config/passport.js';
import S3Storage from '#lib/storage.js';

// Маппинг кодов ошибок на HTTP статусы
const ERROR_CODE_TO_HTTP_STATUS = {
  ERR_NOT_FOUND: 404,
  ERR_VALIDATION: 400,
  ERR_CONFLICT: 409,
  ERR_FORBIDDEN: 403,
  ERR_UNAUTHORIZED: 401,
};

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

const openapiRoutes = (await loadOpenapiRoutes('src/docs/openapi.yml'))
  .reduce((index, route) => {
    if (!index[route.path]) {
      index[route.path] = {};
    }
    index[route.path][route.verb] = route;
    return index;
  }, {});

export default function createExpressGateway() {
  const router = express.Router();
  const auth = Auth(passport);

  Object.values(allRoutes).forEach((routes) => {
    routes.forEach((route) => {
      try {
        registerRoute(router, route, auth);
      } catch (err) {
        console.error(
          `Failed to register route ${route.verb.toUpperCase()} /api${route.path}:`,
          err.message
        );
      }
    });
  });

  return router;
}

function registerRoute(router, route, auth) {
  const openapiRoute = openapiRoutes[route.path]?.[route.verb];
  
  if (!openapiRoute) {
    throw new Error(`Route ${route.verb.toUpperCase()} ${route.path} is not described in OpenAPI`);
  }

  const middlewares = buildMiddlewares(route, openapiRoute, auth);
  router[route.verb](`/api${route.path}`, ...middlewares);
}

function buildMiddlewares(route, openapiRoute, auth) {
  const middlewares = [];

  if (route.authedOnly) {
    middlewares.push((req, res, next) => auth.authenticate(req, res, next));
  }

  if (route.upload) {
    middlewares.push(handleFileUpload);
  }

  middlewares.push(createController(route, openapiRoute));

  return middlewares;
}

function createController(route, openapiRoute) {
  return async (req, res) => {
    try {
      const request = buildRequest(req, route);
      
      const response = await Gateway.handler({
        route,
        request,
        validate: () => validateRequest(request, openapiRoute),
      });

      await sendResponse(res, response);
    } catch (err) {
      console.error('Controller error:', err);
      const { error, statusCode } = Gateway.errorHandler(err);
      res.status(statusCode).json({ error });
    }
  };
}

function buildRequest(req, route) {
  const request = {
    payload: req.body,
    params: req.params,
    query: req.query,
    headers: req.headers,
    context: {
      user: req.user,
    },
  };

  if (req.file && route.upload) {
    request.file = {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      encoding: req.file.encoding,
      size: req.file.size,
      buffer: req.file.buffer,
    };
    request.context.file = req.file;
  }

  return request;
}

async function sendResponse(res, response) {
  // Обработка файлов из S3
  if (response.data instanceof S3Storage) {
    return sendFileResponse(res, response.data);
  }

  // Обычный JSON ответ
  const statusCode = response.error 
    ? getHttpStatusCode(response.error.code) 
    : 200;

  res.status(statusCode).json(response);
}


async function sendFileResponse(res, storage) {
  const meta = storage.getMeta();
  
  res.setHeader('Content-Type', meta.mimetype);
  res.setHeader('Content-Length', meta.size);
  res.setHeader('Content-Disposition', `attachment; filename="${meta.filename}"`);
  
  const buffer = await storage.getBuffer();
  res.end(buffer);
}


function getHttpStatusCode(errorCode) {
  if (!errorCode) return 500;
  
  return ERROR_CODE_TO_HTTP_STATUS[errorCode] 
    || (errorCode.startsWith('ERR_CLIENT') ? 400 : 500);
}

function handleFileUpload(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('File upload error:', err);
      const { error, statusCode } = Gateway.errorHandler(err);
      return res.status(statusCode).json({ error });
    }
    next();
  });
}