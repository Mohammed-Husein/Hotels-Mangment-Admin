<script setup lang="ts">
import { CountryList, DefaultCountry } from "@/composables/countryList";
import { router } from "@/plugins/1.router";
import { VForm } from "vuetify/lib/components/index.mjs";
import { useCustomerStore } from "./Customer";
import { useToast } from "vue-toastification";
import { useSettingStore } from "@/pages/setting/settiing";
import { storeToRefs } from "pinia";
import { requiredValidator } from "@/@core/utils/validators";
import type { ChangeCustomerStatusDto } from "./api/dto";
import { onMounted, watch } from "vue";

const store = useCustomerStore();
const route = useRoute();
const results = ref();
const toast = useToast();
const CustomerForm = ref<VForm>();
const PasswordForm = ref<VForm>();
const ModifyLoading = ref(false);
const PasswordLoading = ref(false);
const StatusLoading = ref(false);
const showStatusDialog = ref(false);
const statusReason = ref("");
const activeTab = ref("general");
const pageLoading = ref(true);

// Password form data
const passwordData = ref({
  newPassword: "",
  confirmPassword: "",
});

// Password visibility
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

const settingStore = useSettingStore();
const { CountryNameList } = storeToRefs(settingStore);
const { CustomerDetails, CitiesList, RegionsList } = storeToRefs(store);

// Load customer details and countries
onMounted(async () => {
  pageLoading.value = true;
  try {
    await settingStore.GetAllCountryNames();
    await store.GetDetailsCustomer(route.params.id as string);
  } catch (error) {
    console.error("Error loading customer details:", error);
    toast.error("حدث خطأ في تحميل بيانات العميل");
  } finally {
    pageLoading.value = false;
  }
});

// Load cities and regions when customer details are loaded
watch(() => CustomerDetails.value.countryId, (newCountryId) => {
  if (newCountryId) {
    store.GetCitiesByCountry(newCountryId);
  }
});

watch(() => CustomerDetails.value.cityId, (newCityId) => {
  if (newCityId) {
    store.GetRegionsByCity(newCityId);
  }
});

// Watch for country change to load cities
const onCountryChange = (countryId: string) => {
  if (countryId) {
    store.GetCitiesByCountry(countryId);
    CustomerDetails.value.cityId = ""; // Reset city selection
    CustomerDetails.value.regionId = ""; // Reset region selection
  }
};

// Watch for city change to load regions
const onCityChange = (cityId: string) => {
  if (cityId) {
    store.GetRegionsByCity(cityId);
    CustomerDetails.value.regionId = ""; // Reset region selection
  }
};

const modifyBtn = async () => {
  if (!CustomerForm.value) {
    console.error("CustomerForm is not initialized");
    return;
  }

  const result = await CustomerForm.value.validate();
  if (!result.valid) {
    toast.error("يجب عليك إدخال الحقول المطلوبة");
    return;
  }

  if (results.value && results.value.isValid === false) {
    toast.error("يجب عليك ادخال رقم هاتف صالح");
    return;
  }

  ModifyLoading.value = true;
  try {
    const modifyData = {
      id: CustomerDetails.value.id || CustomerDetails.value._id,
      firstName: CustomerDetails.value.firstName,
      lastName: CustomerDetails.value.lastName,
      email: CustomerDetails.value.email,
      phoneNumber: CustomerDetails.value.phoneNumber,
      alternatePhoneNumber: CustomerDetails.value.alternatePhoneNumber,
      regionId: CustomerDetails.value.regionId,
      countryId: CustomerDetails.value.countryId,
      cityId: CustomerDetails.value.cityId,
      detailedAddress: CustomerDetails.value.detailedAddress,
      preferredLanguage: CustomerDetails.value.preferredLanguage,
    };

    await store.ModifyCustomer(modifyData);
    toast.success("تم تعديل معلومات العميل بنجاح");
    router.go(-1);
  } catch (error) {
    console.error("Failed to modify Customer:", error);
  } finally {
    ModifyLoading.value = false;
  }
};

