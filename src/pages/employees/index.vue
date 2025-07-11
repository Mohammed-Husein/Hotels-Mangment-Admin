<script setup lang="ts">
import { router } from "@/plugins/1.router";
import { FilterEmployeeDto } from "./api/dto";
import { useEmployeeStore } from "./employee";

const store = useEmployeeStore();
const isLoading = ref<boolean>(false);
const { FnExcute } = useTimerFn();
const search = ref("");
const { EmployeeList, paginationEmployee } = storeToRefs(store);
const filtersDto = ref(new FilterEmployeeDto());
const isUpdateOptions = ref(false);
const dialogDelete = ref(false);

// const storeRole = useRoleStore();
// const { RoleNameList } = storeToRefs(storeRole);
// if (!RoleNameList.value) {
//   RoleNameList.value = [];
// }
// headers
const headers = computed(() => [
  {
    title: "رقم الموظف ",
    key: "number",
    align: "center",
  },
  {
    title: "اسم الموظف",
    key: "fullName",
    align: "center",
  },
  { title: "البريد الإلكتروني", key: "email", align: "center" },
  { title: "رقم الهاتف", key: "phoneNumber", align: "center" },
  { title: "المهام", key: "roleName", align: "center" },
  { title: "الحالة ", key: "status", align: "center" },
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

  paginationEmployee.value.currentPage = 1;
  paginationEmployee.value.limit = options.value.itemsPerPage;

  store.GetAllEmployees({
    ...filtersDto.value,
    search: filtersDto.value.search,
    role: filtersDto.value.role,
    status: filtersDto.value.status,
    // SortColumn: filtersDto.value.SortColumn,
    // SortOrder: filtersDto.value.SortOrder,
  });
  isLoading.value = false;
};

class optionsDto {
  groupBy = [];
  itemsPerPage = 8;
  page = 1;
  search = "";
  sortBy = [];
}
const options = ref<optionsDto>(new optionsDto());
const sortedColumnKey = ref();
const sortedColumnOrder = ref();

const updateOptions = (newOptions: optionsDto) => {
  if (isUpdateOptions.value) {
    filtersDto.value = {
      ...filtersDto.value,
      search: newOptions.search,
      //   status: filtersDto.value.status,
      //   RoleId: filtersDto.value.RoleId,

      SortColumn: filtersDto.value.SortColumn,
      SortOrder: filtersDto.value.SortOrder,
    };
    FnExcute(() => {
      isLoading.value = true;
      store.GetAllEmployees({ ...filtersDto.value }).finally(() => {
        isLoading.value = false;
      });
      console.log(newOptions);
    }, 1000);
  }
};

const ids = ref<string[]>([]);
const itemsDelete = ref<string[]>([]);

// const deleteItem = (item?: any) => {
//   if (ids.value.length > 0) {
//     // Multiple items selected
//     itemsDelete.value = ids.value;
//   } else {
//     // Single item
//     itemsDelete.value = [item.id];
//   }
//   store.DeleteEmployee(itemsDelete.value, item?.fullName).then(() => {
//     store.GetAllEmployees({ ...filtersDto.value }).then(() => {
//       isUpdateOptions.value = true;
//     });
//   });
// };
const deleteSingleItem = (item: any) => {
  // إلغاء تحديد العناصر الأخرى
  ids.value = [];
  itemsDelete.value = [item.id];

  store.DeleteEmployee(item.id, item?.fullName).then(() => {
    store.GetAllEmployees({ ...filtersDto.value }).then(() => {
      isUpdateOptions.value = true;
      refetch();
      ids.value = []; // تأكد من إفراغ التحديد
    });
  });
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
  store.GetAllEmployees({ ...filtersDto.value });
  isLoading.value = false;
});
// storeRole.GetAllNameRoles();
</script>

<template>
  <h3 class="mb-5">الموظفين <VIcon> tabler-users </VIcon></h3>

  <div>
    <!-- 👉 Table -->
    <VCard>
      <!-- 👉 Filters -->
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
            <VAutocomplete
              v-model="filtersDto.role"
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
            />

            <VAutocomplete
              v-model="filtersDto.status"
              clearable
              label="الحالة"
              :items="[
                { title: 'نشط', value: 'Active' },
                { title: 'معطل ', value: 'Inactive' },
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
              placeholder="البحث عن اسم الموظف , البريد الإلكتروني "
              class="mt-5"
              style="max-inline-size: 300px; min-inline-size: 300px"
              v-model="filtersDto.search"
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

            <VBtn
              class="mt-1 mx-1"
              @click="router.push('/employees/components/AddEmployee')"
            >
              إضافة موظف<VIcon class="px-1"> tabler-plus </VIcon>
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
        :items="EmployeeList"
        :items-per-page="8"
        :items-length="paginationEmployee.totalCount as any"
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
            <IconBtn @click="router.push(`/employees/${item.id}`)">
              <VIcon icon="tabler-edit" />
            </IconBtn>

            <IconBtn
              v-if="item?.role !== 'SuperAdmin'"
              @click="deleteSingleItem(item)"
            >
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </div>
        </template>

        <template #item.status="{ item }">
          <div v-if="item.status === 'Inactive'" class="">
            <VChip color="error "> معطل </VChip>
          </div>
          <div v-if="item.status === 'Active'" class="">
            <VChip color="success "> نشط </VChip>
          </div>
        </template>
        <template #item.phoneNumber="{ item }"
          ><span dir="ltr">{{ item.phoneNumber }}</span>
        </template>

        <template #bottom>
          <VDivider />

          <VCardText class="pt-2">
            <div
              class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2"
            >
              <p class="mt-2">
                عرض 1 الى {{ options.itemsPerPage }} من اصل
                {{ paginationEmployee.totalCount }} ادخال
              </p>

              <VPagination
                v-model="paginationEmployee.currentPage"
                :total-visible="5"
                :length="paginationEmployee.totalPages"
                @update:model-value="store.GetAllEmployees({ ...filtersDto })"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
