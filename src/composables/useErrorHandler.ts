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
    const errorData = error?.response?.data;
    let message = 'حدث خطأ في الخادم';

    // Handle new validation error format: {status: "fail", message: "...", errors: [...]}
    if (errorData?.status === "fail" && errorData?.errors && Array.isArray(errorData.errors)) {
      if (errorData.message) {
        message = errorData.message;
      } else {
        message = 'خطأ في البيانات المدخلة';
      }

      // Log detailed errors for debugging
      console.log('Validation errors:', errorData.errors);

      return handleError(error, operation, {
        fallbackMessage: message,
        validationErrors: errorData.errors
      });
    }

    switch (statusCode) {
      case 400:
        message = errorData?.message || 'البيانات المرسلة غير صحيحة';
        break;
      case 401:
        message = errorData?.message || 'غير مصرح لك بالوصول';
        break;
      case 403:
        message = errorData?.message || 'ليس لديك صلاحية لتنفيذ هذه العملية';
        break;
      case 404:
        message = errorData?.message || 'العنصر المطلوب غير موجود';
        break;
      case 409:
        message = errorData?.message || 'البيانات موجودة مسبقاً';
        break;
      case 422:
        message = errorData?.message || 'البيانات المدخلة غير صالحة';
        break;
      case 500:
        message = errorData?.message || 'خطأ في الخادم الداخلي';
        break;
      case 503:
        message = errorData?.message || 'الخدمة غير متاحة حالياً';
        break;
      default:
        if (errorData?.message) {
          message = errorData.message;
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
