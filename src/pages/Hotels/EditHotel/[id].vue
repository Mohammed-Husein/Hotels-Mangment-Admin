<script setup lang="ts">
import { requiredValidator, urlValidator } from "@/@core/utils/validators";
import { useSettingStore } from "@/pages/setting/settiing";
import { router } from "@/plugins/1.router";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useToast } from "vue-toastification";
import { VForm } from "vuetify/lib/components/index.mjs";
import type { ModifyHotelDto } from "../api/dto";
import { useHotelStore } from "../hotel";

const route = useRoute();
const hotelId = route.params.id as string;

const HotelForm = ref<VForm | null>(null);
const EditLoading = ref(false);
const pageLoading = ref(true);
const settingStore = useSettingStore();
const hotelStore = useHotelStore();

const { CountryNameList } = storeToRefs(settingStore);
const { CitiesList, RegionsList, HotelDetails } = storeToRefs(hotelStore);

// Load initial data on component mount
onMounted(async () => {
  pageLoading.value = true;
  try {
    await Promise.all([
      settingStore.GetAllCountryNames(),
      hotelStore.GetAllGovernorateNames(),
      hotelStore.GetAllRegionNames(),
      hotelStore.GetDetailsHotel(hotelId),
    ]);

    // Populate form with hotel details
    populateForm();
  } catch (error) {
    console.error("Error loading hotel details:", error);
    toast.error("حدث خطأ في تحميل بيانات الفندق");
  } finally {
    pageLoading.value = false;
  }
});

const EditDto = ref<ModifyHotelDto>({
  id: hotelId,
  nameAr: "",
  images: [],
  nameEn: "",
  type: "فندق",
  stars: 1,
  countryId: "",
  governorateId: "",
  cityId: "",
  regionId: "",
  addressAr: "",
  addressEn: "",
  descriptionAr: "",
  descriptionEn: "",
  longitude: 0,
  latitude: 0,
  amenities: [],
  website: "",
  facebook: "",
  instagram: "",
  twitter: "",
  checkIn: "14:00",
  checkOut: "12:00",
  cancellationPolicyAr: "",
  cancellationPolicyEn: "",
  petPolicyAr: "",
  petPolicyEn: "",
  smokingPolicyAr: "",
  smokingPolicyEn: "",
  isActive: true,
});

const hotelImage = ref<File | null>(null);
const toast = useToast();

const hotelTypes = [
  { title: "فندق", value: "فندق" },
  { title: "نزل", value: "نزل" },
  { title: "منتجع", value: "منتجع" },
  { title: "شقق فندقية", value: "شقق فندقية" },
  { title: "بيت ضيافة", value: "بيت ضيافة" },
];

const starsOptions = [
  { title: "نجمة واحدة", value: 1 },
  { title: "نجمتان", value: 2 },
  { title: "ثلاث نجوم", value: 3 },
  { title: "أربع نجوم", value: 4 },
  { title: "خمس نجوم", value: 5 },
];

// Populate form with hotel details
const populateForm = () => {
  if (HotelDetails.value) {
    console.log("Hotel Details:", HotelDetails.value); // للتشخيص
    EditDto.value = {
      id: hotelId,
      nameAr: HotelDetails.value.name?.ar || "",
      nameEn: HotelDetails.value.name?.en || "",
      type: HotelDetails.value.type || "فندق",
      stars: HotelDetails.value.stars || 1,
      countryId: HotelDetails.value.countryId || "",
      governorateId: HotelDetails.value.governorateId || "",
      cityId: HotelDetails.value.cityId || "",
      regionId: HotelDetails.value.regionId || "",
      addressAr: HotelDetails.value.address?.ar || "",
      addressEn: HotelDetails.value.address?.en || "",
      descriptionAr: HotelDetails.value.description?.ar || "",
      descriptionEn: HotelDetails.value.description?.en || "",
      longitude: HotelDetails.value.location?.longitude || 0,
      latitude: HotelDetails.value.location?.latitude || 0,
      amenities: HotelDetails.value.amenities || [],
      website: HotelDetails.value.contactInfo?.website || "",
      facebook: HotelDetails.value.contactInfo?.socialMedia?.facebook || "",
      instagram: HotelDetails.value.contactInfo?.socialMedia?.instagram || "",
      twitter: HotelDetails.value.contactInfo?.socialMedia?.twitter || "",
      checkIn: HotelDetails.value.policies?.checkIn || "14:00",
      checkOut: HotelDetails.value.policies?.checkOut || "12:00",
      cancellationPolicyAr:
        HotelDetails.value.policies?.cancellationPolicy?.ar || "",
      cancellationPolicyEn:
        HotelDetails.value.policies?.cancellationPolicy?.en || "",
      petPolicyAr: HotelDetails.value.policies?.petPolicy?.ar || "",
      petPolicyEn: HotelDetails.value.policies?.petPolicy?.en || "",
      smokingPolicyAr: HotelDetails.value.policies?.smokingPolicy?.ar || "",
      smokingPolicyEn: HotelDetails.value.policies?.smokingPolicy?.en || "",
      isActive: HotelDetails.value.isActive ?? true,
      images: HotelDetails.value.images ?? [],
    };
  }
};

