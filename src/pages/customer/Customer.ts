import { useApi, usePagination } from "@/composables";
import type { CustomersFiltersDto, GetAllCustomerDto } from "./api/dto";
import { DetailsCustomerDto } from "./api/dto";
import { CUSTOMER_API } from "./api/endpoint";

export const useCustomerStore = defineStore("Customer", () => {
  const { GET, POST, DELETE } = useApi();

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

    CustomerNames.value = response.data;
  }

  // Add Customer
  async function AddCustomer(payload: any) {
    const response = await POST(
      CUSTOMER_API.Add,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    CustomerList.value?.unshift(payload);

    return response;
  }

  // GetDetails Customer
  async function GetDetailsCustomer(id: string) {
    const response = await GET<DetailsCustomerDto>(
      `${CUSTOMER_API.GetById}?id=${id}`
    );

    CustomerDetails.value = response.data;
  }

  // Modify Customer
  async function ModifyCustomer(payload: any) {
    const response = await POST(
      CUSTOMER_API.Modify,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    CustomerList.value?.unshift(payload);

    return response;
  }

  // Delete Customer with query string and request payload
  // Delete Customer with query string and request payload

  //////////////////////
  async function DeleteCustomer(ids: string[], itemName: string) {
    await DELETE(
      CUSTOMER_API.Delete,
      ids,
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
    DeleteCustomer,
    GetAllCustomerName,
    CustomerNames,
  };
});
