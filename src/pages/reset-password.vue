<script setup lang="ts">
import { useEmployeeStore } from "@/stores/storeEmp";
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";

import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png";
definePage({
  meta: {
    layout: "blank",
  },
});

const isLoading = ref(false);
const { locale, t } = useI18n();
const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark
);

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);

const isPasswordVisible = ref(false);
const isConfirmPasswordVisible = ref(false);
const EmpStore = useEmployeeStore();
const { emailValue, code } = storeToRefs(EmpStore);
const form = ref({
  newPassword: "",
  confirmPassword: "",
  code: code.value,
  email: emailValue.value,
});
const { Login } = useAuth();
function submitLogin() {
  isLoading.value = true;

  EmpStore.ResetPassword({ ...form.value })
    .then((response) => {
      isLoading.value = false;
      if (response?.status == 200) {
        Login({
          email: emailValue.value,
          password: form.value.newPassword,
        });
      }
    })
    .catch(() => {
      isLoading.value = false;
    });
}
</script>

<template>
  <VRow no-gutters class="auth-wrapper bg-surface" dir="rtl">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background rounded-lg w-100 ma-3 me-0">
        <div class="d-flex align-center justify-center w-100 h-90">
          <VImg max-width="320" :src="authThemeImg" class="auth-illustration" />
        </div>

        <VImg class="auth-footer-mask" :src="authThemeMask" />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard flat :max-width="500" class="mt-sm-0 pa-4 h-[100%]">
        <VCardText>
          <div class="flex justify-center h-32">
            <img src="@/assets/images/logo.svg" alt="" class="mb-5" />
          </div>
          <h4 class="text-h4">إعادة تعيين كلمة المرور 🔒</h4>
          <p class="mb-0">
            ل <span class="font-weight-bold"> {{ emailValue }}</span>
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="form.newPassword"
                  autofocus
                  class="mb-0"
                  label="كلمة المرور الجديدة"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- Confirm Password -->
              <VCol cols="12">
                <AppTextField
                  class="mb-0"
                  v-model="form.confirmPassword"
                  label="تأكيد كلمة المرور الجديدة"
                  placeholder="············"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isConfirmPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="
                    isConfirmPasswordVisible = !isConfirmPasswordVisible
                  "
                  :rules="[
                    requiredValidator,
                    confirmedValidator(form.confirmPassword, form.newPassword),
                  ]"
                />
              </VCol>

              <!-- Set password -->
              <VCol cols="12">
                <VBtn
                  @click="submitLogin"
                  :loading="isLoading"
                  block
                  class="mb-0"
                  type="submit"
                >
                  تعيين كلمة المرور الجديدة
                </VBtn>
              </VCol>
              <VCol cols="12">
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="'/login'"
                >
                  <span> العودة لتسجيل الدخول</span>
                  <VIcon icon="tabler-chevron-left" class="flip-in-ltr" />
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>
