import { useApi, usePagination } from "@/composables";
import { AddCountry, filterCountryDto, GetAllCountry } from "./api/dto";
import { SETTING_API } from "./api/endpoint";
export const useSettingStore = defineStore("Setting", () => {
  const { GET, POST, DELETE, PUT } = useApi();

  const countryList = ref<GetAllCountry["countries"]>([]);
  const Details = ref<AddCountry[]>([]);
  // pagintaion
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);

    return pagination;
  };
  const paginationCountry = createPagination();
  async function GetAllCountry(Filters: filterCountryDto) {
    const response = await GET<GetAllCountry>(
      SETTING_API.GetAll,
      {
        ...Filters,
        page: paginationCountry.value.currentPage, // ✅ الاسم الصحيح الذي يتوقعه السيرفر
        limit: paginationCountry.value.limit,
      },
      {},
      {}
    );

    countryList.value = response.data?.data.countries;
    paginationCountry.value.totalCount = response.data?.data.count;
  }
  async function AddCountry(payload: any) {
    const response = await POST(
      SETTING_API.Add,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    countryList.value?.unshift(payload);

    return response;
  }
  async function GetCountryById(id: string) {
    const response = await GET<GetAllCountry>(
      `${SETTING_API.GetAll}/${id}`,
      {},
      {},
      {}
    );
    Details.value = response.data?.data.country;
  }
  async function ModifyCountry(payload: any) {
    const response = await PUT(`${SETTING_API.Add}/${payload.id}`, payload, {
      error: true,
      success: "تمت العملية بنجاح",
    });

    countryList.value?.unshift(payload);

    return response;
  }
  async function DeleteCountry(ids: string, itemName: string) {
    await DELETE(
      `${SETTING_API.Add}/${ids}`,
      {},
      {},
      {
        comfirm: {
          title: "حذف بلد ",
          text: `هل تريد بالتأكيد حذف  البلد (${itemName})؟`,
          icon: "warning",
          confirmButtonText: "تأكيد",
          cancelButtonText: "إلغاء",
        },
        success: "تمت العملية بنجاح",
        error: true,
      }
    );
    countryList.value = countryList.value?.filter(
      (item: any) => !ids.includes(item.id)
    );
  }
  return {
    countryList,
    paginationCountry,
    GetAllCountry,
    AddCountry,
    ModifyCountry,
    GetCountryById,
    Details,
    DeleteCountry,
  };
});
