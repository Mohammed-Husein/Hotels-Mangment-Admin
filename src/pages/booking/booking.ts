import { useApi, usePagination } from "@/composables";
import { FilterBookingDto, GetAllBooking } from "./api/dto";
import { BOOKING_API } from "./api/endpoint";

export const useBookingStore = defineStore("Booking", () => {
  const { GET, POST, PUT, DELETE } = useApi();

  // pagination
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);
    return pagination;
  };
  const BookingList = ref<GetAllBooking["bookings"]>([]);
  const BookingDetails = ref({});
  const paginationBooking = createPagination();

  // Get All Bookings
  async function GetAllBookings(Filters: FilterBookingDto) {
    const response = await GET<GetAllBooking>(
      BOOKING_API.GetAll,
      {
        ...Filters,
        page: paginationBooking.value.currentPage,
        limit: paginationBooking.value.limit,
      },
      {},
      {}
    );

    BookingList.value = response.data?.data?.bookings || [];
    paginationBooking.value.totalCount = response.data?.data?.count || 0;
    paginationBooking.value.totalPages = Math.ceil(
      (response.data?.data?.count || 0) / paginationBooking.value.limit
    );
  }

  // Get Booking by ID
  async function GetBookingById(id: string) {
    const response = await GET(`${BOOKING_API.GetById}/${id}`, {}, {}, {});

    BookingDetails.value = response.data?.data?.booking || {};
    return BookingDetails.value;
  }

  // Add new booking
  async function AddBooking(bookingData: any) {
    const response = await POST(BOOKING_API.Add, bookingData, {}, {});

    return response.data?.data?.booking;
  }

  // Update booking
  async function UpdateBooking(bookingData: any) {
    const response = await PUT(
      `${BOOKING_API.Update}/${bookingData.id}`,
      bookingData,
      {},
      {}
    );

    return response.data?.data?.booking;
  }

  // Delete booking
  async function DeleteBooking(id: string) {
    const response = await DELETE(`${BOOKING_API.Delete}/${id}`, {}, {});

    return response.data;
  }

  // Cancel booking
  async function CancelBooking(id: string, reason: string) {
    const response = await PUT(
      `${BOOKING_API.Update}/${id}`,
      {
        status: "cancelled",
        cancellationReason: reason,
      },
      {},
      {}
    );

    return response.data?.data?.booking;
  }

  return {
    BookingList,
    BookingDetails,
    paginationBooking,
    GetAllBookings,
    GetBookingById,
    AddBooking,
    UpdateBooking,
    DeleteBooking,
    CancelBooking,
  };
});
