import { AuthService } from '../../domain/services/AuthService.js';

/**
 * Middleware: التحقق من وجود وصحة رمز الدخول
 */
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      errorType: 'AuthenticationError',
      message: 'غير مصرح: يجب تسجيل الدخول للوصول إلى هذا المورد'
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = AuthService.verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      errorType: 'AuthenticationError',
      message: 'رمز الدخول غير صالح أو منتهي الصلاحية، يرجى تسجيل الدخول مجدداً'
    });
  }

  req.user = payload;
  next();
}

/**
 * Middleware: التحقق من امتلاك المستخدم للدور المطلوب (RBAC)
 * @param {Array<string>} allowedRoles 
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        errorType: 'AuthenticationError',
        message: 'غير مصرح: يرجى تسجيل الدخول'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        errorType: 'AuthorizationError',
        message: `غير مصرح: دورك الحالي (${req.user.role}) لا يملك الصلاحية لتنفيذ هذا الإجراء`
      });
    }

    next();
  };
}

/**
 * Middleware اختياري: يحدد هوية المستخدم إن وُجد الرمز دون منع الوصول إن لم يوجد
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = AuthService.verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}
