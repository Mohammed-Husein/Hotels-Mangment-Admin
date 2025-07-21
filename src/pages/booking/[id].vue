<script setup lang="ts">
import { useHotelStore } from "../Hotels/hotel";
import { useCustomerStore } from "../customer/Customer";
import { useRoomsStore } from "../rooms/room";
import { useBookingStore } from "./booking";

const store = useBookingStore();
const hotelStore = useHotelStore();
const customerStore = useCustomerStore();
const roomStore = useRoomsStore();
const router = useRouter();
const route = useRoute();

const bookingId = route.params.id as string;

// Form data
const formData = ref({
  id: "",
  customerId: "",
  hotelId: "",
  roomId: "",
  checkInDate: "",
  checkOutDate: "",
  numberOfNights: 0,
  guestInfo: {
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    idNumber: "",
  },
  guestsCount: {
    adults: 1,
    children: 0,
    infants: 0,
  },
  pricing: {
    roomBasePrice: 0,
    roomTotalPrice: 0,
    servicesTotalPrice: 0,
    subtotal: 0,
    discount: 0,
    totalAmount: 0,
    currency: "SYP",
  },
  paymentMethodId: "",
  status: "",
  notes: "",
});

// Loading states
const isLoading = ref(false);
const isSubmitting = ref(false);

// Data lists
const { HotelNames } = storeToRefs(hotelStore);
const { CustomerNames } = storeToRefs(customerStore);
const { RommsByHotel } = storeToRefs(roomStore);

// Available rooms for selected hotel (computed to filter available rooms)
const availableRooms = computed(() => {
  if (!RommsByHotel.value || !Array.isArray(RommsByHotel.value)) {
    return [];
  }
  return RommsByHotel.value.filter(
    (room: any) => !room.isBooked || room.id === formData.value.roomId
  );
});

// Payment methods
const paymentMethods = ref([
  { id: "1", name: "نقداً", value: "cash" },
  { id: "2", name: "بطاقة ائتمان", value: "credit_card" },
  { id: "3", name: "تحويل بنكي", value: "bank_transfer" },
]);

// Booking status options
const bookingStatusOptions = [
  { title: "في الانتظار", value: "pending" },
  { title: "مؤكد", value: "confirmed" },
  { title: "تم الوصول", value: "checked_in" },
  { title: "تم المغادرة", value: "checked_out" },
  { title: "ملغي", value: "cancelled" },
  { title: "لم يحضر", value: "no_show" },
];

