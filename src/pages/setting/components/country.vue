<script setup lang="ts">
import { VForm } from "vuetify/lib/components/index.mjs";
import { AddCountry, filterCountryDto } from "../api/dto";
import { useSettingStore } from "../settiing";
const store = useSettingStore();
const isLoading = ref<boolean>(false);
const { FnExcute } = useTimerFn();
const search = ref("");
const { countryList, paginationCountry, Details } = storeToRefs(store);
const filtersDto = ref(new filterCountryDto());
const isUpdateOptions = ref(false);
const dialogDelete = ref(false);
const isDialogVisible = ref(false);
const modifyDialog = ref(false);
const Add = ref<AddCountry>({ ...new AddCountry() });

// const storeRole = useRoleStore();
// const { RoleNameList } = storeToRefs(storeRole);
// if (!RoleNameList.value) {
//   RoleNameList.value = [];
// }
// headers
const headers = computed(() => [
  {
    title: " اسم البلد ",
    key: "name",
    align: "center",
  },
  {
    title: "الكود ",
    key: "code",
    align: "center",
  },
  {
    title: "عدد المحافظات المرتبطة بها ",
    key: "numberOfCities",
    align: "center",
  },

  {
    title: "إجراءات",
    key: "actions",
    align: "center",
    sortable: false,
  },
]);

