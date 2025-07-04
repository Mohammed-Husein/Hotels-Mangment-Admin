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
        //server error -> 500
        for (const key in response.data) {
          console.log(key, response.data[key]);
          if (key == "message")
            toast.error(response.data[key], { timeout: 10000 });
        }

        //Validation Error -> 400
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
      } else if (response.message) {
        toast.error(response.message);
      } else if (response.statusText) {
        toast.error(response.statusText);
      } else if (response.status == 401) {
        toast.warning("You must be logged in! Please login first");
      } else {
        toast.error("Unknown Error, Please report to system admin.");
      }
    } else if (typeof notifications == "string") {
      toast.error(notifications);
    }
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
