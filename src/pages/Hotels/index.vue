<script setup lang="ts">
import { useSettingStore } from "@/pages/setting/settiing";
import { storeToRefs } from "pinia";
import { onMounted } from "vue";
import { useEmployeeStore } from "../employees/employee";
import type { HotelFiltersDto } from "./api/dto";
import { useHotelStore } from "./hotel";

const store = useHotelStore();
const settingStore = useSettingStore();
const employeeStore = useEmployeeStore();
const { HotelList, paginationHotel, CitiesList, RegionsList } =
  storeToRefs(store);
const { CountryNameList } = storeToRefs(settingStore);
const { EmployeeNames } = storeToRefs(employeeStore);
// Loading states
const loading = ref(true);
const filtersLoading = ref(false);

// Filters
const filters = ref<HotelFiltersDto>({
  search: null,
  employeeId: null,
  isActive: null,
  countryId: null,
  governorateId: null,
  cityId: null,
  regionId: null,
  sortOrder: "desc",
  sortBy: "createdAt",
});

// Load initial data
onMounted(async () => {
  loading.value = true;
  try {
    // Load all filter options independently
    await Promise.all([
      settingStore.GetAllCountryNames(),
      store.GetAllGovernorateNames(),
      store.GetAllRegionNames(),
    ]);
    await store.GetAllHotels(filters.value);
  } catch (error) {
    console.error("Error loading hotels:", error);
  } finally {
    loading.value = false;
  }
  employeeStore.GetAllEmployeeNames();
});

// Independent filter change handlers
const onCountryChange = async () => {
  await applyFilters();
};

const onGovernorateChange = async () => {
  await applyFilters();
};

const onRegionChange = async () => {
  await applyFilters();
};

const onStatusChange = async () => {
  await applyFilters();
};

const onSearchChange = async () => {
  await applyFilters();
};

const applyFilters = async () => {
  loading.value = true;
  try {
    paginationHotel.value.currentPage = 1;
    await store.GetAllHotels(filters.value);
  } finally {
    loading.value = false;
  }
};

const clearFilters = async () => {
  filters.value = {
    search: null,
    employeeId: null,
    isActive: null,
    countryId: null,
    governorateId: null,
    cityId: null,
    regionId: null,
    sortOrder: "desc",
    sortBy: "createdAt",
  };
  await applyFilters();
};

// Pagination
const onPageChange = async (page: number) => {
  paginationHotel.value.currentPage = page;
  loading.value = true;
  try {
    await store.GetAllHotels(filters.value);
  } finally {
    loading.value = false;
  }
};

// Get hotel image
const getHotelImage = (hotel: any) => {
  if (hotel.images && hotel.images.length > 0) {
    return hotel.images[0];
  }
  return "/images/hotel-placeholder.jpg";
};
const { getFileUrl } = useFile();

// Get hotel name
const getHotelName = (hotel: any) => {
  return hotel.name?.ar || hotel.name?.en || "فندق غير محدد";
};

// Get employee name
const getEmployeeName = (hotel: any) => {
  return hotel.createdByEmployeeName || "غير محدد";
};

// Get rooms count
const getRoomsCount = (hotel: any) => {
  return hotel.roomsCount || 0;
};

// Get hotel date
const getHotelDate = (hotel: any) => {
  if (hotel.createdAt) {
    return new Date(hotel.createdAt).toLocaleDateString("ar-EG");
  }
  return "";
};

// Edit hotel
const editHotel = (hotelId: string) => {
  router.push(`/Hotels/EditHotel/${hotelId}`);
};

