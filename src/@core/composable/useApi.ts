// ! DONT TOUCH THIS FILE

import { axiosIns } from "@/plugins/axios";
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { serialize } from "object-to-formdata";
import type { SweetAlertOptions } from "sweetalert2";
import Swal from "sweetalert2";
import { useToast } from "vue-toastification";

interface NotificationsType {
  error?: string | boolean;
  comfirm?: SweetAlertOptions | boolean;
  success?: string | boolean;
}
interface paramsType {
  [param: string]: any;
}
const defaultSerializerOptions = {
  indices: true,
  dotsForObjectNotation: true,
  noFilesWithArrayNotation: true,
};

const defaultPostNotifications: NotificationsType = {
  comfirm: false,
  success: false,
  error: true,
};

const defaultGetNotification: NotificationsType = {
  comfirm: false,
  success: false,
  error: true,
};

const defaultDeleteNotification: NotificationsType = {
  comfirm: {
    title: "حذف",
    text: "هل تريد بالتأكيد حذف العنصر المحدد ؟",
    icon: "warning",
    confirmButtonText: "تأكيد",
    cancelButtonText: "إلغاء",
  },
  error: true,
  success: "تم الحذف بنجاح",
};

export const useApi = () => {
  const toast = useToast();

  //Global error handler
  const handleErrorMessage = (
    { response }: AxiosError | any,
    notifications: string | boolean
  ) => {
    console.log("inside error handler");

    if (typeof notifications == "boolean" && response) {
      console.log("Error Handler Catch", response);
      if (response.data) {
        // Handle validation errors with new format: {status: "fail", message: "...", errors: [...]}
        if (response.data.status === "fail" && response.data.errors && Array.isArray(response.data.errors)) {
          // Show main error message
          if (response.data.message) {
            toast.error(response.data.message, { timeout: 8000 });
          }

          // Show individual field errors
          response.data.errors.forEach((error: any) => {
            if (error.field && error.message) {
              toast.error(`${getFieldDisplayName(error.field)}: ${error.message}`, {
                timeout: 10000,
                position: "top-right"
              });
            } else if (typeof error === 'string') {
              toast.error(error, { timeout: 8000 });
            }
          });
          return;
        }

        // Handle old validation error format
        if (response.data.errors) {
          for (const key in response.data.errors) {
            if (
              Object.prototype.hasOwnProperty.call(response.data.errors, key)
            ) {
              const errorType = response.data.errors[key];
              if (
                typeof errorType == "object" &&
                key != "request" &&
                Array.isArray(errorType)
              ) {
                errorType.forEach((msg) => {
                  toast.error(msg);
                });
              }
            }
          }
        }

        // Handle server errors
        if (response.data.message && !response.data.errors) {
          toast.error(response.data.message, { timeout: 10000 });
        }
      } else if (response.message) {
        toast.error(response.message);
      } else if (response.statusText) {
        toast.error(response.statusText);
      } else if (response.status == 401) {
        toast.warning("يجب عليك تسجيل الدخول أولاً");
      } else {
        toast.error("خطأ غير معروف، يرجى الإبلاغ عن المشكلة لمدير النظام.");
      }
    } else if (typeof notifications == "string") {
      toast.error(notifications);
    }
  };

  // Helper function to get display names for fields in Arabic
  const getFieldDisplayName = (fieldName: string): string => {
    const fieldNames: Record<string, string> = {
      'password': 'كلمة المرور',
      'email': 'البريد الإلكتروني',
      'phoneNumber': 'رقم الهاتف',
      'fullName': 'الاسم الكامل',
      'firstName': 'الاسم الأول',
      'lastName': 'الاسم الثاني',
      'countryId': 'البلد',
      'cityId': 'المدينة',
      'regionId': 'المنطقة',
      'role': 'الدور الوظيفي',
      'confirmPassword': 'تأكيد كلمة المرور',
      'alternatePhoneNumber': 'رقم الهاتف البديل',
      'preferredLanguage': 'اللغة المفضلة',
      'detailedAddress': 'العنوان التفصيلي',
      'deviceToken': 'رمز الجهاز',
      'notes': 'الملاحظات',
      'permissions': 'الصلاحيات',
      'status': 'الحالة'
    };

    return fieldNames[fieldName] || fieldName;
  };

  const GET = async <T>(
    url: string,
    params?: paramsType,
    notifications: NotificationsType = defaultGetNotification,
    config?: AxiosRequestConfig
  ) => {
    try {
      const response = await axiosIns.get<T>(url, { params, ...config });

      return { ...response, data: response.data as T };
    } catch (error) {
      if (notifications.error) handleErrorMessage(error, notifications.error);

      throw error;
    }
  };

  const POST = async <ResT, ReqT>(
    url: string,
    body: ReqT,
    notifications: NotificationsType = defaultPostNotifications,
    config: AxiosRequestConfig & { formData?: boolean; isObject?: boolean } = {}
  ) => {
    try {
      let response;
      if (config.formData) {
        response = await axiosIns.post<ReqT, AxiosResponse<ResT>, FormData>(
          url,
          serialize(body, defaultSerializerOptions),
          { ...config }
        );
      } else if (config.isObject) {
        response = await axiosIns.post<ReqT, AxiosResponse<ResT>, ReqT>(
          url,
          body,
          { ...config }
        );
      } else {
        response = await axiosIns.post<ReqT, AxiosResponse<ResT>, ReqT>(
          url,
          { ...body },
          { ...config }
        );
      }

      if (notifications.success && response.status === 200) {
        if (typeof notifications.success == "string")
          toast.success(notifications.success);
        else toast.success("success");
      }

      return response;
    } catch (error) {
      if (notifications.error) {
        console.log("Error Catched", error);
        handleErrorMessage(error, notifications.error);
        throw error;
      }
    }
  };

  const DELETE = async (
    url: string,
    body: any,
    params?: paramsType,
    notifications?: NotificationsType,
    config?: AxiosRequestConfig
  ) => {
    let lang = document.documentElement.lang || "ar";

    const notify = notifications ? notifications : defaultDeleteNotification;

    return new Promise((resolve, reject) => {
      console.log("Delete APi", notifications);
      if (notify.comfirm && typeof notify.comfirm == "object") {
        console.log("Has Confirm");
        Swal.fire({
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#2C3E50",
          customClass: {
            confirmButton: "swal2-confirm-btn", // ✅ أضف كلاس مخصص
            cancelButton: "swal2-cancel-btn", // ✅ أضف كلاس مخصص
          },
          cancelButtonColor: "#EA545529",
          ...notify.comfirm,
        }).then((result) => {
          if (result.isConfirmed) {
            axiosIns
              .delete(url, { params, ...config, data: body })
              .then((res: any) => {
                if (res.status === 200 && typeof notify.success == "string")
                  toast.success(notify.success);

                resolve(res);
              })
              .catch((er: any) => {
                console.log("Error Catched");

                if (
                  typeof notify.error === "boolean" ||
                  typeof notify.error === "string"
                )
                  handleErrorMessage(er, notify.error);
                reject(er);
              });
          }
        });
      } else {
        axiosIns
          .delete(url, { ...params, ...config })
          .then((res: any) => {
            if (res.status === 200 && typeof notify.success == "string")
              toast.success(notify.success);

            resolve(res);
          })
          .catch((er: any) => {
            if (
              typeof notify.error === "boolean" ||
              typeof notify.error === "string"
            )
              handleErrorMessage(er, notify.error);
            reject(er);
          });
      }
    });
  };
  const PUT = async <ResT, ReqT>(
    url: string,
    body: ReqT,
    notifications: NotificationsType = defaultPostNotifications,
    config: AxiosRequestConfig = {}
  ) => {
    try {
      const response = await axiosIns.put<ReqT, AxiosResponse<ResT>, ReqT>(
        url,
        body,
        {
          headers: {
            "Content-Type": "application/json",
            ...config.headers,
          },
          ...config,
        }
      );

      if (notifications.success && response.status === 200) {
        if (typeof notifications.success === "string") {
          toast.success(notifications.success);
        } else {
          toast.success("تم التعديل بنجاح");
        }
      }

      return response;
    } catch (error) {
      if (notifications.error) {
        handleErrorMessage(error, notifications.error);
        throw error;
      }
    }
  };

  return {
    GET,
    POST,
    DELETE,
    PUT,
  };
};
