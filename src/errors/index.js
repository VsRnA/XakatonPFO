export class ValidationError extends Error {
  constructor(message = 'Ошибка валидации данных', options = {}) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.code = options.code || 'ERR_VALIDATION';
    this.data = options.data || {};
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Ресурс не найден', options = {}) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.code = options.code || 'ERR_NOT_FOUND';
    this.data = options.data || {};
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConflictError extends Error {
  constructor(message = 'Конфликт данных', options = {}) {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.code = options.code || 'ERR_CONFLICT';
    this.data = options.data || {};
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Доступ запрещен', options = {}) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.code = options.code || 'ERR_FORBIDDEN';
    this.data = options.data || {};
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Требуется авторизация', options = {}) {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.code = options.code || 'ERR_UNAUTHORIZED';
    this.data = options.data || {};
    
    Error.captureStackTrace(this, this.constructor);
  }
}