<script setup lang="ts">
import { requiredValidator, emailValidator, urlValidator } from "@/@core/utils/validators";
import { useSettingStore } from "@/pages/setting/settiing";
import { router } from "@/plugins/1.router";
import { storeToRefs } from "pinia";
import { onMounted, ref } from "vue";
import { useToast } from "vue-toastification";
import { VForm } from "vuetify/lib/components/index.mjs";
import type { AddHotelDto } from "./api/dto";
import { useHotelStore } from "./hotel";
import FileUploader from "@/components/shared/FileUploader.vue";

const HotelForm = ref<VForm | null>(null);
const AddLoading = ref(false);
const settingStore = useSettingStore();
const hotelStore = useHotelStore();

const { CountryNameList } = storeToRefs(settingStore);
const { CitiesList, RegionsList } = storeToRefs(hotelStore);

// Load initial data on component mount
onMounted(async () => {
  await Promise.all([
    settingStore.GetAllCountryNames(),
    hotelStore.GetAllGovernorateNames(),
    hotelStore.GetAllRegionNames()
  ]);
});

const AddDto = ref<AddHotelDto>({
  nameAr: "",
  nameEn: "",
  type: "فندق",
  stars: 1,
  countryId: "",
  governorateId: "",
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
    AddLoading.value = true;
    try {
      const formData = new FormData();
      
      // Add basic hotel data
      formData.append('nameAr', AddDto.value.nameAr);
      if (AddDto.value.nameEn) formData.append('nameEn', AddDto.value.nameEn);
      formData.append('type', AddDto.value.type);
      formData.append('stars', AddDto.value.stars.toString());
      formData.append('countryId', AddDto.value.countryId);
      formData.append('governorateId', AddDto.value.governorateId);
      formData.append('regionId', AddDto.value.regionId);
      
      // Add addresses
      if (AddDto.value.addressAr) formData.append('addressAr', AddDto.value.addressAr);
      if (AddDto.value.addressEn) formData.append('addressEn', AddDto.value.addressEn);
      
      // Add descriptions
      if (AddDto.value.descriptionAr) formData.append('descriptionAr', AddDto.value.descriptionAr);
      if (AddDto.value.descriptionEn) formData.append('descriptionEn', AddDto.value.descriptionEn);
      
      // Add location
      if (AddDto.value.longitude) formData.append('longitude', AddDto.value.longitude.toString());
      if (AddDto.value.latitude) formData.append('latitude', AddDto.value.latitude.toString());
      
      // Add contact info
      if (AddDto.value.website) formData.append('website', AddDto.value.website);
      if (AddDto.value.facebook) formData.append('facebook', AddDto.value.facebook);
      if (AddDto.value.instagram) formData.append('instagram', AddDto.value.instagram);
      if (AddDto.value.twitter) formData.append('twitter', AddDto.value.twitter);
      
      // Add policies
      formData.append('checkIn', AddDto.value.checkIn);
      formData.append('checkOut', AddDto.value.checkOut);
      if (AddDto.value.cancellationPolicyAr) formData.append('cancellationPolicyAr', AddDto.value.cancellationPolicyAr);
      if (AddDto.value.cancellationPolicyEn) formData.append('cancellationPolicyEn', AddDto.value.cancellationPolicyEn);
      if (AddDto.value.petPolicyAr) formData.append('petPolicyAr', AddDto.value.petPolicyAr);
      if (AddDto.value.petPolicyEn) formData.append('petPolicyEn', AddDto.value.petPolicyEn);
      if (AddDto.value.smokingPolicyAr) formData.append('smokingPolicyAr', AddDto.value.smokingPolicyAr);
      if (AddDto.value.smokingPolicyEn) formData.append('smokingPolicyEn', AddDto.value.smokingPolicyEn);
      
      // Add amenities
      if (AddDto.value.amenities.length > 0) {
        AddDto.value.amenities.forEach(amenity => {
          formData.append('amenities[]', amenity);
        });
      }
      
      // Add status
      formData.append('isActive', AddDto.value.isActive.toString());
      
      // Add image
      if (hotelImage.value) {
        formData.append('hotelImage', hotelImage.value);
      }

      const response = await hotelStore.AddHotel(AddDto.value);
      toast.success("تمت إضافة الفندق بنجاح");
      if (response && response.success !== false) {
        router.go(-1);
      }
    } catch (error: any) {
      console.error("Failed to save Hotel:", error);
    } finally {
      AddLoading.value = false;
    }
  }
};
</script>

