export class filterCountryDto {
  isActive: null | boolean = null;
  searchFields: null | string = null;
  SortOrder: null | string = null;
  SortColumn: null | string = null;
}
export class GetAllCountry {
  count = 0;
  countries: countries[] = [];
}
export class countries {
  id: null | string = null;
  name: null | string = null;
  code: null | string = null;
  numberOfCities: null | string = null;
}
export class AddCountry {
  id: string | null = null;
  name: { ar: string; en: string } = { ar: "", en: "" };
  code: string = "";
  phoneCode: string = "";
  currency: {
    code: string;
    name: { ar: string; en: string };
    symbol: string;
  } = {
    code: "",
    name: { ar: "", en: "" },
    symbol: "",
  };
}

// DTOs للمدن (المحافظات)
export class filterCityDto {
  isActive: null | boolean = null;
  searchFields: null | string = null;
  SortOrder: null | string = null;
  SortColumn: null | string = null;
  countryId: null | string = null;
}

export class GetAllCities {
  count = 0;
  cities: cities[] = [];
}

export class cities {
  id: null | string = null;
  name: null | string = null;
  countryName: null | string = null;
  numberOfRegions: null | number = null;
  isActive: boolean = true;
}

export class AddCity {
  id: string | null = null;
  name: { ar: string; en: string } = { ar: "", en: "" };
  countryId: string = "";
  isActive: boolean = true;
}

// DTOs للمناطق
export class filterRegionDto {
  isActive: null | boolean = null;
  searchFields: null | string = null;
  SortOrder: null | string = null;
  SortColumn: null | string = null;
  countryId: null | string = null;
  governorateId: null | string = null;
}

export class GetAllRegions {
  count = 0;
  regions: regions[] = [];
}

export class regions {
  id: null | string = null;
  name: null | string = null;
  cityName: null | string = null;
  countryName: null | string = null;
  isActive: boolean = true;
}

export class AddRegion {
  id: string | null = null;
  name: { ar: string; en: string } = { ar: "", en: "" };
  governorateId: string = "";
  countryId: string = "";
  isActive: boolean = true;
}

// DTOs لطرق الدفع
export class filterPaymentMethodDto {
  isActive: null | boolean = null;
  searchFields: null | string = null;
  SortOrder: null | string = null;
  SortColumn: null | string = null;
}

export class GetAllPaymentMethods {
  count = 0;
  paymentMethods: paymentMethods[] = [];
}

export class paymentMethods {
  id: null | string = null;
  name: { ar: string; en: string } = { ar: "", en: "" };
  code: null | string = null;
  description: { ar: string; en: string } = { ar: "", en: "" };
  icon: null | string = null;
  isActive: boolean = true;
  displayOrder: number = 0;
  metadata: any = {};
}

export class AddPaymentMethod {
  id: string | null = null;
  nameAr: string = "";
  nameEn: string = "";
  code: string = "";
  descriptionAr: string = "";
  descriptionEn: string = "";
  displayOrder: number = 0;
  isActive: boolean = true;
  icon: File | null | string = "";
}