// Delete hotel
const deleteHotel = async (hotel: any) => {
  try {
    await store.DeleteHotel(hotel.id, getHotelName(hotel));
    // Refresh the list after deletion
    await store.GetAllHotels(filters.value);
  } catch (error) {
    console.error("Error deleting hotel:", error);
  }
};
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <VIcon color="primary" size="32" class="me-3">tabler-building</VIcon>
        <h2 class="text-2xl font-bold text-primary">الفنادق</h2>
      </div>

      <!-- Search and Add Button -->
      <div class="d-flex align-center gap-3">
        <VTextField
          v-model="filters.search"
          placeholder="ابحث عن فندق معين..."
          prepend-inner-icon="tabler-search"
          clearable
          @update:model-value="onSearchChange"
          :loading="loading"
          style="width: 300px"
          density="compact"
          variant="outlined"
        />
        <VBtn
          color="primary"
          prepend-icon="tabler-plus"
          @click="$router.push('/Hotels/AddHotel')"
        >
          إضافة فندق جديد
        </VBtn>
      </div>
    </div>

    <!-- Filters -->
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="3">
            <VAutocomplete
              v-model="filters.countryId"
              :items="CountryNameList"
              item-title="name"
              item-value="id"
              label="البلد"
              clearable
              @update:model-value="onCountryChange"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VAutocomplete
              v-model="filters.governorateId"
              :items="CitiesList"
              item-title="name"
              item-value="id"
              label="المحافظة"
              clearable
              @update:model-value="onGovernorateChange"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VAutocomplete
              v-model="filters.regionId"
              :items="RegionsList"
              item-title="name"
              item-value="id"
              label="المنطقة"
              clearable
              @update:model-value="onRegionChange"
            />
          </VCol>
          <VCol cols="12" md="3">
            <VAutocomplete
              v-model="filters.isActive"
              :items="[
                { title: 'جميع الفنادق', value: null },
                { title: 'نشط', value: true },
                { title: 'غير نشط', value: false },
              ]"
              item-title="title"
              item-value="value"
              label="الحالة"
              @update:model-value="onStatusChange"
              clearable
            />
          </VCol>
          <VCol cols="12" md="3">
            <VAutocomplete
              v-model="filters.employeeId"
              :items="EmployeeNames"
              item-title="name"
              item-value="id"
              label="الموظفين"
              @update:model-value="applyFilters"
              clearable
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="d-flex justify-center align-center"
      style="min-height: 400px"
    >
      <VProgressCircular indeterminate size="64" color="primary" />
    </div>

    <!-- No Data State -->
    <VCard
      v-else-if="!HotelList || HotelList.length === 0"
      class="text-center py-16"
    >
      <VCardText>
        <VIcon size="64" color="grey" class="mb-4">tabler-building-off</VIcon>
        <h3 class="text-h5 mb-2">لا توجد فنادق</h3>
        <p class="text-body-1 text-medium-emphasis mb-4">
          لم يتم العثور على أي فنادق تطابق معايير البحث
        </p>
        <VBtn color="primary" @click="clearFilters"> مسح الفلاتر </VBtn>
      </VCardText>
    </VCard>

    <!-- Hotels Grid -->
    <div v-else>
      <VRow>
        <VCol
          v-for="hotel in HotelList"
          :key="hotel.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <VCard class="hotel-card" hover>
            <!-- Hotel Image -->
            <VImg
              :src="getFileUrl(hotel.images[0])"
              height="200"
              cover
              class="hotel-image"
            >
              <template #placeholder>
                <div class="d-flex align-center justify-center fill-height">
                  <VProgressCircular indeterminate color="primary" />
                </div>
              </template>
            </VImg>

            <!-- Hotel Content -->
            <VCardText class="pb-2">
              <!-- Hotel Name -->
              <h3 class="text-h6 mb-2 text-primary font-weight-bold">
                {{ getHotelName(hotel) }}
              </h3>

              <!-- Hotel Info -->
              <div class="d-flex align-center mb-2">
                <VIcon size="16" color="primary" class="me-2">tabler-sun</VIcon>
                <span class="text-body-2"
                  >المدينة({{ hotel.countryName }})</span
                >
              </div>

              <div class="d-flex align-center mb-2">
                <VIcon size="16" color="primary" class="me-2"
                  >tabler-door</VIcon
                >
                <span class="text-body-2"
                  >عدد الغرف ({{ getRoomsCount(hotel) }})</span
                >
              </div>

              <div class="d-flex align-center mb-3">
                <VIcon size="16" color="grey" class="me-2"
                  >tabler-calendar</VIcon
                >
                <span class="text-caption text-medium-emphasis">{{
                  getHotelDate(hotel)
                }}</span>
              </div>

              <!-- Hotel Stars -->
              <div class="d-flex align-center mb-3">
                <VChip v-if="hotel.isActive === true" color="success"
                  >نشط</VChip
                >
                <VChip v-if="hotel.isActive === false" color="error"
                  >غير نشط</VChip
                >
              </div>
            </VCardText>

            <!-- Action Buttons -->
            <VCardActions class="pt-0 d-flex gap-2">
              <VBtn
                color="primary"
                variant="tonal"
                size="small"
                prepend-icon="tabler-edit"
                @click="$router.push(`/Hotels/EditHotel/${hotel.id}`)"
                class="flex-1"
              >
                تعديل
              </VBtn>
              <VBtn
                color="error"
                variant="tonal"
                size="small"
                prepend-icon="tabler-trash"
                @click="deleteHotel(hotel)"
                class="flex-1"
              >
                حذف
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>

      <!-- Pagination -->
      <div class="d-flex justify-center mt-6">
        <VPagination
          v-model="paginationHotel.currentPage"
          :length="paginationHotel.totalPages"
          :total-visible="7"
          @update:model-value="onPageChange"
          color="primary"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hotel-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.hotel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.hotel-image {
  border-radius: 8px 8px 0 0;
}
</style>
