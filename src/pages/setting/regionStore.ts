import { useApi, usePagination } from "@/composables";
import { AddRegion, filterRegionDto, GetAllRegions } from "./api/dto";
import { REGION_API } from "./api/endpoint";

export const useRegionStore = defineStore("Region", () => {
  const { GET, POST, DELETE, PUT } = useApi();

  const regionList = ref<GetAllRegions["regions"]>([]);
  const regionDetails = ref<AddRegion[]>([]);
  const citiesList = ref<any[]>([]);
  
  // pagination
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);
    return pagination;
  };
  
  const paginationRegion = createPagination();

  // جلب جميع المناطق
  async function GetAllRegions(Filters: filterRegionDto) {
    const response = await GET<any>(
      REGION_API.GetAll,
      {
        ...Filters,
        page: paginationRegion.value.currentPage,
        limit: paginationRegion.value.limit,
      },
      {},
      {}
    );

    regionList.value = response.data?.data.regions || [];
    paginationRegion.value.totalCount = response.data?.data.count || 0;
    paginationRegion.value.totalPages = Math.ceil((response.data?.data.count || 0) / paginationRegion.value.limit);
  }

  // جلب المدن حسب البلد
  async function GetCitiesByCountry(countryId: string) {
    const response = await GET<any>(
      REGION_API.GetCitiesByCountry,
      { countryId },
      {},
      {}
    );

    citiesList.value = response.data?.data.cities || [];
    return response.data?.data.cities || [];
  }

  // إضافة منطقة جديدة
  async function AddRegion(payload: any) {
    const response = await POST(
      REGION_API.Add,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    regionList.value?.unshift(payload);
    return response;
  }

  // جلب منطقة بالمعرف
  async function GetRegionById(id: string) {
    const response = await GET<any>(
      `${REGION_API.GetAll}/${id}`,
      {},
      {},
      {}
    );
    regionDetails.value = response.data?.data.region;
  }

  // تعديل منطقة
  async function ModifyRegion(payload: any) {
    const response = await PUT(
      `${REGION_API.Update}/${payload.id}`,
      payload,
      {
        error: true,
        success: "تمت العملية بنجاح",
      }
    );

    regionList.value?.unshift(payload);
    return response;
  }

  // حذف منطقة
  async function DeleteRegion(ids: string, itemName: string) {
    await DELETE(
      `${REGION_API.Delete}/${ids}`,
      {},
      {},
      {
        comfirm: {
          title: "حذف منطقة ",
          text: `هل تريد بالتأكيد حذف المنطقة (${itemName})؟`,
          icon: "warning",
          confirmButtonText: "تأكيد",
          cancelButtonText: "إلغاء",
        },
        success: "تمت العملية بنجاح",
        error: true,
      }
    );
    regionList.value = regionList.value?.filter(
      (item: any) => !ids.includes(item.id)
    );
  }

  return {
    regionList,
    paginationRegion,
    GetAllRegions,
    AddRegion,
    ModifyRegion,
    GetRegionById,
    regionDetails,
    DeleteRegion,
    GetCitiesByCountry,
    citiesList,
  };
});
