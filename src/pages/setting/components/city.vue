<script setup lang="ts">
import { VForm } from "vuetify/lib/components/index.mjs";
import { AddCity, filterCityDto } from "../api/dto";
import { useCityStore } from "../cityStore";
import { useSettingStore } from "../settiing";

// إضافة الـ imports الناقصة

const cityStore = useCityStore();
const countryStore = useSettingStore();
countryStore.GetAllCountryNames();
const isLoading = ref<boolean>(false);
const { FnExcute } = useTimerFn();
const search = ref("");
const { cityList, paginationCity, cityDetails } = storeToRefs(cityStore);
const { CountryNameList } = storeToRefs(countryStore);
const filtersDto = ref(new filterCityDto());
const isUpdateOptions = ref(false);
const dialogDelete = ref(false);
const isDialogVisible = ref(false);
const modifyDialog = ref(false);
const Add = ref<AddCity>({ ...new AddCity() });

// جلب قائمة الدول عند تحميل المكون
onMounted(() => {
  countryStore.GetAllCountry({
    isActive: true,
    searchFields: null,
    SortOrder: null,
    SortColumn: null,
  });
  refetch();
});

const headers = [
  { title: "اسم المدينة", key: "name", sortable: true },
  { title: "البلد", key: "country", sortable: true },
  { title: "عدد المناطق", key: "numberOfRegions", sortable: false },
  { title: "الإجراءات", key: "actions", sortable: false },
];

const cancel = () => {
  isDialogVisible.value = false;
  modifyDialog.value = false;
  Add.value = new AddCity();
};

