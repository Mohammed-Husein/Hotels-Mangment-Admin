<script setup lang="ts">
import { CountryList, DefaultCountry } from "@/composables/countryList";
import { useSettingStore } from "@/pages/setting/settiing";
import { router } from "@/plugins/1.router";
import { ref, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { VForm } from "vuetify/lib/components/index.mjs";
import { useCustomerStore } from "../Customer";
import { storeToRefs } from "pinia";
import { requiredValidator } from "@/@core/utils/validators";
import type { AddCustomerDto } from "../api/dto";

const CustomerForm = ref<VForm | null>(null);
const AddLoading = ref(false);
const settingStore = useSettingStore();
const { CountryNameList } = storeToRefs(settingStore);

// Load countries on component mount
onMounted(async () => {
  await settingStore.GetAllCountryNames();
});
const AddDto = ref<AddCustomerDto>({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phoneNumber: "",
  alternatePhoneNumber: "",
  regionId: "",
  countryId: "",
  cityId: "",
  detailedAddress: "",
  preferredLanguage: "Arabic",
});
const results = ref();
const toast = useToast();
const store = useCustomerStore();
const { CitiesList, RegionsList } = storeToRefs(store);

// Watch for country change to load cities
const onCountryChange = (countryId: string) => {
  if (countryId) {
    store.GetCitiesByCountry(countryId);
    AddDto.value.cityId = ""; // Reset city selection
    AddDto.value.regionId = ""; // Reset region selection
  }
};

// Watch for city change to load regions
const onCityChange = (cityId: string) => {
  if (cityId) {
    store.GetRegionsByCity(cityId);
    AddDto.value.regionId = ""; // Reset region selection
  }
};

const save = async () => {
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
    toast.error("يجب عليك ادخال  رقم هاتف صالح  ");
    return;
  }
  if (result.valid) {
    AddLoading.value = true;
    try {
      const customerData: AddCustomerDto = {
        firstName: AddDto.value.firstName,
        lastName: AddDto.value.lastName,
        email: AddDto.value.email,
        password: AddDto.value.password,
        confirmPassword: AddDto.value.confirmPassword,
        phoneNumber: AddDto.value.phoneNumber,
        alternatePhoneNumber: AddDto.value.alternatePhoneNumber,
        regionId: AddDto.value.regionId,
        countryId: AddDto.value.countryId,
        cityId: AddDto.value.cityId,
        detailedAddress: AddDto.value.detailedAddress,
        preferredLanguage: AddDto.value.preferredLanguage,
      };

      const response = await store.AddCustomer(customerData);
      if (response && response.success !== false) {
        router.go(-1);
      }
    } catch (error: any) {
      console.error("Failed to save Customer:", error);
      // Error handling is done in useApi, no need to show additional messages here
    } finally {
      AddLoading.value = false;
    }
  }
};
</script>

<template>
  <div class="flex">
    <h4>العملاء</h4>
    <h4>
      / إضافة عميل
      <VIcon> tabler-user </VIcon>
    </h4>
  </div>

  <VForm ref="CustomerForm">
    <VCard class="mt-5">
      <div class="flex justify-between">
        <h3 class="mb-4 mt-4 mx-5">معلومات العميل</h3>
      </div>
      <VRow class="mb-5 mx-1 mt-7">
        <VCol cols="12" md="6">
          <label>اسم العميل الاول <span class="text-error">*</span></label
          ><AppTextField
            v-model="AddDto.firstName"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>اسم العميل الثاني <span class="text-error">*</span></label
          ><AppTextField
            v-model="AddDto.lastName"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> البريد الالكتروني<span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.email"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol>
          <!-- <label style="margin-right: 160px">رقم الهاتف </label>
          <div dir="ltr" class="mt-2">
            <MazPhoneNumberInput
              label="رقم الهاتف"
              v-model="AddDto.phoneNumber"
              v-model:country-code="DefaultCountry"
              size="md"
              class="w-full"
              show-code-on-list
              :no-flags="false"
              :preferred-countries="CountryList"
              z-index="100"
              listPosition="bottom"
              :noSearch="false"
              style="z-index: 1"
            />
          </div> -->
          <div style="margin-right: 10px">
            <label class="">رقم الهاتف</label>
            <div class="w-full md:w-[75%]">
              <div dir="ltr">
                <MazPhoneNumberInput
                  @update="results = $event"
                  label="رقم الهاتف"
                  :isValid="true"
                  show-code-on-list
                  :rules="[requiredValidator]"
                  v-model="AddDto.phoneNumber"
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
                v-model="AddDto.alternatePhoneNumber"
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
          <label> كلمة السر<span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.password"
            type="password"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> تأكيد كلمة السر<span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.confirmPassword"
            type="password"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> اللغة المفضلة</label>
          <VSelect
            v-model="AddDto.preferredLanguage"
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
          <label> البلد<span class="text-error">*</span></label>
          <VAutocomplete
            :items="CountryNameList"
            item-title="name"
            item-value="id"
            v-model="AddDto.countryId"
            @update:model-value="onCountryChange"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> المدينة <span class="text-error">*</span></label>
          <VAutocomplete
            :items="CitiesList"
            item-title="name"
            item-value="id"
            v-model="AddDto.cityId"
            @update:model-value="onCityChange"
            class="mx-2"
            :rules="[requiredValidator]"
            :disabled="!AddDto.countryId"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> المنطقة <span class="text-error">*</span></label>
          <VAutocomplete
            :items="RegionsList"
            item-title="name"
            item-value="id"
            v-model="AddDto.regionId"
            class="mx-2"
            :rules="[requiredValidator]"
            :disabled="!AddDto.cityId"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> العنوان التفصيلي ان وجد </label>
          <VTextarea v-model="AddDto.detailedAddress" class="mx-2" />
        </VCol>
      </VRow>
    </VCard>
  </VForm>

  <div class="flex justify-end mt-4 mx-2">
    <VBtn class="mx-1" :loading="AddLoading" @click="save"> إضافة </VBtn>
    <VBtn color="error" variant="tonal" @click="router.go(-1)"> إلغاء </VBtn>
  </div>
</template>

<style scoped>
.maz-select__options {
  z-index: 9999 !important;
}
</style>
