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

// Form data
const formData = ref({
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
  return RommsByHotel.value.filter((room: any) => !room.isBooked);
});

// Payment methods (you might want to create a separate store for this)
const paymentMethods = ref([
  { id: "1", name: "نقداً", value: "cash" },
  { id: "2", name: "بطاقة ائتمان", value: "credit_card" },
  { id: "3", name: "تحويل بنكي", value: "bank_transfer" },
]);

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

// Methods
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
      notes: formData.value.notes,
    };

    // TODO: Implement add booking in store
    await store.AddBooking(bookingData);

    // Navigate back to bookings list
    router.push("/booking");
  } catch (error) {
    console.error("Error creating booking:", error);
  } finally {
    isSubmitting.value = false;
  }
};

const goBack = () => {
  router.push("/booking");
};
// Watch for customer selection to fill guest info
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
    } else {
      // Reset guest info when no customer is selected
      formData.value.guestInfo.fullName = "";
      formData.value.guestInfo.email = "";
      formData.value.guestInfo.phone = "";
      formData.value.guestInfo.nationality = "";
      formData.value.guestInfo.idNumber = "";
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
        // تحديث سعر الليلة الواحدة من pricePerNight
        formData.value.pricing.roomBasePrice = selectedRoom.pricePerNight;

        // حساب السعر الإجمالي للغرفة (السعر × عدد الليالي)
        formData.value.pricing.roomTotalPrice =
          selectedRoom.pricePerNight * formData.value.numberOfNights;

        // تحديث المجموع الفرعي والكلي
        formData.value.pricing.subtotal =
          formData.value.pricing.roomTotalPrice +
          formData.value.pricing.servicesTotalPrice;

        formData.value.pricing.totalAmount = calculatedTotal.value;
      }
    }
  },
  { immediate: true } // للتأكد من التنفيذ عند التحميل الأولي
);
// Format currency helper
const formatCurrency = (amount: number) => {
  return `${amount.toLocaleString()} ل.س`;
};

// Load initial data
onMounted(async () => {
  await Promise.all([
    hotelStore.GetAllHotelNames(),
    customerStore.GetAllCustomerName(),
  ]);
});
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h3 class="text-h4 font-weight-semibold mb-1">الحجوزات / إضافة حجز</h3>
        <p class="text-body-1 text-medium-emphasis">إضافة حجز جديد للنظام</p>
      </div>
      <VBtn
        variant="outlined"
        @click="goBack"
        prepend-icon="tabler-arrow-right"
      >
        العودة
      </VBtn>
    </div>

    <VCard>
      <VCardText>
        <VForm @submit.prevent="submitForm">
          <VRow>
            <!-- Customer Selection -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="formData.customerId"
                :items="CustomerNames"
                item-title="name"
                item-value="id"
                label="العميل "
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
                item-title="name"
                item-value="id"
                label="الفندق "
                placeholder="اختر الفندق"
                :loading="isLoading"
                required
                @update:model-value="loadAvailableRooms(formData.hotelId)"
              />
            </VCol>

            <!-- Room Selection -->
            <VCol cols="12" md="6">
              <VAutocomplete
                v-model="formData.roomId"
                :items="availableRooms"
                :item-title="(item: any) => `${item.numberRoom} - ${item.nameAr} (${item.pricePerNight} ل.س/ليلة)`"
                item-value="id"
                label="الغرفة "
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

          <VDivider class="my-6" />

          <!-- Pricing -->
          <h5 class="text-h6 mb-4">التسعير</h5>
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
          </VRow>

          <VDivider class="my-6" />

          <!-- Payment Method -->
          <VRow>
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

            <VCol cols="12" md="6">
              <AppTextarea
                v-model="formData.notes"
                label="ملاحظات"
                placeholder="أدخل أي ملاحظات إضافية"
                rows="3"
              />
            </VCol>
          </VRow>

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
                  إضافة الحجز
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
  </div>
</template>

<style scoped>
.font-weight-bold {
  font-weight: 700 !important;
}
</style>
