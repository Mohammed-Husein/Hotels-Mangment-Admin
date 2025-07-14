<script setup lang="ts">
import { CountryList, DefaultCountry } from "@/composables/countryList";
import { router } from "@/plugins/1.router";
import { ref } from "vue";
import { VTextField } from "vuetify/lib/components/index.mjs";
import accountData from "../../assets/images/avatars/avatar-1.png";
import { useProfileStore } from "./Profile";

const store = useProfileStore();
const userTab = ref(null);
const { t, locale } = useI18n();

const { ProfileList, ModifyMyProfileDto, ModifyMyPasswordDto } =
  storeToRefs(store);
const isLoading = ref(false);
const isPasswordVisible = ref(false);
const isPassword = ref(false);
const isCPasswordVisible = ref(false);

store
  .GetMyProfile()
  .then(() => {
    ModifyMyProfileDto.value = { ...ProfileList.value };
  })
  .catch((error: any) => {
    if (error?.response?.status === 400) {
      const errorMessage = error?.response?.data?.message || "";

      // التحقق مما إذا كان الخطأ بسبب عدم التفويض
      if (
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("autharize")
      ) {
        // إعادة التوجيه إلى صفحة تسجيل الدخول
        window.location.href = "/login";
        return;
      }
    }
  });
onMounted(async () => {
  await store.GetAllRolesNames();
  console.log(roles.value);
});
// const save = () => {
//   isLoading.value = true;
//   store
//     .ModifyMyProfile({ ...ModifyMyProfileDto.value })
//     .then((response: any) => {
//       if (response?.status === 200) {
//         ProfileList.value = { ...ModifyMyProfileDto.value };
//       }
//     })
//     .finally(() => {
//       isLoading.value = false;
//     });
// };

