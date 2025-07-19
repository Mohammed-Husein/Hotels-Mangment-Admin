import { useApi, usePagination } from "@/composables";
import { FilterBookingDto, GetAllBooking } from "./api/dto";
import { BOOKING_API } from "./api/endpoint";

export const useBookingStore = defineStore("Booking", () => {
  const { GET, POST, DELETE } = useApi();

  // pagination
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);
    return pagination;
  };
  const BookingList = ref<GetAllBooking["bookings"]>([]);
  const paginationBooking = createPagination();
  // Get All Hotels
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
  }
  return { BookingList, paginationBooking, GetAllBookings };
});
