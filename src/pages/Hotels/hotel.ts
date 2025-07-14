import { useApi, usePagination } from "@/composables";
import type { AddHotelDto, GetAllHotelsDto, HotelFiltersDto, ModifyHotelDto } from "./api/dto";
import { DetailsHotelDto } from "./api/dto";
import { HOTEL_API } from "./api/endpoint";

export const useHotelStore = defineStore("Hotels", () => {
  const { GET, POST, DELETE } = useApi();

  // pagination
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);
    return pagination;
  };

  const paginationHotel = createPagination();

  // lists
  const HotelList = ref<GetAllHotelsDto["hotels"]>([]);
  const HotelNames = ref([]);
  const HotelDetails = ref<DetailsHotelDto>({
    ...new DetailsHotelDto(),
  });
  const CitiesList = ref([]);
  const RegionsList = ref([]);

  // Get All Hotels
  async function GetAllHotels(Filters: HotelFiltersDto) {
    const response = await GET<GetAllHotelsDto>(
      HOTEL_API.GetAll,
      {
        ...Filters,
        page: paginationHotel.value.currentPage,
        limit: paginationHotel.value.limit,
      },
      {},
      {}
    );

    HotelList.value = response.data?.data?.hotels || [];
    paginationHotel.value.totalCount = response.data?.data?.count || 0;
  }

  async function GetAllHotelNames() {
    const response = await GET<any>(
      HOTEL_API.GetAll,
      { limit: 1000 },
      {},
      {}
    );

    HotelNames.value = response.data?.data?.hotels || [];
  }

  // Get All Governorates Names (independent)
  async function GetAllGovernorateNames() {
    const response = await GET<any>(
      "governorates/names",
      {},
      {},
      {}
    );

    CitiesList.value = response.data?.data?.governorates || [];
    return response.data?.data?.governorates || [];
  }

  // Get All Regions Names (independent)
  async function GetAllRegionNames() {
    const response = await GET<any>(
      "regions/names",
      {},
      {},
      {}
    );

    RegionsList.value = response.data?.data?.regions || [];
    return response.data?.data?.regions || [];
  }

  // Add Hotel
  async function AddHotel(payload: AddHotelDto | FormData) {
    const response = await POST(
      HOTEL_API.Add,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: true }
    );

    // Refresh the hotel list after adding
    if (response && response.success) {
      await GetAllHotels({} as HotelFiltersDto);
    }

    return response;
  }

  // GetDetails Hotel
  async function GetDetailsHotel(id: string) {
    const response = await GET<any>(
      `${HOTEL_API.GetById}/${id}`
    );

    if (response.data && response.data.data && response.data.data.hotel) {
      HotelDetails.value = response.data.data.hotel;
    }
  }

  // Modify Hotel
  async function ModifyHotel(payload: ModifyHotelDto) {
    const response = await POST(
      `${HOTEL_API.Modify}/${payload.id}`,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    // Refresh the hotel details and list after modification
    if (response && response.success && payload.id) {
      await GetDetailsHotel(payload.id);
      await GetAllHotels({} as HotelFiltersDto);
    }

    return response;
  }

  // Delete Hotel
  async function DeleteHotel(ids: string[], itemName: string) {
    await DELETE(
      HOTEL_API.Delete,
      ids,
      {},
      {
        comfirm: {
          title: "حذف",
          text: itemName
            ? `هل تريد بالتأكيد حذف الفندق (${itemName})؟`
            : "هل تريد حذف الفنادق المحددة؟",
          icon: "warning",
          confirmButtonText: "تأكيد",
          cancelButtonText: "إلغاء",
        },
        success: "تمت العملية بنجاح",
        error: true,
      }
    );
    HotelList.value = HotelList.value?.filter(
      (item: any) => !ids.includes(item.id)
    );
  }

  return {
    GetAllHotels,
    paginationHotel,
    HotelList,
    HotelDetails,
    GetDetailsHotel,
    AddHotel,
    ModifyHotel,
    DeleteHotel,
    GetAllHotelNames,
    HotelNames,
    GetAllGovernorateNames,
    GetAllRegionNames,
    CitiesList,
    RegionsList,
  };
});
