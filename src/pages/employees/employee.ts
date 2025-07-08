import { useApi, usePagination } from "@/composables";
import type { AddEmployeeDto, ChangeEmployeeStatusDto, FilterEmployeeDto, GetAllEmployee, ModifyEmployeeDto } from "./api/dto";
import { DetailsEmployeeDto } from "./api/dto";
import { EMPLOYEE_API } from "./api/endpoint";

export const useEmployeeStore = defineStore("Employees", () => {
  const { GET, POST, DELETE } = useApi();
  // pagintaion
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);

    return pagination;
  };
  const EmployeeList = ref<GetAllEmployee["employees"]>([]);
  const EmployeeNames = ref([]);
  const EmployeeDetails = ref<DetailsEmployeeDto>({
    ...new DetailsEmployeeDto(),
  });
  const paginationEmployee = createPagination();
  // Get All Employees
  async function GetAllEmployees(Filters: FilterEmployeeDto) {
    const response = await GET<GetAllEmployee>(
      EMPLOYEE_API.GetAll,
      {
        ...Filters,
        page: paginationEmployee.value.currentPage,
        limit: paginationEmployee.value.limit,
      },
      {},
      {}
    );

    EmployeeList.value = response.data?.data.employees;
    paginationEmployee.value.totalCount = response.data?.data.count;
  }

  // Get All Employee Names
  async function GetAllEmployeeNames() {
    const response = await GET<GetAllEmployee>(
      EMPLOYEE_API.GetNames,
      {},
      {},
      {}
    );

    EmployeeNames.value = response.data;
  }

  // Add Employee
  async function AddEmployee(payload: AddEmployeeDto) {
    const response = await POST(
      EMPLOYEE_API.Add,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    // Refresh the employee list after adding
    if (response.success) {
      await GetAllEmployees({} as FilterEmployeeDto);
    }

    return response;
  }

  // Get Details Employee
  async function GetDetailsEmployee(id: string) {
    const response = await GET<DetailsEmployeeDto>(
      `${EMPLOYEE_API.GetById}/${id}`
    );

    EmployeeDetails.value = response.data;
  }

  // Modify Employee
  async function ModifyEmployee(payload: ModifyEmployeeDto) {
    const response = await POST(
      `${EMPLOYEE_API.Modify}/${payload.id}`,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    // Refresh the employee details and list after modification
    if (response.success && payload.id) {
      await GetDetailsEmployee(payload.id);
      await GetAllEmployees({} as FilterEmployeeDto);
    }

    return response;
  }

  // Change Employee Status
  async function ChangeEmployeeStatus(employeeId: string, payload: ChangeEmployeeStatusDto) {
    const response = await POST(
      `${EMPLOYEE_API.ChangeStatus}/${employeeId}/status`,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    // Refresh the employee details and list after status change
    if (response.success) {
      await GetDetailsEmployee(employeeId);
      await GetAllEmployees({} as FilterEmployeeDto);
    }

    return response;
  }

  // Delete Employee
  async function DeleteEmployee(ids: string[], itemName: string) {
    await DELETE(
      EMPLOYEE_API.Delete,
      ids,
      {},
      {
        comfirm: {
          title: "حذف",
          text: itemName
            ? `هل تريد بالتأكيد حذف الموظف (${itemName})؟`
            : "هل تريد حذف الموظفين المحددين؟",
          icon: "warning",
          confirmButtonText: "تأكيد",
          cancelButtonText: "إلغاء",
        },
        success: "تمت العملية بنجاح",
        error: true,
      }
    );
    EmployeeList.value = EmployeeList.value?.filter(
      (item: any) => !ids.includes(item.id)
    );
  }

  return {
    GetAllEmployees,
    paginationEmployee,
    EmployeeList,
    EmployeeDetails,
    GetDetailsEmployee,
    AddEmployee,
    ModifyEmployee,
    ChangeEmployeeStatus,
    DeleteEmployee,
    GetAllEmployeeNames,
    EmployeeNames,
  };
});