// Password validation
const passwordValidator = (value: string) => {
  if (!value) return "كلمة السر مطلوبة";
  if (value.length < 6) return "كلمة السر يجب أن تكون 6 أحرف على الأقل";
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
    return "كلمة السر يجب أن تحتوي على حرف كبير وحرف صغير ورقم";
  }
  return true;
};

const confirmPasswordValidator = (value: string) => {
  if (!value) return "تأكيد كلمة السر مطلوب";
  if (value !== passwordData.value.newPassword) return "تأكيد كلمة السر غير متطابق";
  return true;
};

// Change password function
const changePasswordBtn = async () => {
  if (!PasswordForm.value) {
    console.error("PasswordForm is not initialized");
    return;
  }

  const result = await PasswordForm.value.validate();
  if (!result.valid) {
    toast.error("يجب عليك إدخال الحقول المطلوبة بشكل صحيح");
    return;
  }

  PasswordLoading.value = true;
  try {
    await store.ChangeCustomerPassword(
      CustomerDetails.value.id || CustomerDetails.value._id,
      {
        newPassword: passwordData.value.newPassword,
        confirmPassword: passwordData.value.confirmPassword,
      }
    );

    // Reset form
    passwordData.value = {
      newPassword: "",
      confirmPassword: "",
    };
    PasswordForm.value.reset();
    toast.success("تم تغيير كلمة السر بنجاح");
  } catch (error) {
    console.error("Failed to change password:", error);
  } finally {
    PasswordLoading.value = false;
  }
};

const changeStatusBtn = () => {
  showStatusDialog.value = true;
  statusReason.value = "";
};

const confirmStatusChange = async () => {
  if (!statusReason.value.trim()) {
    toast.error("يجب إدخال سبب تغيير الحالة");
    return;
  }

  StatusLoading.value = true;
  try {
    const newStatus = CustomerDetails.value.status === "Active" ? "Suspended" : "Active";
    const statusData: ChangeCustomerStatusDto = {
      status: newStatus,
      reason: statusReason.value.trim(),
    };

    await store.ChangeCustomerStatus(CustomerDetails.value.id || CustomerDetails.value._id, statusData);
    showStatusDialog.value = false;
    statusReason.value = "";
  } catch (error) {
    console.error("Failed to change customer status:", error);
  } finally {
    StatusLoading.value = false;
  }
};

const getStatusButtonText = () => {
  return CustomerDetails.value.status === "Active" ? "حظر العميل" : "إلغاء الحظر";
};

const getStatusButtonColor = () => {
  return CustomerDetails.value.status === "Active" ? "warning" : "success";
};
</script>

