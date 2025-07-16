<script setup lang="ts">
import { useHotelStore } from "../Hotels/hotel";
import { FilterRoomDto } from "./api/dto";
import { useRoomsStore } from "./room";

const store = useRoomsStore();
const hotelStore = useHotelStore();
const router = useRouter();
const filtersDto = ref(new FilterRoomDto());
const { RoomList, paginationRoom } = storeToRefs(store);
const { HotelNames } = storeToRefs(hotelStore);

// Loading state
const isLoading = ref(false);
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
    title: "رقم الغرفة ",
    key: "numberRoom",
    align: "center",
  },
  {
    title: "اسم الغرفة بالعربي ",
    key: "nameAr",
    align: "center",
  },
  {
    title: "اسم الغرفة بالانجليزي ",
    key: "nameEn",
    align: "center",
  },
  { title: " اسم الفندق ", key: "hotelName", align: "center" },
  { title: " نوع الغرفة ", key: "type", align: "center" },
  { title: " حالة الحجز ", key: "isBooked", align: "center" },
  //   { title: "  الحجز الحالي ", key: "currentBooking", align: "center" },
  { title: "  سعر الحجز لليوم الواحد ", key: "pricePerNight", align: "center" },
  { title: "الخدمات المتوفرة  ", key: "services", align: "center" },
  {
    title: "إجراءات",
    key: "actions",
    align: "center",
    sortable: false,
  },
]);
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
const refetch = () => {
  paginationRoom.value.currentPage = 1;
  paginationRoom.value.limit = options.value.itemsPerPage;
  store.GetAllRooms({ ...filtersDto.value });
};

// Update options handler
const updateOptions = (newOptions: any) => {
  options.value = { ...options.value, ...newOptions };
  refetch();
};

// Delete single item
const deleteSingleItem = async (item: any) => {
  try {
    await store.DeleteRoom(
      [item.id],
      item.nameAr || item.nameEn || `رقم ${item.numberRoom}`
    );
    // Refresh the list after deletion
    refetch();
  } catch (error) {
    console.error("Error deleting room:", error);
  }
};
// Room types options
const roomTypes = ref([
  { title: "جناح", value: "sweet" },
  { title: "غرفة مفردة", value: "singleRoom" },
  { title: "غرفة مزدوجة", value: "doubleRoom" },
  { title: "جناح فاخر", value: "suite" },
  { title: "ديلوكس", value: "deluxe" },
  { title: "عادية", value: "standard" },
]);

// Status options
const statusOptions = ref([
  { title: "متوفرة", value: "Available" },
  { title: "محجوزة", value: "Reserved" },
  { title: "غير نشطة", value: "Inactive" },
]);

onMounted(async () => {
  // Load hotel names for filter
  await hotelStore.GetAllHotelNames();
  // Load rooms
  store.GetAllRooms({ ...filtersDto.value });
});
</script>
<template>
  <h3 class="text-primary mb-5">الغرف <VIcon> tabler-building </VIcon></h3>
  <VCard>
    <VCardText>
      <div class="flex justify-between">
        <div class="flex justify-start">
          <h4 class="mb-2">الفلترة بحسب:</h4>
        </div>
      </div>
      <VRow>
        <VCol cols="12" md="4">
          <VAutocomplete
            label="الفندق"
            v-model="filtersDto.hotelId"
            :items="HotelNames"
            item-title="name.ar"
            item-value="id"
            clearable
            @update:model-value="refetch"
          ></VAutocomplete>
        </VCol>
        <VCol cols="12" md="4">
          <VAutocomplete
            label="نوع الغرفة"
            v-model="filtersDto.type"
            :items="roomTypes"
            item-title="title"
            item-value="value"
            clearable
            @update:model-value="refetch"
          ></VAutocomplete>
        </VCol>
        <VCol cols="12" md="4">
          <VAutocomplete
            label="الحالة"
            v-model="filtersDto.status"
            :items="statusOptions"
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

          <VBtn class="mt-1 mx-1" @click="router.push('/rooms/add')">
            إضافة غرفة<VIcon class="px-1"> tabler-plus </VIcon>
          </VBtn>
        </div>
      </div>
    </VCardText>
  </VCard>
  <VCard>
    <VDataTableServer
      v-model:options="options"
      :headers="headers as any"
      :items="RoomList"
      :items-per-page="8"
      :items-length="paginationRoom.totalCount as any"
      :loading="isLoading"
      :server-items-length="paginationRoom.limit"
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
          <IconBtn @click="router.push(`/rooms/${item.id}`)">
            <VIcon icon="tabler-edit" />
          </IconBtn>
          <IconBtn @click="deleteSingleItem(item)">
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </div>
      </template>

      <template #item.isBooked="{ item }">
        <VChip
          :color="
            !item.isBooked || item.isBooked === 'false' ? 'success' : 'error'
          "
        >
          {{ !item.isBooked || item.isBooked === "false" ? "متوافر" : "محجوز" }}
        </VChip>
      </template>
      <template #bottom>
        <VDivider />
        <VCardText class="pt-2">
          <div
            class="d-flex flex-wrap justify-center justify-sm-space-between gap-y-2 mt-2"
          >
            <p class="mt-2">
              عرض 1 الى {{ options.itemsPerPage }} من اصل
              {{ paginationRoom.totalCount }} ادخال
            </p>

            <VPagination
              v-model="paginationRoom.currentPage"
              :total-visible="5"
              :length="paginationRoom.totalPages"
              @update:model-value="store.GetAllRooms({ ...filtersDto })"
            />
          </div>
        </VCardText> </template
    ></VDataTableServer>
  </VCard>
</template>
