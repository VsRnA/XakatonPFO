export default class Gateway {
  static async handler({ route, request, validate }) {
    const commonRequest = {
      payload: {},
      params: {},
      query: {},
      context: {},
      ...request,
    };
    
    try {
      const data = await route.handler(validate ? validate(commonRequest) : commonRequest);
      return { data, statusCode: 200 };
    } catch (err) {
      const { error, statusCode } = Gateway.errorHandler(err);
      return { error, statusCode };
    }
  }

  static errorHandler(err) {
    if (err.statusCode && err.code) {
      const error = {
        code: err.code,
        message: err.message,
      };

      if (err.data && Object.keys(err.data).length > 0) {
        error.data = err.data;
      }

      return {
        statusCode: err.statusCode,
        error,
      };
    }

    console.error('Unhandled error:', err);

    return {
      statusCode: 500,
      error: {
        code: 'ERR_INTERNAL',
        message: process.env.NODE_ENV === 'development' 
          ? err.message || 'Внутренняя ошибка сервера'
          : 'Внутренняя ошибка сервера',
      },
    };
  }
}