<template>
  <div class="d-flex align-center mb-6">
    <VIcon color="primary" size="32" class="me-3">tabler-building</VIcon>
    <div>
      <h2 class="text-2xl font-bold text-primary">الفنادق</h2>
      <div class="d-flex align-center">
        <span class="text-h6">إضافة فندق جديد</span>
        <VIcon size="20" class="ms-2">tabler-plus</VIcon>
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
            v-model="AddDto.nameAr"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        
        <VCol cols="12" md="6">
          <label>اسم الفندق (إنجليزي)</label>
          <AppTextField
            v-model="AddDto.nameEn"
            class="mx-2"
          />
        </VCol>
        
        <VCol cols="12" md="6">
          <label>نوع الفندق <span class="text-error">*</span></label>
          <VSelect
            v-model="AddDto.type"
            :items="hotelTypes"
            item-title="title"
            item-value="value"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        
        <VCol cols="12" md="6">
          <label>تصنيف النجوم <span class="text-error">*</span></label>
          <VSelect
            v-model="AddDto.stars"
            :items="starsOptions"
            item-title="title"
            item-value="value"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>

        <!-- Location Information Section -->
        <VCol cols="12">
          <VDivider class="mb-4 mt-6" />
          <h4 class="text-h6 mb-4 text-primary">
            <VIcon class="me-2">tabler-map-pin</VIcon>
            معلومات الموقع
          </h4>
        </VCol>

        <VCol cols="12" md="4">
          <label>البلد <span class="text-error">*</span></label>
          <VAutocomplete
            :items="CountryNameList"
            item-title="name"
            item-value="id"
            v-model="AddDto.countryId"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        
        <VCol cols="12" md="4">
          <label>المحافظة <span class="text-error">*</span></label>
          <VAutocomplete
            :items="CitiesList"
            item-title="name"
            item-value="id"
            v-model="AddDto.governorateId"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>
        
        <VCol cols="12" md="4">
          <label>المنطقة <span class="text-error">*</span></label>
          <VAutocomplete
            :items="RegionsList"
            item-title="name"
            item-value="id"
            v-model="AddDto.regionId"
            class="mx-2"
            :rules="[requiredValidator]"
          />
        </VCol>

        <!-- Address Information -->
        <VCol cols="12" md="6">
          <label>العنوان (عربي)</label>
          <VTextarea
            v-model="AddDto.addressAr"
            class="mx-2"
            rows="3"
          />
        </VCol>
        
        <VCol cols="12" md="6">
          <label>العنوان (إنجليزي)</label>
          <VTextarea
            v-model="AddDto.addressEn"
            class="mx-2"
            rows="3"
          />
        </VCol>

        <!-- Description Section -->
        <VCol cols="12">
          <VDivider class="mb-4 mt-6" />
          <h4 class="text-h6 mb-4 text-primary">
            <VIcon class="me-2">tabler-file-text</VIcon>
            الوصف والتفاصيل
          </h4>
        </VCol>

        <VCol cols="12" md="6">
          <label>وصف الفندق (عربي)</label>
          <VTextarea
            v-model="AddDto.descriptionAr"
            class="mx-2"
            rows="4"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>وصف الفندق (إنجليزي)</label>
          <VTextarea
            v-model="AddDto.descriptionEn"
            class="mx-2"
            rows="4"
          />
        </VCol>

        <!-- Location Coordinates -->
        <VCol cols="12" md="6">
          <label>خط الطول (Longitude)</label>
          <AppTextField
            v-model.number="AddDto.longitude"
            type="number"
            step="any"
            class="mx-2"
            placeholder="مثال: 31.2357"
            hint="خط الطول يجب أن يكون بين -180 و 180"
            persistent-hint
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>خط العرض (Latitude)</label>
          <AppTextField
            v-model.number="AddDto.latitude"
            type="number"
            step="any"
            class="mx-2"
            placeholder="مثال: 30.0444"
            hint="خط العرض يجب أن يكون بين -90 و 90"
            persistent-hint
          />
        </VCol>

        <!-- Contact Information Section -->
        <VCol cols="12">
          <VDivider class="mb-4 mt-6" />
          <h4 class="text-h6 mb-4 text-primary">
            <VIcon class="me-2">tabler-phone</VIcon>
            معلومات الاتصال
          </h4>
        </VCol>

        <VCol cols="12" md="6">
          <label>الموقع الإلكتروني</label>
          <AppTextField
            v-model="AddDto.website"
            class="mx-2"
            placeholder="https://example.com"
            :rules="AddDto.website ? [urlValidator] : []"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>صفحة الفيسبوك</label>
          <AppTextField
            v-model="AddDto.facebook"
            class="mx-2"
            placeholder="https://facebook.com/hotel"
            :rules="AddDto.facebook ? [urlValidator] : []"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>حساب الإنستغرام</label>
          <AppTextField
            v-model="AddDto.instagram"
            class="mx-2"
            placeholder="https://instagram.com/hotel"
            :rules="AddDto.instagram ? [urlValidator] : []"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>حساب تويتر</label>
          <AppTextField
            v-model="AddDto.twitter"
            class="mx-2"
            placeholder="https://twitter.com/hotel"
            :rules="AddDto.twitter ? [urlValidator] : []"
          />
        </VCol>

        <!-- Hotel Policies Section -->
        <VCol cols="12">
          <VDivider class="mb-4 mt-6" />
          <h4 class="text-h6 mb-4 text-primary">
            <VIcon class="me-2">tabler-clock</VIcon>
            السياسات والأوقات
          </h4>
        </VCol>

        <VCol cols="12" md="6">
          <label>وقت تسجيل الوصول</label>
          <AppTextField
            v-model="AddDto.checkIn"
            type="time"
            class="mx-2"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>وقت تسجيل المغادرة</label>
          <AppTextField
            v-model="AddDto.checkOut"
            type="time"
            class="mx-2"
          />
        </VCol>

        <!-- Policies -->
        <VCol cols="12" md="6">
          <label>سياسة الإلغاء (عربي)</label>
          <VTextarea
            v-model="AddDto.cancellationPolicyAr"
            class="mx-2"
            rows="3"
            placeholder="اكتب سياسة الإلغاء باللغة العربية"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>سياسة الإلغاء (إنجليزي)</label>
          <VTextarea
            v-model="AddDto.cancellationPolicyEn"
            class="mx-2"
            rows="3"
            placeholder="Write cancellation policy in English"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>سياسة الحيوانات الأليفة (عربي)</label>
          <VTextarea
            v-model="AddDto.petPolicyAr"
            class="mx-2"
            rows="3"
            placeholder="اكتب سياسة الحيوانات الأليفة باللغة العربية"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>سياسة الحيوانات الأليفة (إنجليزي)</label>
          <VTextarea
            v-model="AddDto.petPolicyEn"
            class="mx-2"
            rows="3"
            placeholder="Write pet policy in English"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>سياسة التدخين (عربي)</label>
          <VTextarea
            v-model="AddDto.smokingPolicyAr"
            class="mx-2"
            rows="3"
            placeholder="اكتب سياسة التدخين باللغة العربية"
          />
        </VCol>

        <VCol cols="12" md="6">
          <label>سياسة التدخين (إنجليزي)</label>
          <VTextarea
            v-model="AddDto.smokingPolicyEn"
            class="mx-2"
            rows="3"
            placeholder="Write smoking policy in English"
          />
        </VCol>

        <!-- Amenities and Media Section -->
        <VCol cols="12">
          <VDivider class="mb-4 mt-6" />
          <h4 class="text-h6 mb-4 text-primary">
            <VIcon class="me-2">tabler-star</VIcon>
            المرافق والوسائط
          </h4>
        </VCol>

        <VCol cols="12">
          <label>المرافق والخدمات</label>
          <VCombobox
            v-model="AddDto.amenities"
            class="mx-2"
            multiple
            chips
            clearable
            placeholder="أضف المرافق (مثل: واي فاي، مسبح، جيم، إفطار مجاني)"
            hint="اكتب المرفق واضغط Enter لإضافته"
            persistent-hint
          />
        </VCol>

        <!-- Status -->
        <VCol cols="12" md="6">
          <label>حالة الفندق</label>
          <VSwitch
            v-model="AddDto.isActive"
            :label="AddDto.isActive ? 'نشط' : 'غير نشط'"
            class="mx-2"
            color="primary"
          />
        </VCol>

        <!-- Hotel Image -->
        <VCol cols="12">
          <label>صورة الفندق</label>
          <FileUploader
            v-model="hotelImage"
            accept="image/*"
            :maxSize="10"
            placeholder="اختر صورة الفندق"
            class="mx-2 mt-2"
          />
        </VCol>
      </VRow>
    </VCard>
  </VForm>

  <div class="flex justify-end mt-4 mx-2">
    <VBtn class="mx-1" :loading="AddLoading" @click="save">إضافة</VBtn>
    <VBtn color="error" variant="tonal" @click="router.go(-1)">إلغاء</VBtn>
  </div>
</template>

<style scoped>
.maz-select__options {
  z-index: 9999 !important;
}
</style>
