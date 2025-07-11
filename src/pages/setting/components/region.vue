<script setup lang="ts">
import { VForm } from "vuetify/lib/components/index.mjs";
import { AddRegion, filterRegionDto } from "../api/dto";
import { useCityStore } from "../cityStore";
import { useRegionStore } from "../regionStore";
import { useSettingStore } from "../settiing";

// إضافة الـ validator المطلوب

const regionStore = useRegionStore();
const countryStore = useSettingStore();
const cityStore = useCityStore();
const isLoading = ref<boolean>(false);
const { FnExcute } = useTimerFn();
const search = ref("");
const { regionList, paginationRegion, regionDetails, citiesList } =
  storeToRefs(regionStore);
const { CountryNameList } = storeToRefs(countryStore);
const { CityNameList } = storeToRefs(cityStore);
const filtersDto = ref(new filterRegionDto());
const isUpdateOptions = ref(false);
const dialogDelete = ref(false);
const isDialogVisible = ref(false);
const modifyDialog = ref(false);
const Add = ref<AddRegion>({ ...new AddRegion() });

// جلب قائمة الدول والمدن عند تحميل المكون
onMounted(() => {
  countryStore.GetAllCountry({
    isActive: true,
    searchFields: null,
    SortOrder: null,
    SortColumn: null,
  });
  refetch();
  cityStore.GetAllCityNames();
  // console.log(CityNameList, "CityNameList");
});

const headers = [
  { title: "اسم المنطقة", key: "name", sortable: true },
  { title: "المدينة", key: "cityName", sortable: true },
  { title: "البلد", key: "countryName", sortable: true },
  { title: "الإجراءات", key: "actions", sortable: false },
];

const cancel = () => {
  isDialogVisible.value = false;
  modifyDialog.value = false;
  Add.value = new AddRegion();
};

