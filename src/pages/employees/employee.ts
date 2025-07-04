import { useApi, usePagination } from "@/composables";
import { FilterEmployeeDto, GetAllEmployee } from "./api/dto";
import { EMPLOYEE_API } from "./api/endpoint";

export const useEmployeeStore = defineStore("Employees", () => {
  const { GET, POST, DELETE } = useApi();
  // pagintaion
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);

    return pagination;
  };
  const EmployeeList = ref<GetAllEmployee["employees"]>([]);
  const paginationEmployee = createPagination();
  async function GetAllEmployees(Filters: FilterEmployeeDto) {
    const response = await GET<GetAllEmployee>(
      EMPLOYEE_API.GetAll,
      {
        ...Filters,
        page: paginationEmployee.value.currentPage, // ✅ الاسم الصحيح الذي يتوقعه السيرفر
        limit: paginationEmployee.value.limit,
      },
      {},
      {}
    );

    EmployeeList.value = response.data?.data.employees;
    paginationEmployee.value.totalCount = response.data?.data.count;
  }

  return { EmployeeList, paginationEmployee, GetAllEmployees };
});
