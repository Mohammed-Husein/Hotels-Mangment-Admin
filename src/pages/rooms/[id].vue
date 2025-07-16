<script setup lang="ts">
import { requiredValidator } from "@/@core/utils/validators";
import FileUploader from "@/components/shared/FileUploader.vue";
import { useHotelStore } from "../Hotels/hotel";
import { router } from "@/plugins/1.router";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useToast } from "vue-toastification";
import { VForm } from "vuetify/lib/components/index.mjs";
import { useRoomsStore } from "./room";

const route = useRoute();
const roomId = route.params.id as string;

const RoomForm = ref<VForm | null>(null);
const EditLoading = ref(false);
const pageLoading = ref(true);
const hotelStore = useHotelStore();
const roomStore = useRoomsStore();

const { HotelNames } = storeToRefs(hotelStore);
const { RoomDetails } = storeToRefs(roomStore);

// Load initial data on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    await Promise.all([
      hotelStore.GetAllHotelNames(),
      roomStore.GetRoomDetails(roomId),
    ]);

    // Populate form with room details
    populateForm();
  } catch (error) {
    console.error("Error loading room details:", error);
    toast.error("حدث خطأ في تحميل بيانات الغرفة");
  } finally {
    pageLoading.value = false;
  }
});

// Room form data
const EditDto = ref({
  nameAr: "",
  nameEn: "",
  hotelId: "",
  type: "standard",
  numberRoom: "",
  price: 0,
  bedsCount: 1,
  description: "",
  services: new Map<string, string>(),
  status: "Available",
  isAvailableForBooking: true,
  roomImages: [] as File[],
});

// Room types options
const roomTypes = ref([
  { title: 'جناح', value: 'sweet' },
  { title: 'غرفة مفردة', value: 'singleRoom' },
  { title: 'غرفة مزدوجة', value: 'doubleRoom' },
  { title: 'جناح فاخر', value: 'suite' },
  { title: 'ديلوكس', value: 'deluxe' },
  { title: 'عادية', value: 'standard' },
]);

// Status options
const statusOptions = ref([
  { title: "متوفرة", value: "Available" },
  { title: "محجوزة", value: "Reserved" },
  { title: "غير نشطة", value: "Inactive" },
]);

const toast = useToast();

// Populate form with room details
const populateForm = () => {
  if (RoomDetails.value) {
    EditDto.value.nameAr = RoomDetails.value.name?.ar || "";
    EditDto.value.nameEn = RoomDetails.value.name?.en || "";
    EditDto.value.hotelId = RoomDetails.value.hotel?.id || "";
    EditDto.value.type = RoomDetails.value.type || "standard";
    EditDto.value.numberRoom = RoomDetails.value.numberRoom || "";
    EditDto.value.price = RoomDetails.value.price || 0;
    EditDto.value.bedsCount = RoomDetails.value.bedsCount || 1;
    EditDto.value.description = RoomDetails.value.description || "";
    EditDto.value.status = RoomDetails.value.status || "Available";
    EditDto.value.isAvailableForBooking = RoomDetails.value.isAvailableForBooking ?? true;
  }
};

// Handle form submission
const handleSubmit = async () => {
  if (!RoomForm.value) return;

  const { valid } = await RoomForm.value.validate();

  if (valid) {
    EditLoading.value = true;
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add text fields
      formData.append('nameAr', EditDto.value.nameAr);
      formData.append('nameEn', EditDto.value.nameEn);
      formData.append('hotelId', EditDto.value.hotelId);
      formData.append('type', EditDto.value.type);
      formData.append('numberRoom', EditDto.value.numberRoom);
      formData.append('price', EditDto.value.price.toString());
      formData.append('bedsCount', EditDto.value.bedsCount.toString());
      formData.append('description', EditDto.value.description);
      formData.append('status', EditDto.value.status);
      formData.append('isAvailableForBooking', EditDto.value.isAvailableForBooking.toString());

      // Add images if any
      EditDto.value.roomImages.forEach((file, index) => {
        formData.append('roomImages', file);
      });

      const response = await roomStore.ModifyRoom(roomId, formData);
      
      if (response && response.success !== false) {
        toast.success("تم تحديث الغرفة بنجاح");
        router.go(-1);
      }
    } catch (error) {
      console.error("Error updating room:", error);
      toast.error("حدث خطأ في تحديث الغرفة");
    } finally {
      EditLoading.value = false;
    }
  }
};

