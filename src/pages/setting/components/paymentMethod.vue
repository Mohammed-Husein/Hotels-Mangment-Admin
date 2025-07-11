<script setup lang="ts">
import { VForm } from "vuetify/lib/components/index.mjs";
import { AddPaymentMethod, filterPaymentMethodDto } from "../api/dto";
import { usePaymentMethodStore } from "../paymentMethodStore";

// إضافة الـ validator المطلوب
const { getFileUrl } = useFile();
const paymentMethodStore = usePaymentMethodStore();
const isLoading = ref<boolean>(false);
const { FnExcute } = useTimerFn();
const search = ref("");
const { paymentMethodList, paginationPaymentMethod, paymentMethodDetails } =
  storeToRefs(paymentMethodStore);
const filtersDto = ref(new filterPaymentMethodDto());
const isUpdateOptions = ref(false);
const dialogDelete = ref(false);
const isDialogVisible = ref(false);
const modifyDialog = ref(false);
const Add = ref<AddPaymentMethod>({ ...new AddPaymentMethod() });

// جلب البيانات عند تحميل المكون
onMounted(() => {
  refetch();
});

const headers = [
  { title: "الاسم العربي", key: "name.ar", sortable: true },
  { title: "الاسم الإنجليزي", key: "name.en", sortable: true },
  { title: "الكود", key: "code", sortable: true },
  { title: "ترتيب العرض", key: "displayOrder", sortable: true },
  { title: "الحالة", key: "isActive", sortable: true },
  { title: "الإجراءات", key: "actions", sortable: false },
];

const cancel = () => {
  isDialogVisible.value = false;
  modifyDialog.value = false;
  Add.value = new AddPaymentMethod();
};

const openEditDialog = (id: string) => {
  paymentMethodStore.GetPaymentMethodById(id).then(() => {
    modifyDialog.value = true;
  });
};

const onSortByUpdate = (sortBy: any) => {
  if (sortBy.length > 0) {
    const sortItem = sortBy[0];
    filtersDto.value.SortColumn = sortItem.key;
    filtersDto.value.SortOrder = sortItem.order;
  } else {
    filtersDto.value.SortColumn = null;
    filtersDto.value.SortOrder = null;
  }
  refetch();
};

// update filters
const refetch = () => {
  isLoading.value = true;
  paginationPaymentMethod.value.currentPage = 1;
  paginationPaymentMethod.value.limit = options.value.itemsPerPage;

  paymentMethodStore.GetAllPaymentMethods({
    ...filtersDto.value,
    searchFields: filtersDto.value.searchFields,
    isActive: filtersDto.value.isActive,
  });
  isLoading.value = false;
};

class optionsDto {
  groupBy = [];
  itemsPerPage = 8;
  page = 1;
  searchFields = "";
  sortBy = [];
}
const options = ref<optionsDto>(new optionsDto());
const sortedColumnKey = ref();
const sortedColumnOrder = ref();

const updateOptions = (newOptions: optionsDto) => {
  if (isUpdateOptions.value) {
    filtersDto.value = {
      ...filtersDto.value,
      searchFields: newOptions.searchFields,
      SortColumn: filtersDto.value.SortColumn,
      SortOrder: filtersDto.value.SortOrder,
    };
    FnExcute(() => {
      isLoading.value = true;
      paymentMethodStore
        .GetAllPaymentMethods({ ...filtersDto.value })
        .finally(() => {
          isLoading.value = false;
        });
      console.log(newOptions);
    }, 1000);
  }
};

const ids = ref<string[]>([]);
const itemsDelete = ref<string[]>([]);

const deleteItem = (item?: any) => {
  if (ids.value.length > 0) {
    itemsDelete.value = ids.value;
  } else {
    itemsDelete.value = [item.id];
  }
  paymentMethodStore
    .DeletePaymentMethod(item.id, item.name?.ar || item.name?.en)
    .then(() => {
      paymentMethodStore
        .GetAllPaymentMethods({ ...filtersDto.value })
        .then(() => {
          isUpdateOptions.value = true;
        });
    });
};

const deleteSingleItem = (item: any) => {
  ids.value = [];
  itemsDelete.value = [item.id];

  paymentMethodStore
    .DeletePaymentMethod(itemsDelete.value[0], item?.name?.ar || item?.name?.en)
    .then(() => {
      paymentMethodStore
        .GetAllPaymentMethods({ ...filtersDto.value })
        .then(() => {
          isUpdateOptions.value = true;
          refetch();
          ids.value = [];
        });
    });
};

const PaymentMethodForm = ref<VForm>();
const AddLoading = ref(false);

