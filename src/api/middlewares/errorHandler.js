import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map(e => e.message).join(' | ');
    return res.status(400).json({
      success: false,
      errorType: 'ValidationError',
      message: errorMessages,
      details: err.errors
    });
  }

  // If explicit status code provided
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      errorType: 'BusinessRuleError',
      message: err.message
    });
  }

  // Handle expected business/validation errors gracefully
  const isBusinessError = err.message && (
    err.message.includes('غير موجود') ||
    err.message.includes('مسجل مسبقاً') ||
    err.message.includes('مرحل مسبقاً') ||
    err.message.includes('ملغى') ||
    err.message.includes('يجب') ||
    err.message.includes('خطأ محاسبي') ||
    err.message.includes('لا توجد شرائح')
  );

  const statusCode = isBusinessError ? 400 : 500;
  const errorType = isBusinessError ? 'BusinessRuleError' : 'InternalServerError';
  const message = isBusinessError ? err.message : 'حدث خطأ داخلي في الخادم أثناء معالجة الطلب';

  return res.status(statusCode).json({
    success: false,
    errorType,
    message
  });
}
