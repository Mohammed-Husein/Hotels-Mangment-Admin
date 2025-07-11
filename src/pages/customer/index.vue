<script setup lang="ts">
import { router } from "@/plugins/1.router";
import { useCustomerStore } from "./Customer";
import { CustomersFiltersDto } from "./api/dto";

const store = useCustomerStore();
const isLoading = ref<boolean>(false);
const { FnExcute } = useTimerFn();
const search = ref("");
const { CustomerList, paginationCustomer } = storeToRefs(store);
const filtersDto = ref(new CustomersFiltersDto());
const isUpdateOptions = ref(false);
const dialogDelete = ref(false);
const ids = ref<string[]>([]);

// headers
const headers = computed(() => [
  {
    title: "رقم ID ",
    key: "number",
    align: "center",
  },
  {
    title: "اسم العميل الاول",
    key: "firstName",
    align: "center",
  },
  {
    title: "اسم العميل الثاني",
    key: "lastName",
    align: "center",
  },
  { title: "رقم الموبايل ", key: "phoneNumber", align: "center" },
  { title: "اسم البلد ", key: "countryName", align: "center" },
  { title: "الحالة  ", key: "status", align: "center" },
  {
    title: "إجراءات",
    key: "actions",
    align: "center",
    sortable: false,
  },
]);

onMounted(() => {
  store.GetAllCustomer({ ...filtersDto.value }).then(() => {
    isUpdateOptions.value = true;
  });
});

// update filters
const refetch = () => {
  paginationCustomer.value.currentPage = 1;
  paginationCustomer.value.limit = options.value.itemsPerPage;

  store.GetAllCustomer({
    ...filtersDto.value,
    search: filtersDto.value.search,
    sortBy: filtersDto.value.sortBy,
    sortOrder: filtersDto.value.sortOrder,
  });
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

      sortBy: filtersDto.value.sortBy,
      sortOrder: filtersDto.value.sortOrder,
    };
    FnExcute(() => {
      isLoading.value = true;
      store.GetAllCustomer({ ...filtersDto.value }).finally(() => {
        isLoading.value = false;
      });
      console.log(newOptions);
    }, 1000);
  }
};
const itemsDelete = ref<string[]>([]);

// Delete
const deleteItem = (item?: any) => {
  dialogDelete.value = true;
  if (ids.value.length > 0) {
    // Multiple items selected
    itemsDelete.value = ids.value;
  } else {
    // Single item
    console.log("test", item.id);
    itemsDelete.value = [item.id];
  }
  store.DeleteCustomer(itemsDelete.value, item?.fullName).then(() => {
    store.GetAllCustomer({ ...filtersDto.value });
    ids.value = [];
  });
};
const deleteSingleItem = (item: any) => {
  // إلغاء تحديد العناصر الأخرى
  ids.value = [];
  itemsDelete.value = [item.id];

  store.DeleteCustomer(item.id, item?.firstName).then(() => {
    store.GetAllCustomer({ ...filtersDto.value }).then(() => {
      isUpdateOptions.value = true;
      refetch();
      ids.value = []; // تأكد من إفراغ التحديد
    });
  });
};
// Handle sorting changes
const onSortByUpdate = (sortBy: Array<{ key: string; order: string }>) => {
  if (sortBy.length > 0) {
    const formattedKey =
      sortBy[0].key.charAt(0).toUpperCase() + sortBy[0].key.slice(1);

    sortedColumnKey.value = formattedKey;
    sortedColumnOrder.value = sortBy[0].order === "asc" ? "asc" : "desc"; // 'asc' or 'desc'

    // Update filtersDto with sorting info
    filtersDto.value.sortBy = sortedColumnKey as any;
    filtersDto.value.sortOrder = sortedColumnOrder as any;
  }
};
</script>

<template>
  <h3 class="text-primary mb-5">العملاء <VIcon> tabler-user </VIcon></h3>

  <div>
    <!-- 👉 Table -->
    <VCard>
      <!-- 👉 Filters -->
      <VCardText>
        <div class="flex justify-between">
          <div class="flex justify-start">
            <h4 class="mb-2">العملاء</h4>
          </div>
          <div v-if="ids.length > 1" class="mb-2">
            <VBtn color="error" @click="deleteItem()">حذف المحدد</VBtn>
          </div>
        </div>
        <div class="flex justify-between items-center flex-wrap">
          <div class="flex justify-center items-center flex-wrap gap-4">
            <AppTextField
              clearable
              placeholder="البحث عن اسم العميل , اسم الشركة  "
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
              style="max-inline-size: 80px; min-inline-size: 80px"
              @update:model-value="refetch"
            />
            <!-- pdf excel -->

            <ExportToExcel
              url="Customer/ExportToExcel"
              page-name="العملاء"
              :ids="ids"
              class="mt-1"
              ids-key="customerIds"
            />
            <ExportToPdf
              url="Customer/GetPdf"
              page-name="العملاء"
              :ids="ids"
              query="Ids"
              class="mt-1"
              ids-key="ids"
            />

            <VBtn
              class="mt-1 mx-1"
              @click="router.push('/customer/components/AddCustomer')"
            >
              إضافة عميل<VIcon class="px-1"> tabler-plus </VIcon>
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
        :items="CustomerList"
        :items-per-page="8"
        :items-length="paginationCustomer.totalCount as any"
        :loading="isLoading"
        :server-items-length="paginationCustomer.limit"
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
        <template #item.actions="{ item }">
          <div class="d-flex gap-1 justify-center align-center">
            <IconBtn @click="router.push(`/customer/${item.id}`)">
              <VIcon icon="tabler-edit" />
            </IconBtn>
            <IconBtn @click="deleteSingleItem(item)">
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
          <div v-if="item.status === 'Suspended'" class="">
            <VChip color="error "> محظور </VChip>
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
                {{ paginationCustomer.totalCount }} ادخال
              </p>

              <VPagination
                v-model="paginationCustomer.currentPage"
                :total-visible="5"
                :length="paginationCustomer.totalPages"
                @update:model-value="store.GetAllCustomer({ ...filtersDto })"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
    </VCard>
  </div>
</template>
