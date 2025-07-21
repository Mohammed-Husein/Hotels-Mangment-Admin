<script setup lang="ts">
import { useHotelStore } from "../Hotels/hotel";
import { FilterBookingDto } from "./api/dto";
import { useBookingStore } from "./booking";

const store = useBookingStore();
const hotelStore = useHotelStore();
const router = useRouter();
const filtersDto = ref(new FilterBookingDto());
const { BookingList, paginationBooking } = storeToRefs(store);
const { HotelNames } = storeToRefs(hotelStore);

// Loading state
const isLoading = ref(false);

// حالات الحجز المتاحة
const bookingStatusOptions = [
  { title: "في الانتظار", value: "pending" },
  { title: "مؤكد", value: "confirmed" },
  { title: "تم الوصول", value: "checked_in" },
  { title: "تم المغادرة", value: "checked_out" },
  { title: "ملغي", value: "cancelled" },
  { title: "لم يحضر", value: "no_show" },
];
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
const headers = computed(() => [
  {
    title: "رقم الحجز ",
    key: "bookingNumber",
    align: "center",
  },
  {
    title: "رقم الغرفة ",
    key: "roomNumber",
    align: "center",
  },
  {
    title: "اسم العميل ",
    key: "customerName",
    align: "center",
  },
  {
    title: "تاريخ بداية الحجز   ",
    key: "checkInDate",
    align: "center",
  },
  {
    title: "تاريخ نهاية الحجز    ",
    key: "checkOutDate",
    align: "center",
  },
  { title: " عدد الايام  ", key: "numberOfNights", align: "center" },
  { title: " طريقة الدفع ", key: "paymentMethod", align: "center" },
  { title: " حالة الحجز ", key: "status", align: "center" },
  { title: "  الحسم  ", key: "discount", align: "center" },
  { title: " السعر الاجمالي ", key: "totalAmount", align: "center" },
  {
    title: "إجراءات",
    key: "actions",
    align: "center",
    sortable: false,
  },
]);
// Sorting handler
const onSortByUpdate = (sortBy: Array<{ key: string; order: string }>) => {
  if (sortBy.length > 0) {
    const formattedKey =
      sortBy[0].key.charAt(0).toUpperCase() + sortBy[0].key.slice(1);

    sortedColumnKey.value = formattedKey;
    sortedColumnOrder.value = sortBy[0].order === "asc" ? "asc" : "desc";

    // Update filtersDto with sorting info
    filtersDto.value.sortBy = sortedColumnKey as any;
    filtersDto.value.sortOrder = sortedColumnOrder as any;
  }
};

const refetch = () => {
  paginationBooking.value.currentPage = 1;
  paginationBooking.value.limit = options.value.itemsPerPage;
  store.GetAllBookings({ ...filtersDto.value });
};

// Update options handler
const updateOptions = (newOptions: any) => {
  options.value = { ...options.value, ...newOptions };
  refetch();
};

// Delete single item
const deleteSingleItem = async (item: any) => {
  try {
    // TODO: Implement delete booking functionality
    console.log("Delete booking:", item.id);
    // await store.DeleteBooking(item.id);
    // Refresh the list after deletion
    // refetch();
  } catch (error) {
    console.error("Error deleting booking:", error);
  }
};

// Navigation functions
const navigateToAddBooking = () => {
  router.push("/booking/add");
};

const navigateToEditBooking = (bookingId: string | null) => {
  if (bookingId) {
    router.push(`/booking/${bookingId}`);
  }
};

// Helper functions for status display
const getStatusColor = (status: string | null) => {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "checked_in":
      return "success";
    case "checked_out":
      return "primary";
    case "cancelled":
      return "error";
    case "no_show":
      return "secondary";
    default:
      return "default";
  }
};

const getStatusText = (status: string | null) => {
  const statusOption = bookingStatusOptions.find(
    (option) => option.value === status
  );
  return statusOption ? statusOption.title : "غير محدد";
};