const save = () => {
  PaymentMethodForm.value?.validate().then((res) => {
    if (res.valid) {
      AddLoading.value = true;
      paymentMethodStore
        .AddPaymentMethod({
          ...Add.value,
        })
        .then(() => {
          paymentMethodStore.GetAllPaymentMethods({ ...filtersDto.value });
          isDialogVisible.value = false;
          Add.value = new AddPaymentMethod();
        })
        .finally(() => {
          AddLoading.value = false;
        });
    }
  });
};

const modify = () => {
  PaymentMethodForm.value?.validate().then((res) => {
    if (res.valid) {
      AddLoading.value = true;
      paymentMethodStore
        .ModifyPaymentMethod({
          ...paymentMethodDetails.value,
        })
        .then(() => {
          paymentMethodStore.GetAllPaymentMethods({ ...filtersDto.value });
          modifyDialog.value = false;
        })
        .finally(() => {
          AddLoading.value = false;
        });
    }
  });
};

watch(
  () => options.value,
  (newOptions) => {
    isUpdateOptions.value = true;
    updateOptions(newOptions);
  },
  { deep: true }
);

watch(
  () => paginationPaymentMethod.value.currentPage,
  () => {
    paymentMethodStore.GetAllPaymentMethods({ ...filtersDto.value });
  }
);
</script>

