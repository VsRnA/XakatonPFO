import express from 'express';
import passport from 'passport';
import Gateway from '#infrastructure/gateway.js';
import * as allRoutes from '#routes';
import { loadOpenapiRoutes, validateRequest } from '#lib/openapi.js';
import Auth from '../../config/passport.js';
import multer from 'multer';
import S3Storage from '#lib/storage.js';

const MAP_APP_ERROR_CODE_TO_HTTP = {
  ERR_NOT_FOUND: 404,
  ERR_VALIDATION: 400,
  ERR_CONFLICT: 409,
  ERR_FORBIDDEN: 403,
  ERR_UNAUTHORIZED: 401,
};

const openapiRoutes = (await loadOpenapiRoutes('src/docs/openapi.yml'))
  .reduce((list, route) => {
    if (!list[route.path]) list[route.path] = {};
    list[route.path][route.verb] = route;
    return list;
  }, {});

export default function createExpressGateway(eventBus) {
  const router = express.Router();
  const auth = Auth(passport);

  Object.values(allRoutes).forEach((routes) => {
    routes.forEach((route) => {
      try {
        const openapiRoute = openapiRoutes[route.path]?.[route.verb];
        if (!openapiRoute) {
          throw new Error('Route is not described in OpenAPI');
        }

        const middlewares = [];

        if (route.authedOnly) {
          middlewares.push((req, res, next) => {
            auth.authenticate(req, res, next);
          });
        }

        if (route.upload) {
          middlewares.push(handleUploadFiles);
        }

        middlewares.push(getExpressController(route, openapiRoute, eventBus));
        
        router[route.verb](`/api${route.path}`, ...middlewares);
      } catch (err) {
        console.error(`Failed to register route ${route.verb.toUpperCase()} /api${route.path}:`, err.message);
      }
    });
  });
  
  return router;
}

function getHttpErrorCode(errorCode) {
  return MAP_APP_ERROR_CODE_TO_HTTP[errorCode]
    || (errorCode?.startsWith('ERR_CLIENT') ? 400 : 500);
}

function getExpressController(route, openapiRoute) {
  return async (req, res) => {
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

      request.context = {
        ...request.context,
        file: req.file
      };
    }
    
    const response = await Gateway.handler({ 
      route, 
      request, 
      validate: () => validateRequest(request, openapiRoute) 
    });
    
    const httpStatus = response.error ? getHttpErrorCode(response.error.code || '') : 200;

    if (response.data && response.data instanceof S3Storage) {
      const meta = response.data.getMeta();
      res.setHeader('Content-Type', meta.mimetype);
      res.setHeader('Content-Length', meta.size);
      res.setHeader('Content-Disposition', `attachment; filename="${meta.filename}"`);
      return res.end(await response.data.getBuffer());
    }

    return res.status(httpStatus).json(response);
  };
}

function handleUploadFiles(req, res, next) {
  const upload = multer({ storage: multer.memoryStorage() });
  upload.single('file')(req, res, (err) => {
    if (err) res.status(500).json(Gateway.errorHandler(err));
    next();
  });
}