// update filters
const refetch = () => {
  isLoading.value = true;

  paginationCountry.value.currentPage = 1;
  paginationCountry.value.limit = options.value.itemsPerPage;

  store.GetAllCountry({
    ...filtersDto.value,
    searchFields: filtersDto.value.searchFields,
    // role: filtersDto.value.role,
    isActive: filtersDto.value.isActive,
    // SortColumn: filtersDto.value.SortColumn,
    // SortOrder: filtersDto.value.SortOrder,
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
      //   status: filtersDto.value.status,
      //   RoleId: filtersDto.value.RoleId,

      SortColumn: filtersDto.value.SortColumn,
      SortOrder: filtersDto.value.SortOrder,
    };
    FnExcute(() => {
      isLoading.value = true;
      store.GetAllCountry({ ...filtersDto.value }).finally(() => {
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
    // Multiple items selected
    itemsDelete.value = ids.value;
  } else {
    // Single item
    itemsDelete.value = [item.id];
  }
  store.DeleteCountry(item.id, item.name).then(() => {
    store.GetAllCountry({ ...filtersDto.value }).then(() => {
      isUpdateOptions.value = true;
    });
  });
};
const deleteSingleItem = (item: any) => {
  // إلغاء تحديد العناصر الأخرى
  ids.value = [];
  itemsDelete.value = [item.id];

  store.DeleteEmployee(itemsDelete.value, item?.name).then(() => {
    store.GetAllCountry({ ...filtersDto.value }).then(() => {
      isUpdateOptions.value = true;
      refetch();
      ids.value = []; // تأكد من إفراغ التحديد
    });
  });
};

const CountryForm = ref<VForm>();
const AddLoading = ref(false);

const save = () => {
  CountryForm.value?.validate().then((res) => {
    if (res.valid) {
      AddLoading.value = true;

      // حالة إضافة دولة جديدة
      store
        .AddCountry({
          ...Add.value,
        })
        .then(() => {
          store.GetAllCountry({ ...filtersDto.value });
          isDialogVisible.value = false;
          Add.value = new AddCountry();
        })
        .finally(() => {
          AddLoading.value = false;
        });
    }
  });
};
const modify = () => {
  CountryForm.value?.validate().then((res) => {
    if (res.valid) {
      AddLoading.value = true;
      store
        .ModifyCountry({
          ...Details.value,
        })
        .then(() => {
          store.GetAllCountry({ ...filtersDto.value });
          modifyDialog.value = false;
        })
        .finally(() => {
          AddLoading.value = false;
        });
    }
  });
};
const openEditDialog = async (id: any) => {
  if (id) {
    await store.GetCountryById(id).then(() => {
      modifyDialog.value = true;
    });
  }
};
const cancel = () => {
  isDialogVisible.value = false;
  modifyDialog.value = false;
  Add.value = new AddCountry();
};
// Handle sorting changes
const onSortByUpdate = (sortBy: Array<{ key: string; order: string }>) => {
  if (sortBy && sortBy.length > 0) {
    const formattedKey =
      sortBy[0]?.key?.charAt(0)?.toUpperCase() + sortBy[0]?.key?.slice(1);

    sortedColumnKey.value = formattedKey;
    sortedColumnOrder.value = sortBy[0]?.order === "asc" ? "asc" : "desc";

    // Update filtersDto with sorting info
    filtersDto.value.SortColumn = sortedColumnKey as any;
    filtersDto.value.SortOrder = sortedColumnOrder as any;
  }
  refetch();
};
onMounted(() => {
  isLoading.value = true;
  store.GetAllCountry({ ...filtersDto.value });
  isLoading.value = false;
});
// storeRole.GetAllNameRoles();
</script>

<template>
  <div>
    <!-- 👉 Table -->
    <VCard>
      <VCardTitle>المدن<VIcon> tabler-home </VIcon></VCardTitle
      ><!-- 👉 Filters -->
      <VCardText>
        <div class="flex justify-between">
          <div class="flex justify-start">
            <h4 class="mb-2">الفلترة</h4>
          </div>
          <!-- <div v-if="ids.length > 1" class="mb-2">
            <VBtn color="error" @click="deleteItem()">حذف المحدد</VBtn>
          </div> -->
        </div>
        <div class="flex justify-between items-center flex-wrap">
          <div class="flex justify-center items-center gap-2 mb-5">
            <!-- <VAutocomplete
              v-model="filtersDto.isActive"
              clearable
              label="المهام*"
              :items="[
                { title: 'الادمن', value: 'Admin' },
                { title: 'المالك ', value: 'SuperAdmin' },
                // { title: 'معطل ', value: 'Inactive' },
              ]"
              item-title="title"
              item-value="value"
              class="mx-2"
              @update:model-value="refetch"
              style="max-inline-size: 490px; min-inline-size: 490px"
            /> -->

            <VAutocomplete
              v-model="filtersDto.isActive"
              clearable
              label="الحالة"
              :items="[
                { title: 'نشط', value: 'true' },
                { title: 'معطل ', value: 'false' },
                // { title: 'معطل ', value: 'Inactive' },
              ]"
              item-title="title"
              item-value="value"
              @update:model-value="refetch"
              style="max-inline-size: 490px; min-inline-size: 490px"
            />
          </div>
          <VDivider />
          <div class="flex justify-center items-center flex-wrap gap-4">
            <AppTextField
              clearable
              placeholder="البحث عن اسم المدينه ,  الكود "
              class="mt-5"
              style="max-inline-size: 300px; min-inline-size: 300px"
              v-model="filtersDto.searchFields"
              @update:model-value="refetch"
            />
          </div>
          <div class="mt-5 flex">
            <VSelect
              v-model="options.itemsPerPage"
              type="number"
              min="-1"
              max="15"
              hide-details
              class="mt-1"
              :items="[
                { value: 8, title: '8' },
                { value: 25, title: '25' },
                { value: 50, title: '50' },
                { value: 100, title: '100' },
              ]"
              item-value="value"
              item-title="title"
              @update:model-value="refetch"
              style="max-inline-size: 80px; min-inline-size: 80px"
            />
            <!-- pdf excel -->

            <ExportToExcel
              url="Employee/ExportToExcel"
              page-name="الموظفين"
              :ids="ids"
              class="mt-1"
              ids-key="employeeIds"
            />
            <ExportToPdf
              url="Employee/GetPdf"
              page-name="الموظفين"
              :ids="ids"
              query="Ids"
              class="mt-1"
              ids-key="ids"
            />

            <VBtn class="mt-1 mx-1" @click="isDialogVisible = true">
              إضافة مدينة<VIcon class="px-1"> tabler-plus </VIcon>
            </VBtn>
          </div>
        </div>
      </VCardText>
      <VDivider />

      <VDataTableServer
        v-model="ids"
        v-model:search="search"
        v-model:options="options"
        show-select
        :headers="headers as any"
        :items="countryList"
        :items-per-page="8"
        :items-length="paginationCountry.totalCount as any"
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

            <IconBtn @click="deleteItem(item)">
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </div>
        </template>

        <!-- <template #item.status="{ item }">
          <div v-if="item.status === 'Inactive'" class="">
            <VChip color="error "> معطل </VChip>
          </div>
          <div v-if="item.status === 'Active'" class="">
            <VChip color="success "> نشط </VChip>
          </div>
        </template> -->

        <template #bottom>
          <VDivider />

          <VCardText class="pt-2">
            <div
              class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2"
            >
              <p class="mt-2">
                عرض 1 الى {{ options.itemsPerPage }} من اصل
                {{ paginationCountry.totalCount }} ادخال
              </p>

              <VPagination
                v-model="paginationCountry.currentPage"
                :total-visible="5"
                :length="paginationCountry.totalPages"
                @update:model-value="store.GetAllCountry({ ...filtersDto })"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
  <VDialog v-model="isDialogVisible" width="800" persistent>
    <VCard class="w-full">
      <VCardTitle class="">
        <div class="flex flex-col md:flex-row justify-center item-center mt-2">
          <h4 class="text-center">
            {{ Add.id == null ? "إضافة دولة" : "تعديل دولة" }}
          </h4>
        </div>
      </VCardTitle>
      <VCardText>
        <VForm ref="CountryForm">
          <VRow>
            <!-- الاسم بالعربية -->
            <VCol cols="12" md="6">
              <label>اسم الدولة (عربي) <span class="text-error">*</span></label>
              <AppTextField
                v-model="Add.name.ar"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم الدولة بالعربية"
              ></AppTextField>
            </VCol>

            <!-- الاسم بالإنجليزية -->
            <VCol cols="12" md="6">
              <label
                >اسم الدولة (إنجليزي) <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="Add.name.en"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم الدولة بالإنجليزية"
              ></AppTextField>
            </VCol>

            <!-- كود الدولة -->
            <VCol cols="12" md="6">
              <label>كود الدولة <span class="text-error">*</span></label>
              <AppTextField
                v-model="Add.code"
                :rules="[requiredValidator]"
                placeholder="مثال: AE"
              ></AppTextField>
            </VCol>

            <!-- حالة الدولة (للتعديل فقط) -->
            <VCol cols="12" md="6">
              <label>الحالة<span class="text-error">*</span></label>
              <VAutocomplete
                v-model="Add.isActive"
                :items="[
                  { title: 'فعال', value: 'true' },
                  { title: 'غير فعال', value: 'false' },
                ]"
                item-title="title"
                item-value="value"
                :rules="[requiredValidator]"
              ></VAutocomplete>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="w-full my-4 flex justify-center items-center gap-4">
        <v-btn
          :loading="AddLoading"
          color="primary"
          v-if="Add.id == null"
          @click="save"
        >
          {{ Add.id == null ? "إضافة" : "تعديل" }}
        </v-btn>
        <v-btn variant="tonal" color="error" @click="cancel">إلغاء</v-btn>
      </VCardText>
    </VCard>
  </VDialog>
  <VDialog v-model="modifyDialog" width="800" persistent>
    <VCard class="w-full">
      <VCardTitle class="">
        <div class="flex flex-col md:flex-row justify-center item-center mt-2">
          <h4 class="text-center">تعديل بلد</h4>
        </div>
      </VCardTitle>
      <VCardText>
        <VForm ref="CountryForm">
          <VRow>
            <!-- الاسم بالعربية -->
            <VCol cols="12" md="6">
              <label>اسم الدولة (عربي) <span class="text-error">*</span></label>
              <AppTextField
                v-model="Details.name.ar"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم الدولة بالعربية"
              ></AppTextField>
            </VCol>

            <!-- الاسم بالإنجليزية -->
            <VCol cols="12" md="6">
              <label
                >اسم الدولة (إنجليزي) <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="Details.name.en"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم الدولة بالإنجليزية"
              ></AppTextField>
            </VCol>

            <!-- كود الدولة -->
            <VCol cols="12" md="6">
              <label>كود الدولة <span class="text-error">*</span></label>
              <AppTextField
                v-model="Details.code"
                :rules="[requiredValidator]"
                placeholder="مثال: AE"
                maxlength="2"
              ></AppTextField>
            </VCol>

            <!-- حالة الدولة (للتعديل فقط) -->
            <VCol cols="12" md="6">
              <label>الحالة<span class="text-error">*</span></label>
              <VAutocomplete
                v-model="Details.isActive"
                :items="[
                  { title: 'فعال', value: 'true' },
                  { title: 'غير فعال', value: 'false' },
                ]"
                item-title="title"
                item-value="value"
                :rules="[requiredValidator]"
              ></VAutocomplete>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardText class="w-full my-4 flex justify-center items-center gap-4">
        <v-btn :loading="AddLoading" color="primary" @click="modify">
          تعديل</v-btn
        >
        <v-btn variant="tonal" color="error" @click="cancel">إلغاء</v-btn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