const ModifyMyPassword = () => {
  isLoading.value = true;
  store
    .ModifyPassword({ ...ModifyMyPasswordDto.value })
    .then((response: any) => {
      if (response?.status === 200) {
        isLoading.value = false;
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const refInputEl = ref<HTMLElement>();
const accountDataLocal = ref(structuredClone(accountData));

// changeAvatar function
const changeAvatar = (file: Event) => {
  const fileReader = new FileReader();
  const { files } = file.target as HTMLInputElement;

  if (files && files.length) {
    ModifyMyProfileDto.value.image = files[0];

    fileReader.readAsDataURL(files[0]);
    fileReader.onload = () => {
      if (typeof fileReader.result === "string")
        accountDataLocal.value = fileReader.result;
    };
  }
};

// reset avatar image
const resetAvatar = () => {
  accountDataLocal.value = accountData;
};

const ModifyMyProfile = () => {
  isLoading.value = true;
  store
    .ModifyMyProfile({ ...ModifyMyProfileDto.value })
    .then((response: any) => {
      if (response?.status === 200) {
        isLoading.value = false;
      }
    })
    .finally(() => {
      isLoading.value = false;
    });
};

const close = () => {
  router.push("./");
};
</script>

<template>
  <div class="mt-2 mb-5">
    <h2 class="text-primary">
      {{ t("Profile") }} <VIcon>tabler-user-circle</VIcon>
    </h2>
  </div>
  <div class="flex justify-start">
    <VBtn
      class="account"
      :color="userTab === 0 ? 'primary' : ''"
      @click="userTab = 0"
      :variant="userTab === 0 ? 'flat' : 'outlined'"
      :style="{
        'border-radius': locale === 'en' ? '8px 0 0 8px' : '0 8px 8px 0',
        'border-right': locale === 'en' ? 'none' : '',
        'border-left': locale === 'ar' ? 'none' : '',
      }"
    >
      <VIcon :size="18" icon="tabler-users" class="me-1" />
      <span>{{ t("Account") }}</span>
    </VBtn>
    <VBtn
      class="password"
      :color="userTab === 1 ? 'primary' : ''"
      @click="userTab = 1"
      :variant="userTab === 1 ? 'flat' : 'outlined'"
      :style="{
        'border-radius': locale === 'en' ? '0 8px 8px 0' : '8px 0 0 8px',
        'border-left': locale === 'en' ? 'none' : '',
        'border-right': locale === 'ar' ? 'none' : '',
      }"
    >
      <VIcon :size="18" icon="tabler-lock" class="me-1" />
      <span>{{ t("Scurity") }}</span>
    </VBtn>
  </div>
  <VRow>
    <VCol cols="12" md="12" lg="12">
      <VWindow
        v-model="userTab"
        class="mt-6 disable-tab-transition"
        :touch="false"
      >
        <VWindowItem class="w-full">
          <VCard class="w-[100%] h-[100%]">
            <h3 class="m-3">{{ t("Profiles.Details") }}</h3>
            <VCardText class="d-flex">
              <!-- 👉 Avatar -->

              <div
                class="w-[100px] h-[100px] ml-5 rounded-lg bg-primary flex items-center justify-center"
              >
                <VAvatar rounded size="100" :image="accountDataLocal" />
              </div>

              <!-- 👉 Upload Photo -->
              <form class="d-flex flex-column justify-center gap-4">
                <div class="d-flex flex-wrap gap-4">
                  <VBtn color="primary" @click="refInputEl?.click()">
                    <VIcon icon="tabler-cloud-upload" class="d-sm-none" />
                    <span class="d-none d-sm-block">{{
                      t("profile.newImg")
                    }}</span>
                  </VBtn>

                  <input
                    ref="refInputEl"
                    type="file"
                    name="file"
                    accept=".jpeg,.png,.jpg,GIF"
                    hidden
                    @input="changeAvatar"
                  />

                  <VBtn
                    type="reset"
                    color="secondary"
                    variant="tonal"
                    @click="resetAvatar"
                  >
                    <span class="d-none d-sm-block">{{
                      t("profile.reImg")
                    }}</span>
                    <VIcon icon="tabler-refresh" class="d-sm-none" />
                  </VBtn>
                </div>

                <p class="text-body-1 mb-0">
                  {{ t("profile.imgInfo") }}
                </p>
              </form>
            </VCardText>
            <div class="p-2">
              <v-row>
                <v-col cols="12" md="12" lg="12">
                  <label> {{ t("Profiles.Email") }}</label>
                  <VTextField v-model="ModifyMyProfileDto.email" class="mt-2">
                  </VTextField>
                </v-col>
              </v-row>
            </div>
            <div class="p-2">
              <v-row>
                <VCol cols="12" md="6" lg="6">
                  <label>{{ t("profile.phoneNumber") }}</label>
                  <div class="w-[100%]">
                    <div dir="ltr" class="mt-2">
                      <MazPhoneNumberInput
                        orientation="responsive"
                        v-model="ModifyMyProfileDto.phoneNumber"
                        v-model:country-code="DefaultCountry"
                        :placeholder="t('Profile.phoneNumber')"
                        size="sm"
                        class="phone"
                        show-code-on-list
                        :no-flags="false"
                        :preferred-countries="CountryList"
                      />
                    </div>
                  </div>
                </VCol>
                <v-col cols="12" md="6" lg="6">
                  <label> {{ t("Profiles.Role") }}</label>
                  <VTextField readonly v-model="ProfileList.role" class="mt-2">
                  </VTextField>
                </v-col>
              </v-row>
            </div>

            <div class="d-flex flex-wrap gap-4 justify-end mt-8 mb-10 mx-5">
              <!-- <VBtn color="primary" @click="save" :loading="isLoading">
                حفظ التغييرات
              </VBtn> -->
              <VBtn
                color="primary"
                @click="ModifyMyProfile"
                :loading="isLoading"
              >
                {{ t("Profiles.Save") }}
              </VBtn>
              <VBtn color="error" variant="tonal" @click="close">
                {{ t("Profiles.Cancle") }}</VBtn
              >
            </div>
          </VCard>
        </VWindowItem>

        <VWindowItem>
          <div>
            <VCard class="pl-5 pr-5 pt-5">
              <h3 class="pb-3">{{ t("Profiles.Details") }}</h3>
              <v-row>
                <v-col cols="12" md="12" lg="12">
                  <label> {{ t("Profiles.password") }}</label>
                  <AppTextField
                    v-model="ModifyMyPasswordDto.oldPassword"
                    placeholder="············"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="
                      isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                    "
                    class="my-2"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" lg="6">
                  <label> {{ t("Profiles.newpassword") }}</label>
                  <AppTextField
                    v-model="ModifyMyPasswordDto.newPassword"
                    placeholder="············"
                    :type="isPassword ? 'text' : 'password'"
                    :append-inner-icon="
                      isPassword ? 'tabler-eye-off' : 'tabler-eye'
                    "
                    class="my-2"
                    @click:append-inner="isPassword = !isPassword"
                  />
                </v-col>
                <v-col cols="12" lg="6">
                  <label> {{ t("Profiles.confirmpassword") }}</label>
                  <AppTextField
                    v-model="ModifyMyPasswordDto.confirmPassword"
                    placeholder="············"
                    :type="isCPasswordVisible ? 'text' : 'password'"
                    :append-inner-icon="
                      isCPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                    "
                    class="my-2"
                    @click:append-inner="
                      isCPasswordVisible = !isCPasswordVisible
                    "
                  />
                </v-col>
              </v-row>
              <VRow>
                <VCol>
                  <h3>{{ t("profile.req") }}</h3>
                  <ul class="pa-5">
                    <li class="mb-1">{{ t("profile.min") }}</li>
                    <li class="mb-1">{{ t("profile.rul1") }}</li>
                    <li>{{ t("profile.rul2") }}</li>
                  </ul>
                </VCol>
              </VRow>
              <!-- <v-row class="mb-5 pl-5 pr-5 pt-5">
                <div class="my-5">
                  <h4 class="my-3">  {{t('Profiles.req')}}:</h4>
                  <ul class="pr-5">
                    <li> {{t('Profiles.min')}}</li>
                    <li class="my-2">    {{t('Profiles.let')}}</li>
                    <li>{{t('Profiles.chart')}}</li>
                  </ul>
                </div>
              </v-row> -->
              <v-row class="mb-8 justify-end">
                <div class="d-flex flex-wrap gap-4 justify-end mt-8 mb-10 mx-5">
                  <VBtn
                    color="primary"
                    @click="ModifyMyPassword"
                    :loading="isLoading"
                  >
                    {{ t("Profiles.Save") }}
                  </VBtn>
                  <VBtn color="error" variant="tonal" @click="close">
                    {{ t("Profiles.Cancle") }}
                  </VBtn>
                </div>
              </v-row>
            </VCard>
          </div>
        </VWindowItem>
      </VWindow>
    </VCol>
  </VRow>
</template>

<style>
/* Default mobile-first style (smallest devices) */
.m-input-wrapper-input.--sm[data-v-8def99c5] {
  width: 100%; /* Full width on smallest devices */
  width: 355px; /* Maximum width for small screens */
}
</style>
