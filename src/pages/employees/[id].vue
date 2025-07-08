<script setup lang="ts">
import { CountryList, DefaultCountry } from "@/composables/countryList";
import { router } from "@/plugins/1.router";
import { VForm } from "vuetify/lib/components/index.mjs";
import { useEmployeeStore } from "./employee";
import { useToast } from "vue-toastification";
import { useSettingStore } from "@/pages/setting/settiing";
import { storeToRefs } from "pinia";
import { requiredValidator } from "@/@core/utils/validators";
import type { ChangeEmployeeStatusDto } from "./api/dto";

const store = useEmployeeStore();
const route = useRoute();
const results = ref();
const toast = useToast();
const EmployeeForm = ref<VForm>();
const ModifyLoading = ref(false);
const StatusLoading = ref(false);
const showStatusDialog = ref(false);
const statusReason = ref("");

const settingStore = useSettingStore();
settingStore.GetAllCountryNames();
const { CountryNameList } = storeToRefs(settingStore);
const { EmployeeDetails } = storeToRefs(store);

store.GetDetailsEmployee(route.params.id as string);

// Employee roles
const employeeRoles = [
  { title: "مدير عام", value: "SuperAdmin" },
  { title: "مدير", value: "Admin" },
  { title: "مدير فرع", value: "Manager" },
  { title: "موظف استقبال", value: "Receptionist" },
  { title: "مشرف", value: "Supervisor" },
];

const modifyBtn = async () => {
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
  
  ModifyLoading.value = true;
  try {
    const modifyData = {
      id: EmployeeDetails.value.id,
      fullName: EmployeeDetails.value.fullName,
      email: EmployeeDetails.value.email,
      phoneNumber: EmployeeDetails.value.phoneNumber,
      role: EmployeeDetails.value.role,
      countryId: EmployeeDetails.value.countryId,
      status: EmployeeDetails.value.status,
      permissions: EmployeeDetails.value.permissions,
      notes: EmployeeDetails.value.notes,
      deviceToken: EmployeeDetails.value.deviceToken,
    };
    
    await store.ModifyEmployee(modifyData);
    router.go(-1);
  } catch (error) {
    console.error("Failed to modify Employee:", error);
  } finally {
    ModifyLoading.value = false;
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
    let newStatus: "Active" | "Inactive" | "Suspended" | "OnLeave";
    
    switch (EmployeeDetails.value.status) {
      case "Active":
        newStatus = "Suspended";
        break;
      case "Suspended":
        newStatus = "Active";
        break;
      case "Inactive":
        newStatus = "Active";
        break;
      case "OnLeave":
        newStatus = "Active";
        break;
      default:
        newStatus = "Active";
    }

    const statusData: ChangeEmployeeStatusDto = {
      status: newStatus,
      reason: statusReason.value.trim(),
    };

    await store.ChangeEmployeeStatus(EmployeeDetails.value.id, statusData);
    showStatusDialog.value = false;
    statusReason.value = "";
  } catch (error) {
    console.error("Failed to change employee status:", error);
  } finally {
    StatusLoading.value = false;
  }
};

const getStatusButtonText = () => {
  switch (EmployeeDetails.value.status) {
    case "Active":
      return "تعليق الموظف";
    case "Suspended":
      return "إلغاء التعليق";
    case "Inactive":
      return "تفعيل الموظف";
    case "OnLeave":
      return "إنهاء الإجازة";
    default:
      return "تغيير الحالة";
  }
};

const getStatusButtonColor = () => {
  switch (EmployeeDetails.value.status) {
    case "Active":
      return "warning";
    case "Suspended":
    case "Inactive":
    case "OnLeave":
      return "success";
    default:
      return "primary";
  }
};

const getStatusChipColor = () => {
  switch (EmployeeDetails.value.status) {
    case "Active":
      return "success";
    case "Suspended":
      return "warning";
    case "Inactive":
      return "error";
    case "OnLeave":
      return "info";
    default:
      return "grey";
  }
};

const getStatusText = () => {
  switch (EmployeeDetails.value.status) {
    case "Active":
      return "نشط";
    case "Suspended":
      return "معلق";
    case "Inactive":
      return "غير نشط";
    case "OnLeave":
      return "في إجازة";
    default:
      return "غير محدد";
  }
};
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex">
      <h4>الموظفين</h4>
      <h4>
        / تعديل موظف
        <VIcon> tabler-users </VIcon>
      </h4>
    </div>
    <VChip 
      :color="getStatusChipColor()"
      variant="tonal"
      size="small"
    >
      {{ getStatusText() }}
    </VChip>
  </div>

  <VForm ref="EmployeeForm">
    <VCard class="mt-5">
      <div class="flex justify-between">
        <h3 class="mb-4 mt-4 mx-5">معلومات الموظف</h3>
      </div>
      <VRow class="mb-5 mx-1 mt-7">
        <VCol cols="12" md="6">
          <label>رقم ID <span class="text-error">*</span></label>
          <AppTextField
            v-model="EmployeeDetails.number"
            placeholder="رقم ID"
            class="mx-2"
            disabled
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>الاسم الكامل <span class="text-error">*</span></label>
          <AppTextField
            v-model="EmployeeDetails.fullName"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>البريد الالكتروني <span class="text-error">*</span></label>
          <AppTextField
            v-model="EmployeeDetails.email"
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
                  v-model="EmployeeDetails.phoneNumber"
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
            v-model="EmployeeDetails.role"
            :items="employeeRoles"
            item-title="title"
            item-value="value"
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
            v-model="EmployeeDetails.countryId"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>حالة الموظف</label>
          <VSelect
            v-model="EmployeeDetails.status"
            :items="[
              { title: 'نشط', value: 'Active' },
              { title: 'غير نشط', value: 'Inactive' },
              { title: 'معلق', value: 'Suspended' },
              { title: 'في إجازة', value: 'OnLeave' }
            ]"
            item-title="title"
            item-value="value"
            class="mx-2"
            disabled
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>رمز الجهاز</label>
          <AppTextField
            v-model="EmployeeDetails.deviceToken"
            class="mx-2"
          />
        </VCol>
        <VCol cols="12" md="12">
          <label>ملاحظات</label>
          <VTextarea v-model="EmployeeDetails.notes" class="mx-2" />
        </VCol>
      </VRow>
    </VCard>
  </VForm>

  <div class="flex justify-end mt-4 mx-2">
    <VBtn class="mx-1" :loading="ModifyLoading" @click="modifyBtn"> تعديل </VBtn>
    <VBtn 
      class="mx-1" 
      :color="getStatusButtonColor()" 
      variant="tonal" 
      @click="changeStatusBtn"
    > 
      {{ getStatusButtonText() }} 
    </VBtn>
    <VBtn color="error" variant="tonal" @click="router.go(-1)"> إلغاء </VBtn>
  </div>

  <!-- Dialog لتأكيد تغيير الحالة -->
  <VDialog v-model="showStatusDialog" max-width="500px">
    <VCard>
      <VCardTitle class="text-h5">
        {{ getStatusButtonText() }}
      </VCardTitle>
      <VCardText>
        <p class="mb-4">
          هل أنت متأكد من أنك تريد {{ getStatusButtonText().toLowerCase() }}؟
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
