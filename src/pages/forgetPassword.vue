<script setup lang="ts">
import { useEmployeeStore } from "@/stores/storeEmp";

import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";
definePage({
  meta: {
    layout: "blank",
  },
});

const email = ref("");
const isLoading = ref(false);
const { locale, t } = useI18n();

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark
);

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);
const EmpStore = useEmployeeStore();
const { emailValue } = storeToRefs(EmpStore);
function submitLogin() {
  isLoading.value = true;

  EmpStore.ForgetPassword().catch((error) => {
    isLoading.value = false;
  });
}
</script>

<template>
  <VRow class="auth-wrapper bg-surface" no-gutters dir="rtl">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background rounded-lg w-100 ma-3 me-0">
        <div class="d-flex align-center justify-center w-100 h-90">
          <VImg
            max-width="362"
            :src="authThemeImg"
            class="auth-illustration mt-1 mb-2"
          />
        </div>

        <VImg class="auth-footer-mask" :src="authThemeMask" />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard flat :max-width="500" class="mt-sm-0 pa-4 h-[90%]">
        <VCardText>
          <div class="flex justify-center">
            <img src="@/assets/images/logo.svg" alt="" class="mb-5" />
          </div>
          <h5 class="text-h5 mb-1">🔒نسيت كلمة المرور؟</h5>
          <p class="mb-0">
            أدخل بريدك الإلكتروني، وسنرسل لك تعليمات لإعادة تعيين كلمة المرور
            الخاصة بك
          </p>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="emailValue"
                  autofocus
                  label="البريد الالكتروني"
                  placeholder="johndoe@email.com"
                  type="email"
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>

              <!-- Reset link -->
              <VCol cols="12">
                <VBtn
                  @click="submitLogin"
                  block
                  type="submit"
                  :loading="isLoading"
                >
                  إرسال رمز التحقق
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="'/login'"
                >
                  <span>العودة لتسجيل الدخول</span>
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
