<script setup lang="ts">
import { requiredValidator } from "@/@core/utils/validators";
import FileUploader from "@/components/shared/FileUploader.vue";
import { router } from "@/plugins/1.router";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useToast } from "vue-toastification";
import { VForm } from "vuetify/lib/components/index.mjs";
import { useHotelStore } from "../Hotels/hotel";
import { useRoomsStore } from "./room";

const RoomForm = ref<VForm | null>(null);
const AddLoading = ref(false);
const hotelStore = useHotelStore();
const roomStore = useRoomsStore();

const { HotelNames } = storeToRefs(hotelStore);

// Load hotels on component mount
onMounted(async () => {
  await hotelStore.GetAllHotelNames();
});

// Room form data
const AddDto = ref({
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

const toast = useToast();

// Handle form submission
const handleSubmit = async () => {
  if (!RoomForm.value) return;

  const { valid } = await RoomForm.value.validate();

  if (valid) {
    AddLoading.value = true;
    try {
      // Create FormData for file upload

      const response = await roomStore.AddRoom(AddDto.value);
      toast.success("تمت إضافة الغرفة بنجاح");
      router.go(-1);
    } catch (error) {
      console.error("Error adding room:", error);
      toast.error("حدث خطأ في إضافة الغرفة");
    } finally {
      AddLoading.value = false;
    }
  }
};

// Handle file upload
const handleFileUpload = (files: File[]) => {
  AddDto.value.roomImages = files;
};
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex">
      <h4>الغرف</h4>
      <h4>
        / إضافة غرفة
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
            v-model="AddDto.nameAr"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>اسم الغرفة بالإنجليزي</label>
          <AppTextField v-model="AddDto.nameEn" class="mx-2" />
        </VCol>
        <VCol cols="12" md="6">
          <label>الفندق <span class="text-error">*</span></label>
          <VAutocomplete
            v-model="AddDto.hotelId"
            :items="HotelNames"
            item-title="name"
            item-value="id"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>نوع الغرفة <span class="text-error">*</span></label>
          <VAutocomplete
            v-model="AddDto.type"
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
            v-model="AddDto.numberRoom"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>السعر لليلة الواحدة <span class="text-error">*</span></label>
          <AppTextField
            v-model="AddDto.price"
            type="number"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>عدد الأسرة</label>
          <AppTextField
            v-model="AddDto.bedsCount"
            type="number"
            min="1"
            max="10"
            class="mx-2"
          />
        </VCol>
        <VCol cols="12" md="6">
          <label>الحالة</label>
          <VAutocomplete
            v-model="AddDto.status"
            :items="statusOptions"
            item-title="title"
            item-value="value"
            class="mx-2"
          />
        </VCol>
        <VCol cols="12">
          <label>الوصف</label>
          <VTextarea v-model="AddDto.description" class="mx-2" rows="3" />
        </VCol>
        <VCol cols="12">
          <label>صور الغرفة</label>
          <FileUploader
            @files-uploaded="handleFileUpload"
            :multiple="true"
            accept="image/*"
            class="mx-2"
          />
        </VCol>
      </VRow>
      <VCardActions class="justify-end">
        <VBtn color="error" variant="outlined" @click="router.go(-1)">
          إلغاء
        </VBtn>
        <VBtn color="primary" :loading="AddLoading" @click="handleSubmit">
          إضافة الغرفة
        </VBtn>
      </VCardActions>
    </VCard>
  </VForm>
</template>
