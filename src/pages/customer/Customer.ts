import { useApi, usePagination } from "@/composables";
import type {
  AddCustomerDto,
  ChangeCustomerStatusDto,
  CustomersFiltersDto,
  GetAllCustomerDto,
  ModifyCustomerDto,
} from "./api/dto";
import { DetailsCustomerDto } from "./api/dto";
import { CUSTOMER_API } from "./api/endpoint";

export const useCustomerStore = defineStore("Customer", () => {
  const { GET, POST, DELETE, PUT } = useApi();

  // pagintaion
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);

    return pagination;
  };

  const paginationCustomer = createPagination();

  // lists
  const CustomerList = ref<GetAllCustomerDto["customers"]>([]);
  const CustomerNames = ref([]);
  const CustomerDetails = ref<DetailsCustomerDto>({
    ...new DetailsCustomerDto(),
  });
  const CitiesList = ref([]);
  const RegionsList = ref([]);

  // Get All Customer
  async function GetAllCustomer(Filters: CustomersFiltersDto) {
    const response = await GET<GetAllCustomerDto>(
      CUSTOMER_API.GetAll,
      {
        ...Filters,
        page: paginationCustomer.value.currentPage,
        limit: paginationCustomer.value.limit,
      },
      {},
      {}
    );

    CustomerList.value = response.data?.data.customers;
    paginationCustomer.value.totalCount = response.data?.data.count;
  }
  async function GetAllCustomerName() {
    const response = await GET<GetAllCustomerDto>(
      CUSTOMER_API.GetNames,
      {},
      {},
      {}
    );

    CustomerNames.value = response.data?.data?.users;
  }

  // Get Cities by Country
  async function GetCitiesByCountry(countryId: string) {
    const response = await GET<any>("regions/cities", { countryId }, {}, {});

    CitiesList.value = response.data?.data.cities || [];
    return response.data?.data.cities || [];
  }

  // Get Regions by City
  async function GetRegionsByCity(cityId: string) {
    const response = await GET<any>(
      "regions/names",
      { governorateId: cityId },
      {},
      {}
    );

    RegionsList.value = response.data?.data.regions || [];
    return response.data?.data.regions || [];
  }

  // Add Customer
  async function AddCustomer(payload: AddCustomerDto) {
    const response = await POST(
      CUSTOMER_API.Add,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    // Refresh the customer list after adding
    if (response.success) {
      await GetAllCustomer({} as CustomersFiltersDto);
    }

    return response;
  }

  // GetDetails Customer
  async function GetDetailsCustomer(id: string) {
    const response = await GET<any>(`${CUSTOMER_API.GetById}/${id}`);

    if (response.data && response.data.data && response.data.data.user) {
      CustomerDetails.value = response.data.data.user;
    }
  }

  // Modify Customer
  async function ModifyCustomer(payload: ModifyCustomerDto) {
    const response = await PUT(
      `${CUSTOMER_API.Modify}/${payload.id}`,
      payload,
      {
        error: true,
        success: "تمت العملية بنجاح",
      }
    );

    // Refresh the customer details and list after modification
    if (response.success && payload.id) {
      await GetDetailsCustomer(payload.id);
      await GetAllCustomer({} as CustomersFiltersDto);
    }

    return response;
  }

  // Change Customer Status
  async function ChangeCustomerStatus(
    userId: string,
    payload: ChangeCustomerStatusDto
  ) {
    const response = await POST(
      `${CUSTOMER_API.ChangeStatus}/${userId}`,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    // Refresh the customer details and list after status change
    if (response.success) {
      await GetDetailsCustomer(userId);
      await GetAllCustomer({} as CustomersFiltersDto);
    }

    return response;
  }

  // Change Customer Password
  async function ChangeCustomerPassword(
    userId: string,
    payload: { newPassword: string; confirmPassword: string }
  ) {
    const response = await PUT(
      `${CUSTOMER_API.ChangePassword}/password/${userId}`,
      payload,
      { error: true, success: "تم تغيير كلمة السر بنجاح" },
      { formData: false }
    );

    return response;
  }

  // Delete Customer with query string and request payload
  // Delete Customer with query string and request payload

  //////////////////////
  async function DeleteCustomer(ids: string, itemName: string) {
    await DELETE(
      `${CUSTOMER_API.Delete}/${ids}`,
      {},
      {},
      {
        comfirm: {
          title: "حذف",
          text: itemName
            ? `هل تريد بالتأكيد حذف العميل (${itemName})؟`
            : "هل تريد حذف العملاء المحددين؟",
          icon: "warning",
          confirmButtonText: "تأكيد",
          cancelButtonText: "إلغاء",
        },
        success: "تمت العملية بنجاح",
        error: true,
      }
    );
    CustomerList.value = CustomerList.value?.filter(
      (item: any) => !ids.includes(item.id)
    );
  }
  ////////////////////////
  return {
    GetAllCustomer,
    paginationCustomer,
    CustomerList,
    CustomerDetails,
    GetDetailsCustomer,
    AddCustomer,
    ModifyCustomer,
    ChangeCustomerStatus,
    ChangeCustomerPassword,
    DeleteCustomer,
    GetAllCustomerName,
    CustomerNames,
    GetCitiesByCountry,
    GetRegionsByCity,
    CitiesList,
    RegionsList,
  };
});
