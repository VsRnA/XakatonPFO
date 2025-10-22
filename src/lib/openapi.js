import $RefParser from 'json-schema-ref-parser';
import OpenApiRequest from 'openapi-request-validator';
import OpenApiCoercer from 'openapi-request-coercer';

const OpenAPIRequestValidator = OpenApiRequest.default;
const OpenAPIRequestCoercer = OpenApiCoercer.default;

const ajvOptions = {
  discriminator: true,
};

export async function loadOpenapiRoutes(schemaFile) {
  const openapi = await $RefParser.dereference(schemaFile);
  return Object
    .entries(openapi?.paths || {})
    .map(
      ([path, methods]) => Object
        .entries(methods)
        .map(([verb, props]) => ({
          path: path
            .replace(/\{(.*?)\}/g, (_, paramName) => `:${paramName}`)
            .replace(/^\/api|\/$/g, ''),
            verb,
          operationId: props.operationId,
          validator: new OpenAPIRequestValidator({ ...props, ajvOptions }),
          typeCast: props.parameters ? new OpenAPIRequestCoercer(props) : null,
        })),
    )
    .flat(1);
}

export function validateRequest(request, openapiRoute) {
  const contentType = request.headers?.['content-type'] || '';
  
  // Костыль поправить, если будет время
  if (contentType.includes('multipart/form-data')) {
    return request;
  }

  const httpRequest = {
    headers: request.headers || {
      'content-type': 'application/json',
    },
    params: request.params || {},
    query: request.query || {},
    body: request.payload || {},
  };

  if (openapiRoute.typeCast) openapiRoute.typeCast.coerce(httpRequest);

  const validationProblems = openapiRoute.validator.validateRequest(httpRequest);

  if (validationProblems) {
    throw new Error('Request validation fails')
  }

  return {
    ...request,
    params: httpRequest.params,
    query: httpRequest.query,
  };
}
