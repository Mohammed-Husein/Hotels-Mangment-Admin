export class GetAllEmployee {
  count = 0;
  employees: Employee[] = [];
}

export class Employee {
  id = "";
  number = 0;
  fullName = "";
  email = "";
  phoneNumber = "";
  alternatePhoneNumber = "";
  countryId = "";
  countryName = "";
  imageUrl = "";
  role = "";
  roleName = "";
  status = "";
  lastSeen = "";
  hireDate = "";
  notes = "";
  permissions: string[] = [];
  deviceToken = "";
  createdAt = "";
  updatedAt = "";
  createdBy = "";
  statusChangeReason = "";
  statusChangedAt = "";
  statusChangedBy = "";
}

export class FilterEmployeeDto {
  search: null | string = null;
  role: null | string = null;
  countryId: null | string = null;
  sortOrder: null | string = null;
  sortBy: null | string = null;
  status: null | string = null;
}

export class AddEmployeeDto {
  fullName = "";
  email = "";
  phoneNumber = "";
  alternatePhoneNumber = "";
  password = "";
  confirmPassword = "";
  role = "";
  countryId = "";
  cityId = "";
  regionId = "";
  status = "Active";
  permissions: string[] = [];
  notes = "";
  deviceToken = "";
}

export class DetailsEmployeeDto {
  id = "";
  number = 0;
  fullName = "";
  email = "";
  phoneNumber = "";
  alternatePhoneNumber = "";
  countryId = "";
  countryName = "";
  cityId = "";
  cityName = "";
  regionId = "";
  regionName = "";
  imageUrl = "";
  role = "";
  roleName = "";
  status = "Active";
  lastSeen = "";
  hireDate = "";
  notes = "";
  permissions: string[] = [];
  deviceToken = "";
  createdAt = "";
  updatedAt = "";
  createdBy = "";
  statusChangeReason = "";
  statusChangedAt = "";
  statusChangedBy = "";
}

export class ModifyEmployeeDto {
  id = "";
  fullName = "";
  email = "";
  phoneNumber = "";
  alternatePhoneNumber = "";
  role = "";
  countryId = "";
  cityId = "";
  regionId = "";
  status = "Active";
  permissions: string[] = [];
  notes = "";
  deviceToken = "";
}

export class ChangeEmployeeStatusDto {
  status: "Active" | "Inactive" | "Suspended" | "OnLeave" = "Active";
  reason?: string;
  id?: string;
}
