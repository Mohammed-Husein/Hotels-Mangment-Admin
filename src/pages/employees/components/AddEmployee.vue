<script setup lang="ts">
import { CountryList, DefaultCountry } from "@/composables/countryList";
import { useSettingStore } from "@/pages/setting/settiing";
import { router } from "@/plugins/1.router";
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { VForm } from "vuetify/lib/components/index.mjs";
import { useEmployeeStore } from "../employee";
import { storeToRefs } from "pinia";
import { requiredValidator } from "@/@core/utils/validators";
import type { AddEmployeeDto } from "../api/dto";

const EmployeeForm = ref<VForm | null>(null);
const AddLoading = ref(false);
const settingStore = useSettingStore();
settingStore.GetAllCountryNames();
const { CountryNameList } = storeToRefs(settingStore);

const AddDto = ref<AddEmployeeDto>({
  fullName: "",
  email: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
  role: "",
  countryId: "",
  status: "Active",
  permissions: [],
  notes: "",
  deviceToken: "",
});

const results = ref();
const toast = useToast();
const store = useEmployeeStore();

// Employee roles
const employeeRoles = [
  { title: "مدير عام", value: "SuperAdmin" },
  { title: "مدير", value: "Admin" },
  { title: "مدير فرع", value: "Manager" },
  { title: "موظف استقبال", value: "Receptionist" },
  { title: "مشرف", value: "Supervisor" },
];

const save = async () => {
  if (!EmployeeForm.value) {
    console.error("EmployeeForm is not initialized");
    return;
  }

  const result = await EmployeeForm.value.validate();
  if (!result.valid) {
    toast.error("يجب عليك إدخال الحقول المطلوبة");
    return;
  }
  
  if (results.value && results.value.isValid === false) {
    toast.error("يجب عليك ادخال رقم هاتف صالح");
    return;
  }

  if (AddDto.value.password !== AddDto.value.confirmPassword) {
    toast.error("كلمة المرور وتأكيد كلمة المرور غير متطابقتان");
    return;
  }

  if (result.valid) {
    AddLoading.value = true;
    try {
      const employeeData: AddEmployeeDto = {
        fullName: AddDto.value.fullName,
        email: AddDto.value.email,
        phoneNumber: AddDto.value.phoneNumber,
        password: AddDto.value.password,
        confirmPassword: AddDto.value.confirmPassword,
        role: AddDto.value.role,
        countryId: AddDto.value.countryId,
        status: AddDto.value.status,
        permissions: AddDto.value.permissions,
        notes: AddDto.value.notes,
        deviceToken: AddDto.value.deviceToken,
      };
      await store.AddEmployee(employeeData);
      router.go(-1);
    } catch (error) {
      console.error("Failed to save Employee:", error);
    } finally {
      AddLoading.value = false;
    }
  }
};
</script>

<template>
  <div class="flex">
    <h4>الموظفين</h4>
    <h4>
      / إضافة موظف
      <VIcon> tabler-users </VIcon>
    </h4>
  </div>

  <VForm ref="EmployeeForm">
    <VCard class="mt-5">
      <div class="flex justify-between">
        <h3 class="mb-4 mt-4 mx-5">معلومات الموظف</h3>
      </div>
      <VRow class="mb-5 mx-1 mt-7">
        <VCol cols="12" md="6">
          <label>الاسم الكامل <span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.fullName"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>البريد الالكتروني <span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.email"
            type="email"
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
          <label>الدور الوظيفي <span class="text-error">*</span></label>
          <VSelect
            v-model="AddDto.role"
            :items="employeeRoles"
            item-title="title"
            item-value="value"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>كلمة السر <span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.password"
            type="password"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>تأكيد كلمة السر <span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.confirmPassword"
            type="password"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>البلد <span class="text-error">*</span></label>
          <VAutocomplete
            :items="CountryNameList"
            item-title="name"
            item-value="id"
            v-model="AddDto.countryId"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>رمز الجهاز</label>
          <AppTextField
            v-model="AddDto.deviceToken"
            class="mx-2"
          />
        </VCol>
        <VCol cols="12" md="12">
          <label>ملاحظات</label>
          <VTextarea v-model="AddDto.notes" class="mx-2" />
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
