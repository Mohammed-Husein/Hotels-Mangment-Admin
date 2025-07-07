import { useToast } from 'vue-toastification';

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export const useErrorHandler = () => {
  const toast = useToast();

  const handleError = (
    error: any, 
    context: string = 'عملية غير محددة',
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = 'حدث خطأ غير متوقع'
    } = options;

    let errorMessage = fallbackMessage;

    // استخراج رسالة الخطأ
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // تسجيل الخطأ في وحدة التحكم
    if (logError) {
      console.error(`خطأ في ${context}:`, {
        error,
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
    }

    // عرض رسالة الخطأ للمستخدم
    if (showToast) {
      toast.error(errorMessage);
    }

    return {
      message: errorMessage,
      originalError: error
    };
  };

  const handleApiError = (error: any, operation: string) => {
    const statusCode = error?.response?.status;
    let message = 'حدث خطأ في الخادم';

    switch (statusCode) {
      case 400:
        message = 'البيانات المرسلة غير صحيحة';
        break;
      case 401:
        message = 'غير مصرح لك بالوصول';
        break;
      case 403:
        message = 'ليس لديك صلاحية لتنفيذ هذه العملية';
        break;
      case 404:
        message = 'العنصر المطلوب غير موجود';
        break;
      case 409:
        message = 'البيانات موجودة مسبقاً';
        break;
      case 422:
        message = 'البيانات المدخلة غير صالحة';
        break;
      case 500:
        message = 'خطأ في الخادم الداخلي';
        break;
      case 503:
        message = 'الخدمة غير متاحة حالياً';
        break;
      default:
        if (error?.response?.data?.message) {
          message = error.response.data.message;
        }
    }

    return handleError(error, operation, { fallbackMessage: message });
  };

  const handleValidationError = (validationErrors: any) => {
    if (Array.isArray(validationErrors)) {
      const messages = validationErrors.map(err => err.message || err).join(', ');
      return handleError(messages, 'التحقق من صحة البيانات');
    }
    
    if (typeof validationErrors === 'object') {
      const messages = Object.values(validationErrors).flat().join(', ');
      return handleError(messages, 'التحقق من صحة البيانات');
    }

    return handleError(validationErrors, 'التحقق من صحة البيانات');
  };

  return {
    handleError,
    handleApiError,
    handleValidationError
  };
};
