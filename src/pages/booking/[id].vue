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
  bookingNumber: "",
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
    currency: "SAR",
  },
  payment: {
    paymentMethod: {
      _id: "",
      name: { ar: "", en: "" },
      code: "",
    },
    status: "",
    paidAmount: 0,
    remainingAmount: 0,
  },
  status: "",
  notes: {
    staff: "",
  },
  customer: {
    _id: "",
    fullName: "",
    email: "",
    phoneNumber: "",
  },
  hotel: {
    _id: "",
    name: { ar: "", en: "" },
  },
  room: {
    _id: "",
    numberRoom: "",
    name: { ar: "", en: "" },
    price: 0,
  },
});

// Loading states
const isLoading = ref(false);
const isSubmitting = ref(false);

// Cancel booking dialog
const showCancelDialog = ref(false);
const cancelReason = ref("");
const isCancelling = ref(false);

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
  { id: "6856f0ea806207f831cc959e", name: "فيزا", value: "VISA" },
  { id: "cash", name: "نقداً", value: "cash" },
  { id: "bank_transfer", name: "تحويل بنكي", value: "bank_transfer" },
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
// Methods
const loadBookingDetails = async () => {
  try {
    isLoading.value = true;
    const booking = await store.GetBookingById(bookingId);

    // Fill form with booking data from API response
    if (booking) {
      formData.value.id = booking.id || booking._id;
      formData.value.bookingNumber = booking.bookingNumber;
      formData.value.customerId = booking.customer?._id || booking.customer?.id;
      formData.value.hotelId = booking.hotel?._id || booking.hotel?.id;
      formData.value.roomId = booking.room?._id || booking.room?.id;
      formData.value.checkInDate = booking.checkInDate;
      formData.value.checkOutDate = booking.checkOutDate;
      formData.value.numberOfNights = booking.numberOfNights;

      // Guest info
      formData.value.guestInfo = {
        fullName: booking.guestInfo?.fullName || "",
        email: booking.guestInfo?.email || "",
        phone: booking.guestInfo?.phone || "",
        nationality: booking.guestInfo?.nationality || "",
        idNumber: booking.guestInfo?.idNumber || "",
      };

      // Guests count
      formData.value.guestsCount = {
        adults: booking.guestsCount?.adults || 1,
        children: booking.guestsCount?.children || 0,
        infants: booking.guestsCount?.infants || 0,
      };

      // Pricing
      formData.value.pricing = {
        roomBasePrice: booking.pricing?.roomBasePrice || 0,
        roomTotalPrice: booking.pricing?.roomTotalPrice || 0,
        servicesTotalPrice: booking.pricing?.servicesTotalPrice || 0,
        subtotal: booking.pricing?.subtotal || 0,
        discount: booking.pricing?.discount || 0,
        totalAmount: booking.pricing?.totalAmount || 0,
        currency: booking.pricing?.currency || "SAR",
      };

      // Payment
      formData.value.payment = {
        paymentMethod: {
          _id: booking.payment?.paymentMethod?._id || "",
          name: booking.payment?.paymentMethod?.name || { ar: "", en: "" },
          code: booking.payment?.paymentMethod?.code || "",
        },
        status: booking.payment?.status || "",
        paidAmount: booking.payment?.paidAmount || 0,
        remainingAmount: booking.payment?.remainingAmount || 0,
      };

      formData.value.status = booking.status;
      formData.value.notes = {
        staff: booking.notes?.staff || "",
      };

      // Customer, hotel, room details
      formData.value.customer = {
        _id: booking.customer?._id || booking.customer?.id || "",
        fullName: booking.customer?.fullName || "",
        email: booking.customer?.email || "",
        phoneNumber: booking.customer?.phoneNumber || "",
      };

      formData.value.hotel = {
        _id: booking.hotel?._id || booking.hotel?.id || "",
        name: booking.hotel?.name || { ar: "", en: "" },
      };

      formData.value.room = {
        _id: booking.room?._id || booking.room?.id || "",
        numberRoom: booking.room?.numberRoom || "",
        name: booking.room?.name || { ar: "", en: "" },
        price: booking.room?.price || 0,
      };

      // Load rooms for the hotel if needed
      if (formData.value.hotelId) {
        await loadAvailableRooms(formData.value.hotelId);
      }
    }
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
      paymentMethodId: formData.value.payment.paymentMethod._id,
      status: formData.value.status,
      notes: formData.value.notes.staff,
    };

    await store.UpdateBooking(bookingData);

    // Show success message
    console.log("تم تحديث الحجز بنجاح");

    // Navigate back to bookings list
    router.push("/booking");
  } catch (error) {
    console.error("Error updating booking:", error);
    console.error("حدث خطأ أثناء تحديث الحجز");
  } finally {
    isSubmitting.value = false;
  }
};

