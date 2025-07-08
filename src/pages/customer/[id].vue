<script setup lang="ts">
import { CountryList, DefaultCountry } from "@/composables/countryList";
import { router } from "@/plugins/1.router";
import { VForm } from "vuetify/lib/components/index.mjs";
import { useCustomerStore } from "./Customer";
import { useToast } from "vue-toastification";
const store = useCustomerStore();
const route = useRoute();
const results = ref();
const toast = useToast();
const CustomerForm = ref<VForm>();
const { CustomerDetails } = storeToRefs(store);

store.GetDetailsCustomer(route.params.id);

const modifyBtn = () => {
  if (!CustomerForm.value) {
    console.error("CustomerForm is not initialized");

    return;
  }
  const res = CustomerForm.value.validate();
  if (!res.valid) {
    toast.error("يجب عليك إدخال الحقول المطلوبة");
    return;
  }
  if (results.value && results.value.isValid === false) {
    toast.error("يجب عليك ادخال  رقم هاتف صالح  ");
    return;
  }
  store.ModifyCustomer(CustomerDetails.value).then(() => router.go(-1));
};
</script>

<template>
  <div class="flex">
    <h4>العملاء</h4>
    <h4>
      / تعديل عميل
      <VIcon> tabler-user </VIcon>
    </h4>
  </div>

  <VForm ref="CustomerForm">
    <VCard class="mt-5" height="451px">
      <div class="flex justify-between">
        <h3 class="mb-4 mt-4 mx-5">معلومات العميل</h3>
      </div>
      <VRow class="mb-5 mx-1 mt-7">
        <VCol cols="12" md="6">
          <label>رقمID <span class="text-error">*</span></label
          ><AppTextField
            v-model="CustomerDetails.number"
            placeholder=" رقمID"
            class="mx-2"
            :rules="[requiredValidator]"
            disabled /></VCol
        ><VCol cols="12" md="6">
          <label>الاسم الكامل للعميل <span class="text-error">*</span></label
          ><AppTextField
            v-model="CustomerDetails.fullName"
            placeholder="الاسم الكامل للعميل*"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol cols="12" md="6"
          ><label>اسم الشركة<span class="text-error">*</span></label>
          <AppTextField
            v-model="CustomerDetails.company"
            placeholder="اسم
          الشركة "
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>

        <VCol cols="12" md="6" lg="6">
          <!-- <label style="margin-right: 120px !important">رقم الهاتف</label>
          <div dir="ltr" class="mt-2">
            <MazPhoneNumberInput
              v-model="CustomerDetails.phoneNumber"
              v-model:country-code="DefaultCountry"
              size="lg"
              class="w-full"
              show-code-on-list
              :no-flags="false"
              :preferred-countries="CountryList"
              listPosition="top"
              :noSearch="false"
            />
          </div> -->
          <div style="margin-right: 10px">
            <label class="">رقم الهاتف</label>
            <div class="w-full md:w-[75%]">
              <div dir="ltr">
                <MazPhoneNumberInput
                  label="رقم الهاتف"
                  :isValid="true"
                  show-code-on-list
                  :rules="[requiredValidator]"
                  v-model="CustomerDetails.phoneNumber"
                  :noFlags="false"
                  class="w-[100%] px-5"
                  :preferred-countries="CountryList"
                  v-model:country-code="DefaultCountry"
                  theme="dark"
                  size="md"
                  @update="results = $event"
                />
              </div>
            </div></div
        ></VCol>
      </VRow>
    </VCard>
  </VForm>

  <div class="flex justify-end mt-4 mx-2">
    <VBtn class="mx-1" @click="modifyBtn"> تعديل </VBtn>

    <VBtn color="error" variant="tonal" @click="router.go(-1)"> إلغاء </VBtn>
  </div>
</template>