<template>
  <!-- Loading State -->
  <div v-if="pageLoading" class="d-flex justify-center align-center" style="min-height: 400px;">
    <VProgressCircular
      indeterminate
      size="64"
      color="primary"
    />
  </div>

  <!-- Main Content -->
  <div v-else>
    <div class="flex items-center justify-between">
      <div class="flex">
        <h4>العملاء</h4>
        <h4>
          / تعديل عميل
          <VIcon> tabler-user </VIcon>
        </h4>
      </div>
      <VChip
        :color="CustomerDetails.status === 'Active' ? 'success' : CustomerDetails.status === 'Suspended' ? 'warning' : 'error'"
        variant="tonal"
        size="small"
      >
        {{ CustomerDetails.status === 'Active' ? 'نشط' : CustomerDetails.status === 'Suspended' ? 'محظور' : 'غير نشط' }}
      </VChip>
    </div>

    <!-- Tabs -->
    <VCard class="mt-5">
      <VTabs v-model="activeTab" color="primary">
        <VTab value="general">
          <VIcon start>tabler-user-edit</VIcon>
          المعلومات العامة
        </VTab>
        <VTab value="security">
          <VIcon start>tabler-lock</VIcon>
          الأمان
        </VTab>
      </VTabs>

      <VTabsWindow v-model="activeTab">
        <!-- General Information Tab -->
        <VTabsWindowItem value="general">
          <VForm ref="CustomerForm">
            <VCardText>
              <div class="flex justify-between">
                <h3 class="mb-4 mt-4">معلومات العميل</h3>
              </div>
              <VRow class="mb-5 mt-7">
                <VCol cols="12" md="6">
                  <label>رقم ID <span class="text-error">*</span></label>
                  <AppTextField
                    v-model="CustomerDetails.number"
                    placeholder="رقم ID"
                    class="mx-2"
                    disabled
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <label>اسم العميل الأول <span class="text-error">*</span></label>
                  <AppTextField
                    v-model="CustomerDetails.firstName"
                    class="mx-2"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <label>اسم العميل الثاني <span class="text-error">*</span></label>
                  <AppTextField
                    v-model="CustomerDetails.lastName"
                    class="mx-2"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <label>البريد الالكتروني <span class="text-error">*</span></label>
                  <AppTextField
                    v-model="CustomerDetails.email"
                    class="mx-2"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <div style="margin-right: 10px">
                    <label class="">رقم الهاتف <span class="text-error">*</span></label>
                    <div class="w-full md:w-[75%]">
                      <div dir="ltr">
                        <MazPhoneNumberInput
                          @update="results = $event"
                          label="رقم الهاتف"
                          :isValid="true"
                          show-code-on-list
                          :rules="[requiredValidator]"
                          v-model="CustomerDetails.phoneNumber"
                          :noFlags="false"
                          class="w-[90%] px-5"
                          :preferred-countries="CountryList"
                          v-model:country-code="DefaultCountry"
                          theme="dark"
                          size="md"
                        />
                      </div>
                    </div>
                  </div>
                </VCol>
                <VCol cols="12" md="6">
                  <label>رقم الهاتف البديل</label>
                  <div class="w-full md:w-[75%]">
                    <div dir="ltr">
                      <MazPhoneNumberInput
                        @update="results = $event"
                        label="رقم الهاتف البديل"
                        :isValid="true"
                        show-code-on-list
                        v-model="CustomerDetails.alternatePhoneNumber"
                        :noFlags="false"
                        class="w-[90%] px-5"
                        :preferred-countries="CountryList"
                        v-model:country-code="DefaultCountry"
                        theme="dark"
                        size="md"
                      />
                    </div>
                  </div>
                </VCol>
                <VCol cols="12" md="6">
                  <label>البلد <span class="text-error">*</span></label>
                  <VAutocomplete
                    :items="CountryNameList"
                    item-title="name"
                    item-value="id"
                    v-model="CustomerDetails.countryId"
                    @update:model-value="onCountryChange"
                    class="mx-2"
                    :rules="[requiredValidator]"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <label>المدينة <span class="text-error">*</span></label>
                  <VAutocomplete
                    :items="CitiesList"
                    item-title="name"
                    item-value="id"
                    v-model="CustomerDetails.cityId"
                    @update:model-value="onCityChange"
                    class="mx-2"
                    :rules="[requiredValidator]"
                    :disabled="!CustomerDetails.countryId"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <label>المنطقة <span class="text-error">*</span></label>
                  <VAutocomplete
                    :items="RegionsList"
                    item-title="name"
                    item-value="id"
                    v-model="CustomerDetails.regionId"
                    class="mx-2"
                    :rules="[requiredValidator]"
                    :disabled="!CustomerDetails.cityId"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <label>اللغة المفضلة</label>
                  <VSelect
                    v-model="CustomerDetails.preferredLanguage"
                    :items="[
                      { title: 'العربية', value: 'Arabic' },
                      { title: 'English', value: 'English' }
                    ]"
                    item-title="title"
                    item-value="value"
                    class="mx-2"
                  />
                </VCol>
                <VCol cols="12" md="6">
                  <label>حالة العميل</label>
                  <VSelect
                    v-model="CustomerDetails.status"
                    :items="[
                      { title: 'نشط', value: 'Active' },
                      { title: 'غير نشط', value: 'Inactive' },
                      { title: 'محظور', value: 'Suspended' }
                    ]"
                    item-title="title"
                    item-value="value"
                    class="mx-2"
                    disabled
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <label>العنوان التفصيلي ان وجد</label>
                  <VTextarea v-model="CustomerDetails.detailedAddress" class="mx-2" />
                </VCol>
              </VRow>
            </VCardText>
          </VForm>
        </VTabsWindowItem>

        <!-- Security Tab -->
        <VTabsWindowItem value="security">
          <VForm ref="PasswordForm">
            <VCardText>
              <div class="flex justify-between">
                <h3 class="mb-4 mt-4">تغيير كلمة السر</h3>
              </div>

              <VRow class="mb-5 mt-7">
                <VCol cols="12" md="6">
                  <label>كلمة السر الجديدة <span class="text-error">*</span></label>
                  <AppTextField
                    v-model="passwordData.newPassword"
                    :type="showNewPassword ? 'text' : 'password'"
                    class="mx-2"
                    :rules="[passwordValidator]"
                    placeholder="أدخل كلمة السر الجديدة"
                  >
                    <template #append-inner>
                      <VIcon
                        :icon="showNewPassword ? 'tabler-eye-off' : 'tabler-eye'"
                        @click="showNewPassword = !showNewPassword"
                        style="cursor: pointer;"
                      />
                    </template>
                  </AppTextField>
                </VCol>

                <VCol cols="12" md="6">
                  <label>تأكيد كلمة السر <span class="text-error">*</span></label>
                  <AppTextField
                    v-model="passwordData.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="mx-2"
                    :rules="[confirmPasswordValidator]"
                    placeholder="أعد إدخال كلمة السر"
                  >
                    <template #append-inner>
                      <VIcon
                        :icon="showConfirmPassword ? 'tabler-eye-off' : 'tabler-eye'"
                        @click="showConfirmPassword = !showConfirmPassword"
                        style="cursor: pointer;"
                      />
                    </template>
                  </AppTextField>
                </VCol>

                <VCol cols="12">
                  <VAlert
                    type="info"
                    variant="tonal"
                    class="mx-2"
                  >
                    <VIcon start>tabler-info-circle</VIcon>
                    كلمة السر يجب أن تحتوي على 6 أحرف على الأقل وتتضمن حرف كبير وحرف صغير ورقم
                  </VAlert>
                </VCol>
              </VRow>

              <div class="flex justify-end mt-4 mx-2">
                <VBtn
                  color="primary"
                  :loading="PasswordLoading"
                  @click="changePasswordBtn"
                  class="mx-1"
                >
                  <VIcon start>tabler-lock</VIcon>
                  تغيير كلمة السر
                </VBtn>
              </div>
            </VCardText>
          </VForm>
        </VTabsWindowItem>
      </VTabsWindow>
    </VCard>

    <!-- Action Buttons -->
    <div class="flex justify-end mt-4 mx-2">
      <VBtn
        v-if="activeTab === 'general'"
        class="mx-1"
        :loading="ModifyLoading"
        @click="modifyBtn"
        color="primary"
      >
        <VIcon start>tabler-device-floppy</VIcon>
        تعديل المعلومات
      </VBtn>
      <VBtn
        class="mx-1"
        :color="getStatusButtonColor()"
        variant="tonal"
        @click="changeStatusBtn"
      >
        {{ getStatusButtonText() }}
      </VBtn>
      <VBtn color="error" variant="tonal" @click="router.go(-1)">
        <VIcon start>tabler-x</VIcon>
        إلغاء
      </VBtn>
    </div>
  </div>

  <!-- Dialog لتأكيد تغيير الحالة -->
  <VDialog v-model="showStatusDialog" max-width="500px">
    <VCard>
      <VCardTitle class="text-h5">
        {{ CustomerDetails.status === "Active" ? "حظر العميل" : "إلغاء حظر العميل" }}
      </VCardTitle>
      <VCardText>
        <p class="mb-4">
          {{ CustomerDetails.status === "Active"
            ? "هل أنت متأكد من أنك تريد حظر هذا العميل؟"
            : "هل أنت متأكد من أنك تريد إلغاء حظر هذا العميل؟"
          }}
        </p>
        <VTextField
          v-model="statusReason"
          label="سبب تغيير الحالة *"
          placeholder="أدخل سبب تغيير الحالة..."
          :rules="[requiredValidator]"
          required
        />
      </VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="grey" variant="text" @click="showStatusDialog = false">
          إلغاء
        </VBtn>
        <VBtn
          :color="getStatusButtonColor()"
          :loading="StatusLoading"
          @click="confirmStatusChange"
        >
          تأكيد
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>