// Cancel booking function
const cancelBooking = async () => {
  if (!cancelReason.value.trim()) {
    console.error("يرجى إدخال سبب الإلغاء");
    return;
  }

  try {
    isCancelling.value = true;

    await store.CancelBooking(formData.value.id, cancelReason.value.trim());

    // Update local status
    formData.value.status = "cancelled";

    // Show success message
    console.log("تم إلغاء الحجز بنجاح");

    // Close dialog and navigate back
    showCancelDialog.value = false;
    router.push("/booking");
  } catch (error) {
    console.error("Error cancelling booking:", error);
    console.error("حدث خطأ أثناء إلغاء الحجز");
  } finally {
    isCancelling.value = false;
  }
};

const goBack = () => {
  router.push("/booking");
};

// Helper functions for status display
const getStatusColor = (status: string) => {
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

const getStatusText = (status: string) => {
  switch (status) {
    case "pending":
      return "في الانتظار";
    case "confirmed":
      return "مؤكد";
    case "checked_in":
      return "تم الوصول";
    case "checked_out":
      return "تم المغادرة";
    case "cancelled":
      return "ملغي";
    case "no_show":
      return "لم يحضر";
    default:
      return status;
  }
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
        <p class="text-body-1 text-medium-emphasis">
          تعديل بيانات الحجز
          <span v-if="formData.bookingNumber" class="font-weight-medium">
            - {{ formData.bookingNumber }}
          </span>
        </p>
      </div>
      <VBtn
        variant="outlined"
        @click="goBack"
        prepend-icon="tabler-arrow-right"
      >
        العودة
      </VBtn>
    </div>

    <!-- Booking Summary Card -->
    <VCard v-if="!isLoading && formData.id" class="mb-6">
      <VCardText>
        <VRow>
          <VCol cols="12" md="3">
            <div class="text-body-2 text-medium-emphasis mb-1">رقم الحجز</div>
            <div class="text-h6 font-weight-medium">{{ formData.bookingNumber }}</div>
          </VCol>
          <VCol cols="12" md="3">
            <div class="text-body-2 text-medium-emphasis mb-1">العميل</div>
            <div class="text-h6 font-weight-medium">{{ formData.customer.fullName }}</div>
          </VCol>
          <VCol cols="12" md="3">
            <div class="text-body-2 text-medium-emphasis mb-1">الفندق</div>
            <div class="text-h6 font-weight-medium">{{ formData.hotel.name.ar }}</div>
          </VCol>
          <VCol cols="12" md="3">
            <div class="text-body-2 text-medium-emphasis mb-1">حالة الحجز</div>
            <VChip
              :color="getStatusColor(formData.status)"
              variant="tonal"
              size="small"
            >
              {{ getStatusText(formData.status) }}
            </VChip>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VCard v-if="!isLoading">
      <VCardText>
        <VForm @submit.prevent="submitForm">
          <!-- General Information Tab -->
          <VTabs v-model="activeTab" class="mb-6">
            <VTab value="general">المعلومات العامة</VTab>
            <VTab value="pricing">التسعير والدفع</VTab>
            <VTab value="status">الحالة والملاحظات</VTab>
            <VTab value="details">تفاصيل إضافية</VTab>
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
                    item-title="name"
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
                    v-model="formData.payment.paymentMethod._id"
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
                    v-model="formData.notes.staff"
                    label="ملاحظات"
                    placeholder="أدخل أي ملاحظات إضافية"
                    rows="4"
                  />
                </VCol>
              </VRow>
            </VWindowItem>

            <!-- Additional Details Tab -->
            <VWindowItem value="details">
              <VRow>
                <!-- Customer Details -->
                <VCol cols="12" md="6">
                  <VCard variant="outlined">
                    <VCardTitle class="text-h6 pa-4 pb-2">
                      <VIcon icon="tabler-user" class="me-2" />
                      تفاصيل العميل
                    </VCardTitle>
                    <VCardText class="pa-4 pt-0">
                      <div class="mb-3">
                        <div class="text-body-2 text-medium-emphasis">الاسم الكامل</div>
                        <div class="text-body-1 font-weight-medium">{{ formData.customer.fullName }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-body-2 text-medium-emphasis">البريد الإلكتروني</div>
                        <div class="text-body-1">{{ formData.customer.email }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-body-2 text-medium-emphasis">رقم الهاتف</div>
                        <div class="text-body-1">{{ formData.customer.phoneNumber }}</div>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- Room Details -->
                <VCol cols="12" md="6">
                  <VCard variant="outlined">
                    <VCardTitle class="text-h6 pa-4 pb-2">
                      <VIcon icon="tabler-bed" class="me-2" />
                      تفاصيل الغرفة
                    </VCardTitle>
                    <VCardText class="pa-4 pt-0">
                      <div class="mb-3">
                        <div class="text-body-2 text-medium-emphasis">رقم الغرفة</div>
                        <div class="text-body-1 font-weight-medium">{{ formData.room.numberRoom }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-body-2 text-medium-emphasis">اسم الغرفة</div>
                        <div class="text-body-1">{{ formData.room.name.ar }}</div>
                      </div>
                      <div class="mb-3">
                        <div class="text-body-2 text-medium-emphasis">سعر الليلة</div>
                        <div class="text-body-1 font-weight-medium">{{ formData.room.price }} {{ formData.pricing.currency }}</div>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- Payment Details -->
                <VCol cols="12">
                  <VCard variant="outlined">
                    <VCardTitle class="text-h6 pa-4 pb-2">
                      <VIcon icon="tabler-credit-card" class="me-2" />
                      تفاصيل الدفع
                    </VCardTitle>
                    <VCardText class="pa-4 pt-0">
                      <VRow>
                        <VCol cols="12" md="3">
                          <div class="text-body-2 text-medium-emphasis mb-1">طريقة الدفع</div>
                          <div class="text-body-1 font-weight-medium">{{ formData.payment.paymentMethod.name.ar }}</div>
                        </VCol>
                        <VCol cols="12" md="3">
                          <div class="text-body-2 text-medium-emphasis mb-1">حالة الدفع</div>
                          <VChip
                            :color="formData.payment.status === 'paid' ? 'success' : 'warning'"
                            variant="tonal"
                            size="small"
                          >
                            {{ formData.payment.status === 'paid' ? 'مدفوع' : 'معلق' }}
                          </VChip>
                        </VCol>
                        <VCol cols="12" md="3">
                          <div class="text-body-2 text-medium-emphasis mb-1">المبلغ المدفوع</div>
                          <div class="text-body-1 font-weight-medium">{{ formData.payment.paidAmount }} {{ formData.pricing.currency }}</div>
                        </VCol>
                        <VCol cols="12" md="3">
                          <div class="text-body-2 text-medium-emphasis mb-1">المبلغ المتبقي</div>
                          <div class="text-body-1 font-weight-medium">{{ formData.payment.remainingAmount }} {{ formData.pricing.currency }}</div>
                        </VCol>
                      </VRow>
                    </VCardText>
                  </VCard>
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
                    !formData.checkOutDate ||
                    formData.status === 'cancelled'
                  "
                >
                  حفظ التغييرات
                </VBtn>
                <VBtn
                  color="error"
                  variant="outlined"
                  @click="showCancelDialog = true"
                  :disabled="isSubmitting || formData.status === 'cancelled'"
                  prepend-icon="tabler-x"
                >
                  إلغاء الحجز
                </VBtn>
                <VBtn
                  variant="outlined"
                  @click="goBack"
                  :disabled="isSubmitting"
                >
                  العودة
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

    <!-- Cancel Booking Dialog -->
    <VDialog v-model="showCancelDialog" max-width="500">
      <VCard>
        <VCardTitle class="text-h6 pa-6 pb-4">
          <VIcon icon="tabler-alert-triangle" color="error" class="me-2" />
          إلغاء الحجز
        </VCardTitle>

        <VCardText class="pa-6 pt-0">
          <p class="text-body-1 mb-4">
            هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟ هذا الإجراء لا يمكن التراجع عنه.
          </p>

          <VAlert
            type="warning"
            variant="tonal"
            class="mb-4"
          >
            رقم الحجز: {{ formData.bookingNumber }}
          </VAlert>

          <AppTextarea
            v-model="cancelReason"
            label="سبب الإلغاء *"
            placeholder="يرجى إدخال سبب إلغاء الحجز..."
            rows="3"
            required
            :error="!cancelReason.trim() && cancelReason !== ''"
            error-message="سبب الإلغاء مطلوب"
          />
        </VCardText>

        <VCardActions class="pa-6 pt-0">
          <VSpacer />
          <VBtn
            variant="outlined"
            @click="showCancelDialog = false"
            :disabled="isCancelling"
          >
            تراجع
          </VBtn>
          <VBtn
            color="error"
            @click="cancelBooking"
            :loading="isCancelling"
            :disabled="!cancelReason.trim()"
          >
            إلغاء الحجز
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<style scoped>
.font-weight-bold {
  font-weight: 700 !important;
}
</style>