// Format date helper
const formatDate = (dateString: string) => {
  if (!dateString) return "غير محدد";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// Format currency helper
const formatCurrency = (amount: number | null) => {
  if (!amount || amount === 0) return "0 ل.س";
  return `${amount.toLocaleString()} ل.س`;
};
onMounted(async () => {
  // Load hotel names for filter
  await hotelStore.GetAllHotelNames();
  // Load rooms
  store.GetAllBookings({ ...filtersDto.value });
});
</script>
<template>
  <h3 class="text-primary mb-5">
    الحجوزات <VIcon> tabler-calendar-event </VIcon>
  </h3>
  <VCard>
    <VCardText>
      <div class="flex justify-between">
        <div class="flex justify-start">
          <h4 class="mb-2">الفلترة بحسب:</h4>
        </div>
      </div>
      <VRow>
        <VCol cols="12" md="12">
          <VAutocomplete
            label="حالة الحجز"
            v-model="filtersDto.status"
            :items="bookingStatusOptions"
            item-title="title"
            item-value="value"
            clearable
            @update:model-value="refetch"
          ></VAutocomplete>
        </VCol>
      </VRow>
      <Divider />
      <div class="flex justify-between items-center flex-wrap">
        <div class="flex justify-center items-center flex-wrap gap-4">
          <AppTextField
            clearable
            placeholder="البحث عن اسم العميل، رقم الحجز، رقم الغرفة"
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

          <VBtn class="mt-1 mx-1" @click="navigateToAddBooking">
            إضافة حجز<VIcon class="px-1"> tabler-plus </VIcon>
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
  <VCard>
    <VDataTableServer
      v-model:options="options"
      :headers="headers as any"
      :items="BookingList"
      :items-per-page="8"
      :items-length="paginationBooking.totalCount as any"
      :loading="isLoading"
      :server-items-length="paginationBooking.limit"
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
      <template #item.checkInDate="{ item }">
        <span>{{
          item.checkInDate ? formatDate(item.checkInDate) : "غير محدد"
        }}</span>
      </template>
      <template #item.checkOutDate="{ item }">
        <span>{{
          item.checkOutDate ? formatDate(item.checkOutDate) : "غير محدد"
        }}</span>
      </template>
      <template #item.status="{ item }">
        <VChip
          :color="getStatusColor(item.status)"
          size="small"
          variant="tonal"
        >
          {{ getStatusText(item.status) }}
        </VChip>
      </template>
      <template #item.totalAmount="{ item }">
        <span class="font-weight-medium text-success">
          {{ formatCurrency(item.totalAmount) }}
        </span>
      </template>
      <template #item.discount="{ item }">
        <span class="text-warning">
          {{ formatCurrency(item.discount) }}
        </span>
      </template>
      <template #item.numberOfNights="{ item }">
        <VChip color="primary" size="small" variant="tonal">
          {{ item.numberOfNights || 0 }} ليلة
        </VChip>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex gap-1 justify-center align-center">
          <IconBtn @click="navigateToEditBooking(item.id)">
            <VIcon icon="tabler-edit" />
          </IconBtn>
          <IconBtn @click="deleteSingleItem(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </div>
      </template>

      <template #bottom>
        <VDivider />
        <VCardText class="pt-2">
          <div
            class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2"
          >
            <p class="mt-2">
              عرض 1 الى {{ options.itemsPerPage }} من اصل
              {{ paginationBooking.totalCount }} ادخال
            </p>

            <VPagination
              v-model="paginationBooking.currentPage"
              :total-visible="5"
              :length="paginationBooking.totalPages"
              @update:model-value="store.GetAllBookings({ ...filtersDto })"
            />
          </div>
        </VCardText> </template
    ></VDataTableServer>
  </VCard>
</template>
<style scoped>
.booking-status-chip {
  font-weight: 500;
}

.booking-amount {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}
</style>