// Handle file upload
const handleFileUpload = (files: File[]) => {
  EditDto.value.roomImages = files;
};
</script>

<template>
  <!-- Loading State -->
  <div v-if="pageLoading" class="d-flex justify-center align-center" style="min-height: 400px;">
    <VProgressCircular
      indeterminate
      color="primary"
      size="64"
    />
  </div>

  <!-- Main Content -->
  <div v-else>
    <div class="flex items-center justify-between">
      <div class="flex">
        <h4>الغرف</h4>
        <h4>
          / تعديل غرفة
          <VIcon> tabler-building </VIcon>
        </h4>
      </div>
    </div>

    <VForm ref="RoomForm">
      <VCard class="mt-5">
        <div class="flex justify-between">
          <h3 class="mb-4 mt-4 mx-5">معلومات الغرفة</h3>
        </div>
        <VRow class="mb-5 mx-1 mt-7">
          <VCol cols="12" md="6">
            <label>اسم الغرفة بالعربي <span class="text-error">*</span></label>
            <AppTextField
              v-model="EditDto.nameAr"
              class="mx-2"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <label>اسم الغرفة بالإنجليزي</label>
            <AppTextField
              v-model="EditDto.nameEn"
              class="mx-2"
            />
          </VCol>
          <VCol cols="12" md="6">
            <label>الفندق <span class="text-error">*</span></label>
            <VAutocomplete
              v-model="EditDto.hotelId"
              :items="HotelNames"
              item-title="name.ar"
              item-value="id"
              class="mx-2"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <label>نوع الغرفة <span class="text-error">*</span></label>
            <VAutocomplete
              v-model="EditDto.type"
              :items="roomTypes"
              item-title="title"
              item-value="value"
              class="mx-2"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <label>رقم الغرفة <span class="text-error">*</span></label>
            <AppTextField
              v-model="EditDto.numberRoom"
              class="mx-2"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <label>السعر لليلة الواحدة <span class="text-error">*</span></label>
            <AppTextField
              v-model="EditDto.price"
              type="number"
              class="mx-2"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12" md="6">
            <label>عدد الأسرة</label>
            <AppTextField
              v-model="EditDto.bedsCount"
              type="number"
              min="1"
              max="10"
              class="mx-2"
            />
          </VCol>
          <VCol cols="12" md="6">
            <label>الحالة</label>
            <VAutocomplete
              v-model="EditDto.status"
              :items="statusOptions"
              item-title="title"
              item-value="value"
              class="mx-2"
            />
          </VCol>
          <VCol cols="12">
            <label>الوصف</label>
            <VTextarea
              v-model="EditDto.description"
              class="mx-2"
              rows="3"
            />
          </VCol>
          <VCol cols="12">
            <label>صور الغرفة الجديدة (اختياري)</label>
            <FileUploader
              @files-uploaded="handleFileUpload"
              :multiple="true"
              accept="image/*"
              class="mx-2"
            />
          </VCol>
        </VRow>
        <VCardActions class="justify-end">
          <VBtn
            color="error"
            variant="outlined"
            @click="router.go(-1)"
          >
            إلغاء
          </VBtn>
          <VBtn
            color="primary"
            :loading="EditLoading"
            @click="handleSubmit"
          >
            تحديث الغرفة
          </VBtn>
        </VCardActions>
      </VCard>
    </VForm>
  </div>
</template>