const openEditDialog = (id: string) => {
  regionStore.GetRegionById(id).then(() => {
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
  paginationRegion.value.currentPage = 1;
  paginationRegion.value.limit = options.value.itemsPerPage;

  regionStore.GetAllRegions({
    ...filtersDto.value,
    searchFields: filtersDto.value.searchFields,
    isActive: filtersDto.value.isActive,
    countryId: filtersDto.value.countryId,
    governorateId: filtersDto.value.governorateId,
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
      regionStore.GetAllRegions({ ...filtersDto.value }).finally(() => {
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
  regionStore.DeleteRegion(item.id, item.name).then(() => {
    regionStore.GetAllRegions({ ...filtersDto.value }).then(() => {
      isUpdateOptions.value = true;
    });
  });
};

const deleteSingleItem = (item: any) => {
  ids.value = [];
  itemsDelete.value = [item.id];

  regionStore.DeleteRegion(itemsDelete.value[0], item?.name).then(() => {
    regionStore.GetAllRegions({ ...filtersDto.value }).then(() => {
      isUpdateOptions.value = true;
      refetch();
      ids.value = [];
    });
  });
};

const RegionForm = ref<VForm>();
const AddLoading = ref(false);

const save = () => {
  RegionForm.value?.validate().then((res) => {
    if (res.valid) {
      AddLoading.value = true;
      regionStore
        .AddRegion({
          ...Add.value,
        })
        .then(() => {
          regionStore.GetAllRegions({ ...filtersDto.value });
          isDialogVisible.value = false;
          Add.value = new AddRegion();
        })
        .finally(() => {
          AddLoading.value = false;
        });
    }
  });
};

const modify = () => {
  RegionForm.value?.validate().then((res) => {
    if (res.valid) {
      AddLoading.value = true;
      regionStore
        .ModifyRegion({
          ...regionDetails.value,
        })
        .then(() => {
          regionStore.GetAllRegions({ ...filtersDto.value });
          modifyDialog.value = false;
        })
        .finally(() => {
          AddLoading.value = false;
        });
    }
  });
};

// مراقبة تغيير البلد لجلب المدن
const onCountryChange = (countryId: string) => {
  if (countryId) {
    regionStore.GetCitiesByCountry(countryId);
    Add.value.governorateId = ""; // إعادة تعيين المدينة المختارة
  }
};

const onCountryChangeEdit = (countryId: string) => {
  if (countryId) {
    regionStore.GetCitiesByCountry(countryId);
    regionDetails.value.governorateId = ""; // إعادة تعيين المدينة المختارة
  }
};

const onCountryChangeFilter = (countryId: string) => {
  if (countryId) {
    cityStore.GetAllCities({
      countryId,
      isActive: true,
      searchFields: null,
      SortOrder: null,
      SortColumn: null,
    });
    filtersDto.value.governorateId = null; // إعادة تعيين المدينة المختارة في الفلتر
  }
  refetch();
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
  () => paginationRegion.value.currentPage,
  () => {
    regionStore.GetAllRegions({ ...filtersDto.value });
  }
);
</script>

<template>
  <div>
    <!-- 👉 Table -->
    <VCard>
      <VCardTitle>المناطق<VIcon> tabler-map-pin </VIcon></VCardTitle>
      <!-- 👉 Filters -->
      <VCardText>
        <div class="flex justify-between">
          <div class="flex justify-start">
            <h4 class="mb-2">الفلترة</h4>
          </div>
        </div>
        <div class="flex justify-between items-center flex-wrap">
          <VRow
            ><VCol cols="12" md="4">
              <!-- فلتر البلد -->
              <VAutocomplete
                v-model="filtersDto.countryId"
                clearable
                label="البلد"
                :items="CountryNameList"
                item-title="name"
                item-value="id"
                class="mx-2"
                @update:model-value="refetch"
              ></VAutocomplete>
            </VCol>
            <VCol cols="12" md="4">
              <!-- فلتر المدينة -->
              <VAutocomplete
                v-model="filtersDto.governorateId"
                clearable
                label="المدينة"
                :items="CityNameList"
                item-title="name"
                item-value="id"
                class="mx-2"
                @update:model-value="refetch"
              ></VAutocomplete>
            </VCol>
            <VCol cols="12" md="4">
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

          <div class="flex justify-center items-center gap-2">
            <VBtn
              color="primary"
              prepend-icon="tabler-plus"
              @click="isDialogVisible = true"
            >
              إضافة منطقة
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
        :items="regionList"
        :items-per-page="8"
        :items-length="paginationRegion.totalCount as any"
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
                v-model="paginationRegion.currentPage"
                :total-visible="5"
                :length="paginationRegion.totalPages"
                @update:model-value="
                  regionStore.GetAllRegions({ ...filtersDto })
                "
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
          <h4 class="text-center">إضافة منطقة</h4>
        </div>
      </VCardTitle>
      <VCardText>
        <VForm ref="RegionForm">
          <VRow>
            <!-- الاسم بالعربية -->
            <VCol cols="12" md="6">
              <label
                >اسم المنطقة (عربي) <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="Add.name.ar"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم المنطقة بالعربية"
              />
            </VCol>

            <!-- الاسم بالإنجليزية -->
            <VCol cols="12" md="6">
              <label>اسم المنطقة (إنجليزي)</label>
              <AppTextField
                v-model="Add.name.en"
                placeholder="أدخل اسم المنطقة بالإنجليزية"
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
                @update:model-value="onCountryChange"
              ></VAutocomplete>
            </VCol>

            <!-- المدينة -->
            <VCol cols="12" md="6">
              <label>المدينة <span class="text-error">*</span></label>
              <VAutocomplete
                v-model="Add.governorateId"
                :items="CityNameList"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                placeholder="اختر المدينة"
                :disabled="!Add.countryId"
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
          <h4 class="text-center">تعديل منطقة</h4>
        </div>
      </VCardTitle>
      <VCardText>
        <VForm ref="RegionForm">
          <VRow>
            <!-- الاسم بالعربية -->
            <VCol cols="12" md="6">
              <label
                >اسم المنطقة (عربي) <span class="text-error">*</span></label
              >
              <AppTextField
                v-model="regionDetails.name.ar"
                :rules="[requiredValidator]"
                placeholder="أدخل اسم المنطقة بالعربية"
              />
            </VCol>

            <!-- الاسم بالإنجليزية -->
            <VCol cols="12" md="6">
              <label>اسم المنطقة (إنجليزي)</label>
              <AppTextField
                v-model="regionDetails.name.en"
                placeholder="أدخل اسم المنطقة بالإنجليزية"
              />
            </VCol>

            <!-- البلد -->
            <VCol cols="12" md="6">
              <label>البلد <span class="text-error">*</span></label>
              <VAutocomplete
                v-model="regionDetails.countryId"
                :items="CountryNameList"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                placeholder="اختر البلد"
                @update:model-value="onCountryChangeEdit"
              ></VAutocomplete>
            </VCol>

            <!-- المدينة -->
            <VCol cols="12" md="6">
              <label>المدينة <span class="text-error">*</span></label>
              <VAutocomplete
                v-model="regionDetails.governorateId"
                :items="citiesList"
                item-title="name"
                item-value="id"
                :rules="[requiredValidator]"
                placeholder="اختر المدينة"
                :disabled="!regionDetails.countryId"
              ></VAutocomplete>
            </VCol>

            <!-- حالة المنطقة -->
            <VCol cols="12" md="6">
              <label>الحالة<span class="text-error">*</span></label>
              <VAutocomplete
                v-model="regionDetails.isActive"
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
