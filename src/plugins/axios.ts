import { isLoggedIn } from "@/@core/composable/useAuth";
import { useAuth } from "@/composables";
import { useAppStore } from "@/stores/App";
import type { Axios, AxiosError, AxiosHeaders } from "axios";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { API_URL } from "@/../app.config";

const errorHandler = async (error: AxiosError) => {
  const { RefreshToken, GetRefreshTokenEndPoint } = useAuth();

  const router = useRouter();

  // useAppStore().$patch({ isLoading: false });

  let config: AxiosRequestConfig | undefined | any = error?.config;

  if (error.config?.url == GetRefreshTokenEndPoint()) {
    router.push("/login");

    return;
  }

  if (
    error.response?.status === 401 &&
    error.config?.url != GetRefreshTokenEndPoint() &&
    !config._retry
  ) {
    config._retry = true;

    return new Promise(function (resolve, reject) {
      RefreshToken()
        .then((token) => {
          config.headers["Authorization"] = "Bearer " + token;
          resolve(axios(config));
        })
        .catch((err) => {
          router.push("/login");
          return;
        });
    });
  }

  return Promise.reject(error);
};

const tokenExpirationThreshold = 60 * 5; // Set the threshold for refreshing the token in seconds (e.g., before 5 minutes from expiry)
//TO/DO: Add rememberMe Logic
const requestHandler = async (request: AxiosRequestConfig) => {
  // Show loading indicator
  if (request.params && request.params.loading !== false)
    useAppStore().$patch({ isLoading: true });

  const rememberMe = localStorage.getItem("rememberMe") == "true";
  // Modify the request only when user logged in
  if (isLoggedIn()) {
    const {
      GetAccessToken,
      GetAccessTokenDecoded,
      RefreshToken,
      GetRefreshTokenEndPoint,
      LogOut,
    } = useAuth();
    const expirationTime = GetAccessTokenDecoded()?.exp * 1000; // Convert expiration time to milliseconds
    const currentTime = Date.now();
    if (
      expirationTime - currentTime <= tokenExpirationThreshold * 1000 &&
      request.url != GetRefreshTokenEndPoint()
    ) {
      //logout beacuse token is about to expire and you don't want to be remeberd
      if (!rememberMe) {
        LogOut();
        //stop the request
        return false;
      }
      // Token is about to expire or has already expired, so refresh it and update the stored access token
      await RefreshToken();
    }

    // Update the Authorization header with the current access token
    if (request.headers) {
      request.headers.Authorization = `Bearer ${GetAccessToken()}`;
    }
  }
  //Continue proccing request
  return request;
};

// const requestHandler = (request: AxiosRequestConfig) => {
//   if (request.params && request.params.loading !== false)
//     useAppStore().$patch({ isLoading: true })

//   const { GetAccessToken } = useAuth()

//   if (request.headers)
//     request.headers.Authorization = `Bearer ${GetAccessToken()}`

//   return request
// }

const responseHandler = (response: AxiosResponse) => {
  useAppStore().$patch({ isLoading: false });

  return response;
};

const axiosIns = axios.create({
  baseURL: API_URL,
  headers: {
    lang: useNavigatorLanguage().language.value,
    "tz-offset": "03:00:00",
  },
});

axiosIns.interceptors.request.use(requestHandler as any);
axiosIns.interceptors.response.use(responseHandler, errorHandler);

export { axiosIns };

// // const progressHandler = (progressEvent: any) => {
// //     console.log('in progress', progressEvent);

//     // const total = parseFloat(progressEvent.currentTarget.responseHeaders['Content-Length'])
//     // const current = progressEvent.currentTarget.response.length

//     // let percentCompleted = Math.floor(current / total * 100)

// // }
