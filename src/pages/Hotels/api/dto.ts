export class GetAllHotelsDto {
  count = 0;
  hotels: Hotel[] = [];
}

export class Hotel {
  id = "";
  name = {
    ar: "",
    en: ""
  };
  type = "";
  stars = 1;
  country = "";
  countryName = "";
  governorate = "";
  governorateName = "";
  region = "";
  regionName = "";
  address = {
    ar: "",
    en: ""
  };
  description = {
    ar: "",
    en: ""
  };
  location = {
    type: "Point",
    coordinates: [0, 0]
  };
  images: string[] = [];
  amenities: string[] = [];
  policies = {
    checkIn: "14:00",
    checkOut: "12:00",
    cancellationPolicy: {
      ar: "",
      en: ""
    },
    petPolicy: {
      ar: "",
      en: ""
    },
    smokingPolicy: {
      ar: "",
      en: ""
    }
  };
  contactInfo = {
    website: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: ""
    }
  };
  isActive = true;
  rating = {
    average: 0,
    count: 0
  };
  owner = "";
  createdByEmployee = "";
  createdByEmployeeName = "";
  updatedByEmployee = "";
  roomsCount = 0;
  createdAt = "";
  updatedAt = "";
}

export class HotelFiltersDto {
  search: null | string = null;
  isActive: null | boolean = null;
  countryId: null | string = null;
  governorateId: null | string = null;
  cityId: null | string = null;
  regionId: null | string = null;
  sortOrder: null | string = null;
  sortBy: null | string = null;
}

export class AddHotelDto {
  nameAr = "";
  nameEn = "";
  type = "فندق";
  stars = 1;
  countryId = "";
  governorateId = "";
  regionId = "";
  addressAr = "";
  addressEn = "";
  descriptionAr = "";
  descriptionEn = "";
  longitude = 0;
  latitude = 0;
  amenities: string[] = [];
  website = "";
  facebook = "";
  instagram = "";
  twitter = "";
  checkIn = "14:00";
  checkOut = "12:00";
  cancellationPolicyAr = "";
  cancellationPolicyEn = "";
  petPolicyAr = "";
  petPolicyEn = "";
  smokingPolicyAr = "";
  smokingPolicyEn = "";
  isActive = true;
}

export class DetailsHotelDto {
  id = "";
  name = {
    ar: "",
    en: ""
  };
  type = "";
  stars = 1;
  country = "";
  countryName = "";
  governorate = "";
  governorateName = "";
  region = "";
  regionName = "";
  address = {
    ar: "",
    en: ""
  };
  description = {
    ar: "",
    en: ""
  };
  location = {
    type: "Point",
    coordinates: [0, 0]
  };
  images: string[] = [];
  amenities: string[] = [];
  policies = {
    checkIn: "14:00",
    checkOut: "12:00",
    cancellationPolicy: {
      ar: "",
      en: ""
    },
    petPolicy: {
      ar: "",
      en: ""
    },
    smokingPolicy: {
      ar: "",
      en: ""
    }
  };
  contactInfo = {
    website: "",
    socialMedia: {
      facebook: "",
      instagram: "",
      twitter: ""
    }
  };
  isActive = true;
  rating = {
    average: 0,
    count: 0
  };
  owner = "";
  createdByEmployee = "";
  createdByEmployeeName = "";
  updatedByEmployee = "";
  roomsCount = 0;
  createdAt = "";
  updatedAt = "";
}

export class ModifyHotelDto {
  id = "";
  nameAr = "";
  nameEn = "";
  type = "فندق";
  stars = 1;
  countryId = "";
  governorateId = "";
  cityId = "";
  regionId = "";
  addressAr = "";
  addressEn = "";
  descriptionAr = "";
  descriptionEn = "";
  longitude = 0;
  latitude = 0;
  amenities: string[] = [];
  website = "";
  facebook = "";
  instagram = "";
  twitter = "";
  checkIn = "14:00";
  checkOut = "12:00";
  cancellationPolicyAr = "";
  cancellationPolicyEn = "";
  petPolicyAr = "";
  petPolicyEn = "";
  smokingPolicyAr = "";
  smokingPolicyEn = "";
  isActive = true;
}
