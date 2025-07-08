<script setup lang="ts">
import { CountryList, DefaultCountry } from "@/composables/countryList";
import { useSettingStore } from "@/pages/setting/settiing";
import { router } from "@/plugins/1.router";
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { VForm } from "vuetify/lib/components/index.mjs";
import { useCustomerStore } from "../Customer";
const CustomerForm = ref<VForm | null>(null);
const AddLoading = ref(false);
const settingStore = useSettingStore();
settingStore.GetAllCountryNames();
const { CountryNameList } = storeToRefs(settingStore);
const AddDto = ref({
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
  preferredLanguage: "",
});
const results = ref();
const toast = useToast();
const store = useCustomerStore();

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
      await store.AddCustomer({ ...AddDto.value });
      router.go(-1);
    } catch (error) {
      console.error("Failed to save Customer:", error);
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
            v-model="AddDto.firstName"
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
          <label> كلمة السر<span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.password"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> تأكيد كلمة السر<span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.confirmPassword"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> البلد<span class="text-error">*</span></label>
          <VAutocomplete
            :items="CountryNameList"
            item-title="name"
            item-value=" id"
            v-model="AddDto.countryId"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> المدينة <span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.cityId"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label> المنطقة <span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.regionId"
            class="mx-2"
            :rules="[requiredValidator]"
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
