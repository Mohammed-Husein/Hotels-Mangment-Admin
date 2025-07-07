export enum SETTING_API {
  GetAll = "countries",
  Add = "countries",
}

export enum CITY_API {
  GetAll = "governorates",
  Add = "governorates/upsert",
  Delete = "governorates",
}

export enum REGION_API {
  GetAll = "regions",
  Add = "regions",
  Update = "regions",
  Delete = "regions",
  GetCitiesByCountry = "regions/cities",
}

export enum PAYMENT_METHOD_API {
  GetAll = "payment-methods",
  Add = "payment-methods",
  Update = "payment-methods",
  Delete = "payment-methods",
  GetNames = "payment-methods/names",
}
