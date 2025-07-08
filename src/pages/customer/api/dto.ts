export class GetAllCustomerDto {
  count = 0;
  customers: customer[] = [];
}
export class customer {
  id = "";
  firstName = "";
  lastName = "";
  phoneNumber = "";
  number = "";
  countryName = "";
  status = "";
}

export class CustomersFiltersDto {
  sortOrder = null as string | null;
  sortBy = null as string | null;
  search = null as string | null;
  status = null as string | null;
}

export class AddCustomerDto {
  fullName = "";
  company = "";
  phoneNumber = "";
}

export class DetailsCustomerDto {
  id = "";
  fullName = "";
  phoneNumber = "";
  company = "";
}