const save = async () => {
  if (!HotelForm.value) {
    console.error("HotelForm is not initialized");
    return;
  }

  const result = await HotelForm.value.validate();
  if (!result.valid) {
    toast.error("يجب عليك إدخال الحقول المطلوبة");
    return;
  }

  if (result.valid) {
    EditLoading.value = true;
    try {
      const response = await hotelStore.ModifyHotel(EditDto.value);
      toast.success("تم تعديل الفندق بنجاح");
      if (response && response.success !== false) {
        router.go(-1);
      }
    } catch (error: any) {
      console.error("Failed to update Hotel:", error);
    } finally {
      EditLoading.value = false;
    }
  }
};
</script>

<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="pageLoading"
      class="d-flex justify-center align-center"
      style="min-height: 400px"
    >
      <VProgressCircular indeterminate size="64" color="primary" />
    </div>

    <!-- Edit Form -->
    <div v-else>
      <div class="d-flex align-center mb-6">
        <VIcon color="primary" size="32" class="me-3">tabler-building</VIcon>
        <div>
          <h2 class="text-2xl font-bold text-primary">الفنادق</h2>
          <div class="d-flex align-center">
            <span class="text-h6">تعديل فندق</span>
            <VIcon size="20" class="ms-2">tabler-edit</VIcon>
          </div>
        </div>
      </div>

      <VForm ref="HotelForm">
        <VCard class="mt-5">
          <div class="flex justify-between">
            <h3 class="mb-4 mt-4 mx-5">معلومات الفندق</h3>
          </div>

          <VRow class="mb-5 mx-1 mt-7">
            <!-- Basic Information Section -->
            <VCol cols="12">
              <VDivider class="mb-4" />
              <h4 class="text-h6 mb-4 text-primary">
                <VIcon class="me-2">tabler-info-circle</VIcon>
                المعلومات الأساسية
              </h4>
            </VCol>

            <VCol cols="12" md="6">
              <label>اسم الفندق (عربي) <span class="text-error">*</span></label>
              <AppTextField
                v-model="EditDto.nameAr"
                class="mx-2"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>اسم الفندق (إنجليزي)</label>
              <AppTextField v-model="EditDto.nameEn" class="mx-2" />
            </VCol>

            <VCol cols="12" md="6">
              <label>نوع الفندق <span class="text-error">*</span></label>
              <AppSelect
                v-model="EditDto.type"
                :items="hotelTypes"
                item-title="title"
                item-value="value"
                class="mx-2"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>تصنيف النجوم <span class="text-error">*</span></label>
              <AppSelect
                v-model="EditDto.stars"
                :items="starsOptions"
                item-title="title"
                item-value="value"
                class="mx-2"
                :rules="[requiredValidator]"
              />
            </VCol>

            <!-- Location Section -->
            <VCol cols="12">
              <VDivider class="mb-4 mt-6" />
              <h4 class="text-h6 mb-4 text-primary">
                <VIcon class="me-2">tabler-map-pin</VIcon>
                معلومات الموقع
              </h4>
            </VCol>

            <VCol cols="12" md="3">
              <label>البلد <span class="text-error">*</span></label>
              <AppSelect
                v-model="EditDto.countryId"
                :items="CountryNameList"
                item-title="name"
                item-value="id"
                class="mx-2"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" md="3">
              <label>المحافظة <span class="text-error">*</span></label>
              <AppSelect
                v-model="EditDto.governorateId"
                :items="CitiesList"
                item-title="name"
                item-value="id"
                class="mx-2"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" md="3">
              <label>المدينة</label>
              <AppSelect
                v-model="EditDto.cityId"
                :items="CitiesList"
                item-title="name"
                item-value="id"
                class="mx-2"
              />
            </VCol>

            <VCol cols="12" md="3">
              <label>المنطقة <span class="text-error">*</span></label>
              <AppSelect
                v-model="EditDto.regionId"
                :items="RegionsList"
                item-title="name"
                item-value="id"
                class="mx-2"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>العنوان (عربي)</label>
              <AppTextField v-model="EditDto.addressAr" class="mx-2" />
            </VCol>

            <VCol cols="12" md="6">
              <label>العنوان (إنجليزي)</label>
              <AppTextField v-model="EditDto.addressEn" class="mx-2" />
            </VCol>

            <VCol cols="12" md="6">
              <label>خط الطول</label>
              <AppTextField
                v-model="EditDto.longitude"
                type="number"
                class="mx-2"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>خط العرض</label>
              <AppTextField
                v-model="EditDto.latitude"
                type="number"
                class="mx-2"
              />
            </VCol>

            <!-- Description Section -->
            <VCol cols="12">
              <VDivider class="mb-4 mt-6" />
              <h4 class="text-h6 mb-4 text-primary">
                <VIcon class="me-2">tabler-file-text</VIcon>
                الوصف
              </h4>
            </VCol>

            <VCol cols="12" md="6">
              <label>الوصف (عربي)</label>
              <AppTextarea
                v-model="EditDto.descriptionAr"
                class="mx-2"
                rows="4"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>الوصف (إنجليزي)</label>
              <AppTextarea
                v-model="EditDto.descriptionEn"
                class="mx-2"
                rows="4"
              />
            </VCol>

            <!-- Contact Information Section -->
            <VCol cols="12">
              <VDivider class="mb-4 mt-6" />
              <h4 class="text-h6 mb-4 text-primary">
                <VIcon class="me-2">tabler-world</VIcon>
                معلومات التواصل
              </h4>
            </VCol>

            <VCol cols="12" md="6">
              <label>الموقع الإلكتروني</label>
              <AppTextField
                v-model="EditDto.website"
                class="mx-2"
                :rules="EditDto.website ? [urlValidator] : []"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>فيسبوك</label>
              <AppTextField v-model="EditDto.facebook" class="mx-2" />
            </VCol>

            <VCol cols="12" md="6">
              <label>إنستغرام</label>
              <AppTextField v-model="EditDto.instagram" class="mx-2" />
            </VCol>

            <VCol cols="12" md="6">
              <label>تويتر</label>
              <AppTextField v-model="EditDto.twitter" class="mx-2" />
            </VCol>

            <!-- Policies Section -->
            <VCol cols="12">
              <VDivider class="mb-4 mt-6" />
              <h4 class="text-h6 mb-4 text-primary">
                <VIcon class="me-2">tabler-clock</VIcon>
                السياسات والأوقات
              </h4>
            </VCol>

            <VCol cols="12" md="6">
              <label>وقت تسجيل الدخول <span class="text-error">*</span></label>
              <AppTextField
                v-model="EditDto.checkIn"
                type="time"
                class="mx-2"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>وقت تسجيل الخروج <span class="text-error">*</span></label>
              <AppTextField
                v-model="EditDto.checkOut"
                type="time"
                class="mx-2"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>سياسة الإلغاء (عربي)</label>
              <AppTextarea
                v-model="EditDto.cancellationPolicyAr"
                class="mx-2"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>سياسة الإلغاء (إنجليزي)</label>
              <AppTextarea
                v-model="EditDto.cancellationPolicyEn"
                class="mx-2"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>سياسة الحيوانات الأليفة (عربي)</label>
              <AppTextarea
                v-model="EditDto.petPolicyAr"
                class="mx-2"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>سياسة الحيوانات الأليفة (إنجليزي)</label>
              <AppTextarea
                v-model="EditDto.petPolicyEn"
                class="mx-2"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>سياسة التدخين (عربي)</label>
              <AppTextarea
                v-model="EditDto.smokingPolicyAr"
                class="mx-2"
                rows="3"
              />
            </VCol>

            <VCol cols="12" md="6">
              <label>سياسة التدخين (إنجليزي)</label>
              <AppTextarea
                v-model="EditDto.smokingPolicyEn"
                class="mx-2"
                rows="3"
              />
            </VCol>

            <!-- Status Section -->
            <VCol cols="12">
              <VDivider class="mb-4 mt-6" />
              <h4 class="text-h6 mb-4 text-primary">
                <VIcon class="me-2">tabler-toggle-left</VIcon>
                الحالة
              </h4>
            </VCol>

            <VCol cols="12" md="6">
              <label>حالة الفندق</label>
              <VSwitch
                v-model="EditDto.isActive"
                :label="EditDto.isActive ? 'نشط' : 'غير نشط'"
                color="primary"
                class="mx-2"
              />
            </VCol>
            <VCol cols="12">
              {{ EditDto.images }}
              <FileUploader v-model:url="EditDto.images" />
            </VCol>
          </VRow>

          <!-- Action Buttons -->
          <VCardActions class="justify-end pa-6">
            <VBtn
              variant="outlined"
              color="secondary"
              @click="router.go(-1)"
              :disabled="EditLoading"
            >
              إلغاء
            </VBtn>
            <VBtn
              color="primary"
              @click="save"
              :loading="EditLoading"
              class="ms-3"
            >
              حفظ التعديلات
            </VBtn>
          </VCardActions>
        </VCard>
      </VForm>
    </div>
  </div>
  <div class="flex justify-end pa-6">
    <VBtn
      variant="tonal"
      color="error"
      @click="router.go(-1)"
      :disabled="EditLoading"
    >
      إلغاء
    </VBtn>
    <VBtn color="primary" @click="save" :loading="EditLoading" class="ms-3">
      حفظ
    </VBtn>
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
</style>
