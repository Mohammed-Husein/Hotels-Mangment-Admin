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
