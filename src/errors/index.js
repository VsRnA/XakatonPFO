export class ValidationError extends Error {
  constructor(message = 'Ошибка валидации данных') {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.code = 'ERR_VALIDATION';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'Ресурс не найден') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.code = 'ERR_NOT_FOUND';
  }
}

export class ConflictError extends Error {
  constructor(message = 'Конфликт данных') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.code = 'ERR_CONFLICT';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Доступ запрещен') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.code = 'ERR_FORBIDDEN';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Требуется авторизация') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.code = 'ERR_UNAUTHORIZED';
  }
}