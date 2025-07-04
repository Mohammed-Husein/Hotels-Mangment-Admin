import { EMPLOYEE_API } from "@/api/home/endPoint";
import { useApi } from "@/composables";

export const useEmployeeStore = defineStore("Employee", () => {
  const { GET, POST, DELETE } = useApi();

  const emailValue = ref("");
  const code = ref("");
  const router = useRouter();
  async function ForgetPassword() {
    const response = await POST(EMPLOYEE_API.ForgetPassword, {
      email: emailValue.value,
    });
    console.log(response?.status);

    if (response?.status == 200) router.push("/tow-step");
    return response;
  }

  async function ConfirmForgetPassword() {
    const response = await POST(EMPLOYEE_API.ConfirmForgetPassword, {
      email: emailValue.value,
      code: code.value,
    });
    console.log(response?.status);

    if (response?.status == 200) router.push("/reset-password");
    return response;
  }
  // reset password
  async function ResetPassword(payload: any) {
    const response = await POST(EMPLOYEE_API.ResetPassword, payload);
    if (response?.status == 200) return response;
  }
  return {
    emailValue,
    code,
    ForgetPassword,
    ConfirmForgetPassword,
    ResetPassword,
  };
});
