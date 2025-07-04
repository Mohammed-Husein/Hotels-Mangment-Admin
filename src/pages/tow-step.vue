<script setup lang="ts">
import { useEmployeeStore } from "@/stores/storeEmp";
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";
import { VOtpInput } from "vuetify/components";

import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png";
const { t, locale } = useI18n();
definePage({
  meta: {
    layout: "blank",
  },
});

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark
);

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);
const isOtpInserted = ref(false);
const EmpStore = useEmployeeStore();
const { code, emailValue } = storeToRefs(EmpStore);
const onFinish = () => {
  isOtpInserted.value = true;

  setTimeout(() => {
    isOtpInserted.value = false;
    EmpStore.ConfirmForgetPassword();
  }, 2000);
};
const obfuscatedEmail = computed(() => {
  if (!emailValue.value) return "";

  const [localPart, domainPart] = emailValue.value.split("@");
  const obfuscatedLocal = localPart[0] + "*".repeat(localPart.length - 1);
  const [domainName, domainExt] = domainPart.split(".");
  const obfuscatedDomain =
    domainName[0] + "*".repeat(domainName.length - 1) + "." + domainExt;

  return `${obfuscatedLocal}@${obfuscatedDomain}`;
});
</script>

<template>
  <VRow class="auth-wrapper bg-surface" no-gutters dir="rtl">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background rounded-lg w-100 ma-3 me-0">
        <div class="d-flex align-center justify-center w-100 h-90">
          <VImg max-width="368" :src="authThemeImg" />
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
          <div class="flex justify-center">
            <img src="@/assets/images/logo.svg" alt="" class="mb-5" />
          </div>
          <h5 class="text-h5 mb-1">التحقق بخطوتين 💬</h5>
          <p class="mb-2">
            لقد أرسلنا رمز التحقق إلى البريد الالكتروني. أدخل الرمز من البريد
            الإلكتروني في الحقل أدناه.
          </p>
          <h6 class="text-base font-weight-medium">{{ obfuscatedEmail }}</h6>
        </VCardText>

        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <label for="">اكتب رمز التحقق المكون من 6 أرقام</label>
                <VOtpInput
                  v-model="code"
                  :disabled="isOtpInserted"
                  type="number"
                  class="pa-0"
                  @finish="onFinish"
                />
              </VCol>

              <!-- reset password -->
              <VCol cols="12">
                <VBtn
                  block
                  :loading="isOtpInserted"
                  :disabled="isOtpInserted"
                  type="submit"
                >
                  التحقق من حسابي
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <div class="d-flex justify-center align-center flex-wrap">
                  <span class="me-1">لم تحصل على رمز؟</span>
                  <span
                    class="text-primary cursor-pointer"
                    @click="EmpStore.ForgetPassword()"
                  >
                    إعادة الارسال
                  </span>
                </div>
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
