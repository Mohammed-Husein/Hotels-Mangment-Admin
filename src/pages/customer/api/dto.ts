export class GetAllCustomerDto {
  count = 0;
  customers: customer[] = [];
}

export class customer {
  id = "";
  number = 0;
  firstName = "";
  lastName = "";
  email = "";
  phoneNumber = "";
  alternatePhoneNumber = "";
  countryName = "";
  regionId = "";
  cityId = "";
  detailedAddress = "";
  preferredLanguage = "";
  status = "";
  avatar = "";
  lastSeen = "";
  createdAt = "";
  updatedAt = "";
}

export class CustomersFiltersDto {
  sortOrder = null as string | null;
  sortBy = null as string | null;
  search = null as string | null;
  status = null as string | null;
  countryId = null as string | null;
  cityId = null as string | null;
  regionId = null as string | null;
}

export class AddCustomerDto {
  firstName = "";
  lastName = "";
  email = "";
  password = "";
  confirmPassword = "";
  phoneNumber = "";
  alternatePhoneNumber = "";
  regionId = "";
  countryId = "";
  cityId = "";
  detailedAddress = "";
  preferredLanguage = "Arabic";
}

export class DetailsCustomerDto {
  id = "";
  number = 0;
  firstName = "";
  lastName = "";
  email = "";
  phoneNumber = "";
  alternatePhoneNumber = "";
  regionId = "";
  countryId = "";
  cityId = "";
  detailedAddress = "";
  preferredLanguage = "Arabic";
  status = "Active";
  avatar = "";
  lastSeen = "";
  createdAt = "";
  updatedAt = "";
  fullName = "";
  countryName = "";
}

export class ModifyCustomerDto {
  id = "";
  firstName = "";
  lastName = "";
  email = "";
  phoneNumber = "";
  alternatePhoneNumber = "";
  regionId = "";
  countryId = "";
  cityId = "";
  detailedAddress = "";
  preferredLanguage = "Arabic";
}

export class ChangeCustomerStatusDto {
  status: "Active" | "Inactive" | "Suspended" = "Active";
  reason?: string;
}