// Computed properties
const calculatedNights = computed(() => {
  if (formData.value.checkInDate && formData.value.checkOutDate) {
    const checkIn = new Date(formData.value.checkInDate);
    const checkOut = new Date(formData.value.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return 0;
});

const calculatedTotal = computed(() => {
  const basePrice = formData.value.pricing.roomBasePrice || 0;
  const nights = calculatedNights.value;
  const roomTotal = basePrice * nights;
  const servicesTotal = formData.value.pricing.servicesTotalPrice || 0;
  const subtotal = roomTotal + servicesTotal;
  const discount = formData.value.pricing.discount || 0;
  return subtotal - discount;
});

// Watch for date changes to calculate nights
watch(
  [() => formData.value.checkInDate, () => formData.value.checkOutDate],
  () => {
    formData.value.numberOfNights = calculatedNights.value;
    formData.value.pricing.roomTotalPrice =
      formData.value.pricing.roomBasePrice * calculatedNights.value;
    formData.value.pricing.subtotal =
      formData.value.pricing.roomTotalPrice +
      formData.value.pricing.servicesTotalPrice;
    formData.value.pricing.totalAmount = calculatedTotal.value;
  }
);

// Watch for hotel selection to load available rooms
watch(
  () => formData.value.hotelId,
  async (newHotelId) => {
    if (newHotelId) {
      await loadAvailableRooms(newHotelId);
    }
  }
);

// Watch for room selection to get room price
watch(
  () => formData.value.roomId,
  (newRoomId) => {
    if (newRoomId && RommsByHotel.value) {
      const selectedRoom = RommsByHotel.value.find(
        (room: any) => room.id === newRoomId
      );
      if (selectedRoom && selectedRoom.pricePerNight) {
        formData.value.pricing.roomBasePrice = selectedRoom.pricePerNight;
        formData.value.pricing.roomTotalPrice =
          selectedRoom.pricePerNight * calculatedNights.value;
        formData.value.pricing.subtotal =
          formData.value.pricing.roomTotalPrice +
          formData.value.pricing.servicesTotalPrice;
        formData.value.pricing.totalAmount = calculatedTotal.value;
      }
    } else {
      // Reset pricing when no room is selected
      formData.value.pricing.roomBasePrice = 0;
      formData.value.pricing.roomTotalPrice = 0;
      formData.value.pricing.subtotal = 0;
      formData.value.pricing.totalAmount = 0;
    }
  }
);
onMounted(async () => {
  await store.GetBookingById(bookingId);
});
// Methods
const loadBookingDetails = async () => {
  try {
    isLoading.value = true;
    // TODO: Implement get booking by ID in store
    const booking = await store.GetBookingById(bookingId);
    // Fill form with booking data
    // formData.value = { ...booking };
  } catch (error) {
    console.error("Error loading booking:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadAvailableRooms = async (hotelId: string) => {
  try {
    isLoading.value = true;
    // Load rooms for the selected hotel
    await roomStore.GetAllRoomsByHotelId(hotelId);
  } catch (error) {
    console.error("Error loading rooms:", error);
  } finally {
    isLoading.value = false;
  }
};

const submitForm = async () => {
  try {
    isSubmitting.value = true;

    const bookingData = {
      id: formData.value.id,
      customerId: formData.value.customerId,
      roomId: formData.value.roomId,
      checkInDate: formData.value.checkInDate,
      checkOutDate: formData.value.checkOutDate,
      numberOfNights: formData.value.numberOfNights,
      guestInfo: formData.value.guestInfo,
      guestsCount: formData.value.guestsCount,
      totalAmount: formData.value.pricing.totalAmount,
      discount: formData.value.pricing.discount,
      paymentMethodId: formData.value.paymentMethodId,
      status: formData.value.status,
      notes: formData.value.notes,
    };

    // TODO: Implement update booking in store
    await store.UpdateBooking(bookingData);

    // Navigate back to bookings list
    router.push("/booking");
  } catch (error) {
    console.error("Error updating booking:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push("/booking");
};

// Watch for customer selection to auto-fill guest info
watch(
  () => formData.value.customerId,
  (newCustomerId) => {
    if (newCustomerId && CustomerNames.value) {
      const selectedCustomer = CustomerNames.value.find(
        (customer: any) => customer.id === newCustomerId
      );
      if (selectedCustomer) {
        formData.value.guestInfo.fullName =
          (selectedCustomer as any).name || "";
        formData.value.guestInfo.email = (selectedCustomer as any).email || "";
        // Note: phone number is not available in CustomerNames, will need to be filled manually
        formData.value.guestInfo.phone = "";
      }
    }
  }
);

// Active tab for the form
const activeTab = ref("general");

// Load initial data
onMounted(async () => {
  await Promise.all([
    hotelStore.GetAllHotelNames(),
    customerStore.GetAllCustomerName(),
    loadBookingDetails(),
  ]);
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h3 class="text-h4 font-weight-semibold mb-1">الحجوزات / تعديل حجز</h3>
        <p class="text-body-1 text-medium-emphasis">تعديل بيانات الحجز</p>
      </div>
      <VBtn
        variant="outlined"
        @click="goBack"
        prepend-icon="tabler-arrow-right"
      >
        العودة
      </VBtn>
    </div>

    <VCard v-if="!isLoading">
      <VCardText>
        <VForm @submit.prevent="submitForm">
          <!-- General Information Tab -->
          <VTabs v-model="activeTab" class="mb-6">
            <VTab value="general">المعلومات العامة</VTab>
            <VTab value="pricing">التسعير والدفع</VTab>
            <VTab value="status">الحالة والملاحظات</VTab>
          </VTabs>

          <VWindow v-model="activeTab">
            <!-- General Information -->
            <VWindowItem value="general">
              <VRow>
                <!-- Customer Selection -->
                <VCol cols="12" md="6">
                  <VAutocomplete
                    v-model="formData.customerId"
                    :items="CustomerNames"
                    item-title="name"
                    item-value="id"
                    label="العميل *"
                    placeholder="اختر العميل"
                    :loading="isLoading"
                    required
                  />
                </VCol>

                <!-- Hotel Selection -->
                <VCol cols="12" md="6">
                  <VAutocomplete
                    v-model="formData.hotelId"
                    :items="HotelNames"
                    item-title="name.ar"
                    item-value="id"
                    label="الفندق *"
                    placeholder="اختر الفندق"
                    :loading="isLoading"
                    required
                  />
                </VCol>

                <!-- Room Selection -->
                <VCol cols="12" md="6">
                  <VAutocomplete
                    v-model="formData.roomId"
                    :items="availableRooms"
                    :item-title="(item: any) => `${item.numberRoom} - ${item.nameAr} (${item.pricePerNight} ل.س/ليلة)`"
                    item-value="id"
                    label="الغرفة *"
                    placeholder="اختر الغرفة"
                    :loading="isLoading"
                    :disabled="!formData.hotelId"
                    required
                  />
                </VCol>

                <!-- Check-in Date -->
                <VCol cols="12" md="6">
                  <AppDateTimePicker
                    v-model="formData.checkInDate"
                    label="تاريخ الوصول *"
                    placeholder="اختر تاريخ الوصول"
                    required
                  />
                </VCol>

                <!-- Check-out Date -->
                <VCol cols="12" md="6">
                  <AppDateTimePicker
                    v-model="formData.checkOutDate"
                    label="تاريخ المغادرة *"
                    placeholder="اختر تاريخ المغادرة"
                    required
                  />
                </VCol>

                <!-- Number of Nights (Read-only) -->
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.numberOfNights"
                    label="عدد الليالي"
                    type="number"
                    readonly
                  />
                </VCol>
              </VRow>

              <VDivider class="my-6" />

              <!-- Guest Information -->
              <h5 class="text-h6 mb-4">معلومات الضيف</h5>
              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.guestInfo.fullName"
                    label="الاسم الكامل"
                    placeholder="أدخل الاسم الكامل"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.guestInfo.email"
                    label="البريد الإلكتروني"
                    type="email"
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.guestInfo.phone"
                    label="رقم الهاتف"
                    placeholder="أدخل رقم الهاتف"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.guestInfo.nationality"
                    label="الجنسية"
                    placeholder="أدخل الجنسية"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.guestInfo.idNumber"
                    label="رقم الهوية"
                    placeholder="أدخل رقم الهوية"
                  />
                </VCol>
              </VRow>

              <VDivider class="my-6" />

              <!-- Guests Count -->
              <h5 class="text-h6 mb-4">عدد الضيوف</h5>
              <VRow>
                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.guestsCount.adults"
                    label="البالغون"
                    type="number"
                    min="1"
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.guestsCount.children"
                    label="الأطفال"
                    type="number"
                    min="0"
                  />
                </VCol>

                <VCol cols="12" md="4">
                  <AppTextField
                    v-model="formData.guestsCount.infants"
                    label="الرضع"
                    type="number"
                    min="0"
                  />
                </VCol>
              </VRow>
            </VWindowItem>

            <!-- Pricing Tab -->
            <VWindowItem value="pricing">
              <VRow>
                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.pricing.roomBasePrice"
                    label="سعر الغرفة لليلة الواحدة"
                    type="number"
                    suffix="ل.س"
                    readonly
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.pricing.roomTotalPrice"
                    label="إجمالي سعر الغرفة"
                    type="number"
                    suffix="ل.س"
                    readonly
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="formData.pricing.discount"
                    label="الخصم"
                    type="number"
                    suffix="ل.س"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <AppTextField
                    v-model="calculatedTotal"
                    label="المبلغ الإجمالي"
                    type="number"
                    suffix="ل.س"
                    readonly
                    class="font-weight-bold"
                  />
                </VCol>

                <VCol cols="12" md="6">
                  <VSelect
                    v-model="formData.paymentMethodId"
                    :items="paymentMethods"
                    item-title="name"
                    item-value="id"
                    label="طريقة الدفع *"
                    placeholder="اختر طريقة الدفع"
                    required
                  />
                </VCol>
              </VRow>
            </VWindowItem>

            <!-- Status Tab -->
            <VWindowItem value="status">
              <VRow>
                <VCol cols="12" md="6">
                  <VSelect
                    v-model="formData.status"
                    :items="bookingStatusOptions"
                    item-title="title"
                    item-value="value"
                    label="حالة الحجز *"
                    placeholder="اختر حالة الحجز"
                    required
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextarea
                    v-model="formData.notes"
                    label="ملاحظات"
                    placeholder="أدخل أي ملاحظات إضافية"
                    rows="4"
                  />
                </VCol>
              </VRow>
            </VWindowItem>
          </VWindow>

          <!-- Submit Buttons -->
          <VRow class="mt-6">
            <VCol cols="12">
              <div class="d-flex gap-4">
                <VBtn
                  type="submit"
                  color="primary"
                  :loading="isSubmitting"
                  :disabled="
                    !formData.customerId ||
                    !formData.roomId ||
                    !formData.checkInDate ||
                    !formData.checkOutDate
                  "
                >
                  حفظ التغييرات
                </VBtn>
                <VBtn
                  variant="outlined"
                  @click="goBack"
                  :disabled="isSubmitting"
                >
                  إلغاء
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <!-- Loading State -->
    <VCard v-else>
      <VCardText class="text-center py-12">
        <VProgressCircular indeterminate color="primary" size="64" />
        <p class="mt-4 text-body-1">جار تحميل بيانات الحجز...</p>
      </VCardText>
    </VCard>
  </div>
</template>

<style scoped>
.font-weight-bold {
  font-weight: 700 !important;
}
</style>
