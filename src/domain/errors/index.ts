export class AppError extends Error {
  public statusCode: number;
  public errorType: string;

  constructor(message: string, statusCode: number, errorType: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation Error') {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found') {
    super(message, 404, 'NOT_FOUND_ERROR');
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string = 'Business Rule Violation') {
    super(message, 400, 'BUSINESS_RULE_ERROR');
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication Failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access Denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

export class AccountingError extends AppError {
  constructor(message: string = 'Accounting Error') {
    super(message, 400, 'ACCOUNTING_ERROR');
  }
}
