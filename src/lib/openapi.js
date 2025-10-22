import $RefParser from 'json-schema-ref-parser';
import OpenApiRequest from 'openapi-request-validator';
import OpenApiCoercer from 'openapi-request-coercer';
import { ValidationError } from '#errors';

const OpenAPIRequestValidator = OpenApiRequest.default;
const OpenAPIRequestCoercer = OpenApiCoercer.default;

const AJV_OPTIONS = {
  discriminator: true,
};

const DEFAULT_HEADERS = {
  'content-type': 'application/json',
};


export async function loadOpenapiRoutes(schemaFile) {
  const openapi = await $RefParser.dereference(schemaFile);
  
  return Object.entries(openapi?.paths || {})
    .flatMap(([path, methods]) => 
      Object.entries(methods).map(([verb, props]) => ({
        path: normalizePath(path),
        verb,
        operationId: props.operationId,
        validator: new OpenAPIRequestValidator({ 
          ...props, 
          ajvOptions: AJV_OPTIONS 
        }),
        typeCast: props.parameters 
          ? new OpenAPIRequestCoercer(props) 
          : null,
      }))
    );
}

function normalizePath(path) {
  return path
    .replace(/\{([^}]+)\}/g, (_, paramName) => `:${paramName}`)
    .replace(/^\/api|\/$/g, '');
}

export function validateRequest(request, openapiRoute) {
  const contentType = request.headers?.['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return request;
  }

  const httpRequest = {
    headers: request.headers || DEFAULT_HEADERS,
    params: request.params || {},
    query: request.query || {},
    body: request.payload || {},
  };

  if (openapiRoute.typeCast) {
    openapiRoute.typeCast.coerce(httpRequest);
  }

  const validationErrors = openapiRoute.validator.validateRequest(httpRequest);
  
  if (validationErrors) {
    throw new ValidationError('Ошибка валидации запроса', {
      code: 'REQUEST_VALIDATION_FAILED',
      data: {
        errors: formatValidationErrors(validationErrors.errors),
        operationId: openapiRoute.operationId,
      },
    });
  }

  return {
    ...request,
    params: httpRequest.params,
    query: httpRequest.query,
  };
}

function formatValidationErrors(errors) {
  if (!errors || !Array.isArray(errors)) {
    return [];
  }

  return errors.map(error => ({
    path: error.path || error.dataPath || 'unknown',
    message: error.message,
    ...(error.params && { params: error.params }),
    ...(error.errorCode && { code: error.errorCode }),
  }));
}