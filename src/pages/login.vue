<script setup lang="ts">
import { useAppStore } from "@/stores/App";
import { useGenerateImageVariant } from "@core/composable/useGenerateImageVariant";
import authV2LoginIllustrationBorderedDark from "@images/pages/auth-v2-login-illustration-bordered-dark.png";
import authV2LoginIllustrationBorderedLight from "@images/pages/auth-v2-login-illustration-bordered-light.png";
import authV2LoginIllustrationDark from "@images/pages/auth-v2-login-illustration-dark.png";
import authV2LoginIllustrationLight from "@images/pages/auth-v2-login-illustration-light.png";
import authV2MaskDark from "@images/pages/misc-mask-dark.png";
import authV2MaskLight from "@images/pages/misc-mask-light.png";
import { VNodeRenderer } from "@layouts/components/VNodeRenderer";
import { themeConfig } from "@themeConfig";
const { t, locale } = useI18n();

definePage({
  meta: {
    layout: "blank",
  },
});
const userDto = reactive({
  email: "",
  password: "",
  remember: false,
});
const isLoading = ref(false);
const { Login } = useAuth();
const appStore = useAppStore();
function submitLogin() {
  isLoading.value = true;

  Login(userDto)
    .then((response) => {
      appStore.startupCalls();
      if (response.status == 200) {
        // router.push("/");
      } else {
        isLoading.value = false;
      }
    })
    .catch((error) => {
      isLoading.value = false;
    });
}

const isPasswordVisible = ref(false);

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true
);

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark);
</script>

<template>
  <VRow no-gutters class="auth-wrapper bg-surface" dir="rtl">
    <VCol md="8" class="d-none d-md-flex">
      <div class="position-relative bg-background rounded-lg w-100 ma-3 me-0">
        <div class="d-flex align-center justify-center w-100 h-90">
          <VImg max-width="505" :src="authThemeImg" class="auth-illustration" />
        </div>

        <VImg class="auth-footer-mask" :src="authThemeMask" />
      </div>
    </VCol>

    <VCol
      cols="12"
      md="4"
      class="auth-card-v2 d-flex align-center justify-center"
    >
      <VCard flat :max-width="500" class="mt-sm-0 pa-4 h-[80%]">
        <VCardText>
          <VNodeRenderer :nodes="themeConfig.app.logo" class="mb-1" />
          <h4 class="text-h4 mb-1">مرحباً بكم في BE THE BEST EDUCATION! 👋</h4>
          <p class="mb-0">يرجى تسجيل الدخول إلى حسابك وبدء المغامرة</p>
        </VCardText>
        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="userDto.email"
                  autofocus
                  label="البريد الألكتروني"
                  type="email"
                  placeholder="johndoe@email.com"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <div
                  class="d-flex align-center flex-wrap justify-space-between mt-1 mb-1"
                >
                  <label>كلمة المرور</label>
                  <a class="text-primary ms-2" href="/forgetPassword">
                    هل نسيت كلمة المرور
                  </a>
                </div>
                <AppTextField
                  v-model="userDto.password"
                  placeholder="············"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div
                  class="d-flex align-center flex-wrap justify-space-between mt-1 mb-1"
                >
                  <VCheckbox v-model="userDto.remember" label="تذكرني" />
                  <!-- <a class="text-primary ms-2" href="/forgetPassword">
                  هل نسيت كلمة المرور
                  </a> -->
                </div>

                <VBtn block type="submit" @click="submitLogin">
                  تسجيل الدخول
                </VBtn>
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