const openEditDialog = (id: string) => {
  cityStore.GetCityById(id).then(() => {
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
  paginationCity.value.currentPage = 1;
  paginationCity.value.limit = options.value.itemsPerPage;

  cityStore.GetAllCities({
    ...filtersDto.value,
    searchFields: filtersDto.value.searchFields,
    isActive: filtersDto.value.isActive,
    countryId: filtersDto.value.countryId,
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
      cityStore.GetAllCities({ ...filtersDto.value }).finally(() => {
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
  cityStore.DeleteCity(item.id, item.name).then(() => {
    cityStore.GetAllCities({ ...filtersDto.value }).then(() => {
      isUpdateOptions.value = true;
    });
  });
};

const deleteSingleItem = (item: any) => {
  ids.value = [];
  itemsDelete.value = [item.id];

  cityStore.DeleteCity(itemsDelete.value[0], item?.name).then(() => {
    cityStore.GetAllCities({ ...filtersDto.value }).then(() => {
      isUpdateOptions.value = true;
      refetch();
      ids.value = [];
    });
  });
};

const CityForm = ref<VForm>();
const AddLoading = ref(false);

const save = () => {
  CityForm.value?.validate().then((res) => {
    if (res.valid) {
      AddLoading.value = true;
      cityStore
        .AddCity({
          ...Add.value,
        })
        .then(() => {
          cityStore.GetAllCities({ ...filtersDto.value });
          isDialogVisible.value = false;
          Add.value = new AddCity();
        })
        .finally(() => {
          AddLoading.value = false;
        });
    }
  });
};

const modify = () => {
  CityForm.value?.validate().then((res) => {
    if (res.valid) {
      AddLoading.value = true;
      cityStore
        .ModifyCity({
          ...cityDetails.value,
        })
        .then(() => {
          cityStore.GetAllCities({ ...filtersDto.value });
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
  () => paginationCity.value.currentPage,
  () => {
    cityStore.GetAllCities({ ...filtersDto.value });
  }
);
</script>

<template>
  <div>
    <!-- 👉 Table -->
    <VCard>
      <VCardTitle>المدن<VIcon> tabler-building </VIcon></VCardTitle>
      <!-- 👉 Filters -->
      <VCardText>
        <div class="flex justify-between">
          <div class="flex justify-start">
            <h4 class="mb-2">الفلترة</h4>
          </div>
        </div>
        <div class="flex justify-between items-center flex-wrap">
          <VRow>
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="filtersDto.countryId"
                clearable
                label="البلد"
                :items="CountryNameList"
                item-title="name"
                item-value="id"
                class="mx-2"
                @update:model-value="refetch"
              ></VAutocomplete
            ></VCol>
            <VCol cols="12" md="6">
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
              ></VAutocomplete
            ></VCol>
          </VRow>

          <div class="flex justify-center items-center gap-2">
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="isDialogVisible = true"
            >
              إضافة مدينة
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
        :items="cityList"
        :items-per-page="8"
        :items-length="paginationCity.totalCount as any"
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

        <!-- Pagination -->
        <template #bottom>
          <VCardText class="pt-2">
            <div
              class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2"
            >
              <VPagination
                v-model="paginationCity.currentPage"
                :total-visible="5"
                :length="paginationCity.totalPages"
                @update:model-value="cityStore.GetAllCities({ ...filtersDto })"
              />
            </div>
          </VCardText>
        </template>
      </VDataTableServer>
    </VCard>
  </div>

  <!-- Dialog للإضافة -->
  <VDialog v-model="isDialogVisible" width="800" persistent>
    <VCard class="w-full">
      <VCardTitle class="">
        <div class="flex flex-col md:flex-row justify-center item-center mt-2">
          <h4 class="text-center">إضافة مدينة</h4>
        </div>
      </VCardTitle>
      <VCardText>
        <VForm ref="CityForm">
          <VRow>
            <!-- الاسم بالعربية -->
            <VCol cols="12" md="6">
              <label
                >اسم المدينة (عربي) <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="Add.name.ar"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم المدينة بالعربية"
              />
            </VCol>

            <!-- الاسم بالإنجليزية -->
            <VCol cols="12" md="6">
              <label>اسم المدينة (إنجليزي)</label>
              <AppTextField
                v-model="Add.name.en"
                placeholder="أدخل اسم المدينة بالإنجليزية"
              />
            </VCol>

            <!-- البلد -->
            <VCol cols="12" md="6">
              <label>البلد <span class="text-error">*</span></label>
              <VAutocomplete
                v-model="Add.countryId"
                :items="CountryNameList"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                placeholder="اختر البلد"
              ></VAutocomplete>
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
  <VDialog v-model="modifyDialog" width="800" persistent>
    <VCard class="w-full">
      <VCardTitle class="">
        <div class="flex flex-col md:flex-row justify-center item-center mt-2">
          <h4 class="text-center">تعديل مدينة</h4>
        </div>
      </VCardTitle>
      <VCardText>
        <VForm ref="CityForm">
          <VRow>
            <!-- الاسم بالعربية -->
            <VCol cols="12" md="6">
              <label
                >اسم المدينة (عربي) <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="cityDetails.name.ar"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم المدينة بالعربية"
              />
            </VCol>

            <!-- الاسم بالإنجليزية -->
            <VCol cols="12" md="6">
              <label>اسم المدينة (إنجليزي)</label>
              <AppTextField
                v-model="cityDetails.name.en"
                placeholder="أدخل اسم المدينة بالإنجليزية"
              />
            </VCol>

            <!-- البلد -->
            <VCol cols="12" md="6">
              <label>البلد <span class="text-error">*</span></label>
              <VAutocomplete
                v-model="cityDetails.countryId"
                :items="CountryNameList"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                placeholder="اختر البلد"
              ></VAutocomplete>
            </VCol>

            <!-- حالة المدينة -->
            <VCol cols="12" md="6">
              <label>الحالة<span class="text-error">*</span></label>
              <VAutocomplete
                v-model="cityDetails.isActive"
                :items="[
                  { title: 'فعال', value: true },
                  { title: 'غير فعال', value: false },
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
          تعديل
        </v-btn>
        <v-btn variant="tonal" color="error" @click="cancel">إلغاء</v-btn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
