export class GetAllEmployee {
  count = 0;
  employees: employees[] = [];
}

export class employees {
  id: null | string = null;
  number: null | string = null;
  fullName: null | string = null;
  email: null | string = null;
  phoneNumber: null | string = null;
  countryName: null | string = null;
  imageUrl: null | string = null;
  roleName: null | string = null;
  lastSeen: null | string = null;
  status: null | string = null;
}
export class FilterEmployeeDto {
  search: null | string = null;
  role: null | string = null;
  countryId: null | string = null;
  SortOrder: null | string = null;
  sortBy: null | string = null;
  status: null | string = null;
  SortColumn: null | string = null;
}