<template>
  <div>
    <!-- 👉 Table -->
    <VCard>
      <VCardTitle>طرق الدفع<VIcon> tabler-credit-card </VIcon></VCardTitle>
      <!-- 👉 Filters -->
      <VCardText>
        <div class="flex justify-between">
          <div class="flex justify-start">
            <h4 class="mb-2">الفلترة</h4>
          </div>
        </div>
        <div class="flex justify-between items-center flex-wrap">
          <VRow>
            <VCol cols="12" md="12">
              <!-- فلتر الحالة -->
              <VAutocomplete
                v-model="filtersDto.isActive"
                clearable
                label="الحالة"
                :items="[
                  { title: 'فعال', value: true },
                  { title: 'غير فعال', value: false },
                ]"
                item-title="title"
                item-value="value"
                class="mx-2"
                @update:model-value="refetch"
              ></VAutocomplete>
            </VCol>
          </VRow>

          <div class="flex justify-center items-center gap-2 mb-5">
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="isDialogVisible = true"
            >
              إضافة طريقة دفع
            </VBtn>
          </div>
        </div>
      </VCardText>

      <VDataTableServer
        v-model="ids"
        v-model:search="search"
        v-model:options="options"
        show-select
        :headers="headers as any"
        :items="paymentMethodList"
        :items-per-page="8"
        :items-length="paginationPaymentMethod.totalCount as any"
        :loading="isLoading"
        :items-per-page-options="[
          { value: 8, title: '8' },
          { value: 25, title: '25' },
          { value: 50, title: '50' },
          { value: 100, title: '100' },
        ]"
        loading-text="جار التحميل"
        no-data-text="لا يوجد بيانات"
        @update:options="updateOptions"
        @update:sort-by="onSortByUpdate"
      >
        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="d-flex gap-1 justify-center align-center">
            <IconBtn @click="openEditDialog(item.id)">
              <VIcon icon="tabler-edit" />
            </IconBtn>
            <IconBtn @click="deleteSingleItem(item)">
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </div>
        </template>

        <!-- Status -->
        <template #item.isActive="{ item }">
          <VChip
            :color="item.isActive ? 'success' : 'error'"
            :text="item.isActive ? 'فعال' : 'غير فعال'"
            size="small"
          />
        </template>

        <!-- Pagination -->
        <template #bottom>
          <VCardText class="pt-2">
            <div
              class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2"
            >
              <VPagination
                v-model="paginationPaymentMethod.currentPage"
                :total-visible="5"
                :length="paginationPaymentMethod.totalPages"
                @update:model-value="
                  paymentMethodStore.GetAllPaymentMethods({ ...filtersDto })
                "
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
    </VCard>
  </div>

  <!-- Dialog للإضافة -->
  <VDialog v-model="isDialogVisible" width="900" persistent>
    <VCard class="w-full">
      <VCardTitle class="">
        <div class="flex flex-col md:flex-row justify-center item-center mt-2">
          <h4 class="text-center">إضافة طريقة دفع</h4>
        </div>
      </VCardTitle>
      <VCardText>
        <VForm ref="PaymentMethodForm">
          <VRow>
            <!-- الاسم بالعربية -->
            <VCol cols="12" md="6">
              <label
                >اسم طريقة الدفع (عربي) <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="Add.nameAr"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم طريقة الدفع بالعربية"
              />
            </VCol>

            <!-- الاسم بالإنجليزية -->
            <VCol cols="12" md="6">
              <label
                >اسم طريقة الدفع (إنجليزي)
                <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="Add.nameEn"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم طريقة الدفع بالإنجليزية"
              />
            </VCol>

            <!-- الكود -->
            <VCol cols="12" md="6">
              <label>كود طريقة الدفع <span class="text-error">*</span></label>
              <AppTextField
                v-model="Add.code"
                :rules="[requiredValidator]"
                placeholder="أدخل كود طريقة الدفع (مثل: VISA, CASH)"
              />
            </VCol>

            <!-- ترتيب العرض -->
            <VCol cols="12" md="6">
              <label>ترتيب العرض</label>
              <AppTextField
                v-model.number="Add.displayOrder"
                type="number"
                placeholder="ترتيب العرض (0 للأول)"
              />
            </VCol>

            <!-- الوصف بالعربية -->
            <VCol cols="12" md="6">
              <label>الوصف (عربي)</label>
              <AppTextarea
                v-model="Add.descriptionAr"
                placeholder="أدخل وصف طريقة الدفع بالعربية"
                rows="3"
              />
            </VCol>

            <!-- الوصف بالإنجليزية -->
            <VCol cols="12" md="6">
              <label>الوصف (إنجليزي)</label>
              <AppTextarea
                v-model="Add.descriptionEn"
                placeholder="أدخل وصف طريقة الدفع بالإنجليزية"
                rows="3"
              />
            </VCol>

            <!-- رفع الأيقونة -->
            <VCol cols="12" md="6">
              <label>أيقونة طريقة الدفع</label>
              <FileUploader v-model="Add.icon" />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="w-full my-4 flex justify-center items-center gap-4">
        <v-btn :loading="AddLoading" color="primary" @click="save">
          إضافة
        </v-btn>
        <v-btn variant="tonal" color="error" @click="cancel">إلغاء</v-btn>
      </VCardText>
    </VCard>
  </VDialog>

  <!-- Dialog للتعديل -->
  <VDialog v-model="modifyDialog" width="900" persistent>
    <VCard class="w-full">
      <VCardTitle class="">
        <div class="flex flex-col md:flex-row justify-center item-center mt-2">
          <h4 class="text-center">تعديل طريقة دفع</h4>
        </div>
      </VCardTitle>
      <VCardText>
        <VForm ref="PaymentMethodForm">
          <VRow>
            <!-- الاسم بالعربية -->
            <VCol cols="12" md="6">
              <label
                >اسم طريقة الدفع (عربي) <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="paymentMethodDetails.nameAr"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم طريقة الدفع بالعربية"
              />
            </VCol>

            <!-- الاسم بالإنجليزية -->
            <VCol cols="12" md="6">
              <label
                >اسم طريقة الدفع (إنجليزي)
                <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="paymentMethodDetails.nameEn"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم طريقة الدفع بالإنجليزية"
              />
            </VCol>

            <!-- الكود -->
            <VCol cols="12" md="6">
              <label>كود طريقة الدفع <span class="text-error">*</span></label>
              <AppTextField
                v-model="paymentMethodDetails.code"
                :rules="[requiredValidator]"
                placeholder="أدخل كود طريقة الدفع (مثل: VISA, CASH)"
              />
            </VCol>

            <!-- ترتيب العرض -->
            <VCol cols="12" md="6">
              <label>ترتيب العرض</label>
              <AppTextField
                v-model.number="paymentMethodDetails.displayOrder"
                type="number"
                placeholder="ترتيب العرض (0 للأول)"
              />
            </VCol>

            <!-- الوصف بالعربية -->
            <VCol cols="12" md="6">
              <label>الوصف (عربي)</label>
              <AppTextarea
                v-model="paymentMethodDetails.descriptionAr"
                placeholder="أدخل وصف طريقة الدفع بالعربية"
                rows="3"
              />
            </VCol>

            <!-- الوصف بالإنجليزية -->
            <VCol cols="12" md="6">
              <label>الوصف (إنجليزي)</label>
              <AppTextarea
                v-model="paymentMethodDetails.descriptionEn"
                placeholder="أدخل وصف طريقة الدفع بالإنجليزية"
                rows="3"
              />
            </VCol>

            <!-- حالة طريقة الدفع -->
            <VCol cols="12" md="6">
              <label>الحالة<span class="text-error">*</span></label>
              <VAutocomplete
                v-model="paymentMethodDetails.isActive"
                :items="[
                  { title: 'فعال', value: true },
                  { title: 'غير فعال', value: false },
                ]"
                item-title="title"
                item-value="value"
                :rules="[requiredValidator]"
              ></VAutocomplete>
            </VCol>

            <!-- رفع الأيقونة -->
            <VCol cols="12" md="6">
              <label>أيقونة طريقة الدفع</label>
              <FileUploader v-model:url="paymentMethodDetails.icon" />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="w-full my-4 flex justify-center items-center gap-4">
        <v-btn :loading="AddLoading" color="primary" @click="modify">
          تعديل
        </v-btn>
        <v-btn variant="tonal" color="error" @click="cancel">إلغاء</v-btn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
