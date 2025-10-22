export default class Gateway {
  static async handler({ route, request, validate }) {
    const commonRequest = {
      payload: {},
      params: {},
      query: {},
      context: {},
      ...request,
    };
    let data;
    let error;
    let statusCode = 200;
    
    try {
      data = await route.handler(validate ? validate(commonRequest) : commonRequest);
    } catch (err) {
      const errorResult = Gateway.errorHandler(err);
      error = errorResult.error;
      statusCode = errorResult.statusCode;
    }
    
    return { data, error, statusCode };
  }

  static errorHandler(unknownError) {
    if (unknownError.statusCode && unknownError.code) {
      return {
        statusCode: unknownError.statusCode,
        error: {
          code: unknownError.code,
          message: unknownError.message,
          stack: process.env.NODE_ENV === 'development' ? unknownError.stack : undefined,
        },
      };
    }

    let statusCode = 500;
    let code = 'ERR_UNKNOWN';
    let message = unknownError?.message || 'Неизвестная ошибка';

    if (unknownError instanceof Error) {
      const errorMessage = unknownError.message;
      
      if (errorMessage === 'Validation Error') {
        statusCode = 400;
        code = 'ERR_VALIDATION';
        message = 'Ошибка валидации данных';
      } else if (errorMessage === 'Not Found') {
        statusCode = 404;
        code = 'ERR_NOT_FOUND';
        message = 'Ресурс не найден';
      } else if (errorMessage === 'Conflict') {
        statusCode = 409;
        code = 'ERR_CONFLICT';
        message = 'Конфликт данных';
      } else if (errorMessage === 'Forbidden') {
        statusCode = 403;
        code = 'ERR_FORBIDDEN';
        message = 'Доступ запрещен';
      } else if (errorMessage === 'Unauthorized') {
        statusCode = 401;
        code = 'ERR_UNAUTHORIZED';
        message = 'Требуется авторизация';
      } else {
        statusCode = 500;
        code = 'ERR_INTERNAL';
        message = 'Внутренняя ошибка сервера';
      }
    }

    return {
      statusCode,
      error: {
        code,
        message,
      },
    };
  }
}