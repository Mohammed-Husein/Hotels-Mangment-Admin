import { useApi, usePagination } from "@/composables";
import { AddCity, filterCityDto, GetAllCities } from "./api/dto";
import { CITY_API } from "./api/endpoint";

export const useCityStore = defineStore("City", () => {
  const { GET, POST, DELETE, PUT } = useApi();

  const cityList = ref<GetAllCities["cities"]>([]);
  const cityDetails = ref<AddCity[]>([]);

  // pagination
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);
    return pagination;
  };

  const paginationCity = createPagination();

  // جلب جميع المدن
  async function GetAllCities(Filters: filterCityDto) {
    const response = await GET<any>(
      CITY_API.GetAll,
      {
        ...Filters,
        page: paginationCity.value.currentPage,
        limit: paginationCity.value.limit,
      },
      {},
      {}
    );

    cityList.value = response.data?.data.cities || [];
    paginationCity.value.totalCount = response.data?.data.count || 0;
    paginationCity.value.totalPages = Math.ceil(
      (response.data?.data.count || 0) / paginationCity.value.limit
    );
  }

  // إضافة مدينة جديدة
  async function AddCity(payload: any) {
    const response = await POST(
      CITY_API.Add,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    cityList.value?.unshift(payload);
    return response;
  }

  // جلب مدينة بالمعرف
  async function GetCityById(id: string) {
    const response = await GET<any>(`${CITY_API.GetAll}/${id}`, {}, {}, {});
    cityDetails.value = response.data?.data.governorate;
  }

  // تعديل مدينة
  async function ModifyCity(payload: any) {
    const response = await POST(CITY_API.Add, payload, {
      error: true,
      success: "تمت العملية بنجاح",
    });

    cityList.value?.unshift(payload);
    return response;
  }

  // حذف مدينة
  async function DeleteCity(ids: string, itemName: string) {
    await DELETE(
      `${CITY_API.Delete}/${ids}`,
      {},
      {},
      {
        comfirm: {
          title: "حذف مدينة ",
          text: `هل تريد بالتأكيد حذف المدينة (${itemName})؟`,
          icon: "warning",
          confirmButtonText: "تأكيد",
          cancelButtonText: "إلغاء",
        },
        success: "تمت العملية بنجاح",
        error: true,
      }
    );
    cityList.value = cityList.value?.filter(
      (item: any) => !ids.includes(item.id)
    );
  }
  const CityNameList = ref([]);
  async function GetAllCityNames() {
    const response = await GET<any>("governorates/names", {}, {}, {});
    CityNameList.value = response.data?.data.governorates || [];
    return response.data?.data.governorates || [];
  }
  return {
    GetAllCityNames,
    CityNameList,
    cityList,
    paginationCity,
    GetAllCities,
    AddCity,
    ModifyCity,
    GetCityById,
    cityDetails,
    DeleteCity,
  };
});
