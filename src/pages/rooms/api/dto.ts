export class FilterRoomDto {
  hotelId: null | string = null;
  type: null | string = null;
  status: null | string = null;
  search: null | string = null;
  sortOrder: null | string = null;
  sortBy: null | string = null;
  limit: null | string = null;
  page: null | string = null;
}
export class GetAllRooms {
  count = 0;
  rooms: rooms[] = [];
}
export class rooms {
  id: null | string = null;
  nameAr: null | string = null;
  nameEn: null | string = null;
  hotelName: null | string = null;
  type: null | string = null;
  numberRoom: null | string = null;
  isBooked: null | string = null;
  currentBooking: null | string = null;
  futureBookings: null | string = null;
  bookedDates: null | string = null;
  pricePerNight: null | string = null;
  images: null | File = null;
  services: null | File = null;
}
export class AddRoomDto {
  nameAr = "";
  nameEn = "";
  hotelId = "";
  type = "standard";
  numberRoom = "";
  price = 0;
  bedsCount = 1;
  description = "";
  services = new Map<string, string>();
  status = "Available";
  isAvailableForBooking = true;
  roomImages: File[] = [];
}

export class DetailsRoomDto {
  id = "";
  name = {
    ar: "",
    en: "",
  };
  hotel = {
    id: "",
    name: {
      ar: "",
      en: "",
    },
  };
  type = "";
  numberRoom = "";
  price = 0;
  bedsCount = 1;
  description = "";
  images: string[] = [];
  services = new Map<string, string>();
  status = "Available";
  isAvailableForBooking = true;
  futureBooking = {
    isBooked: false,
    bookedFrom: "",
    bookedTo: "",
    bookingNote: "",
  };
  createdAt = "";
  updatedAt = "";
}

export class ModifyRoomDto {
  id = "";
  nameAr = "";
  nameEn = "";
  hotelId = "";
  type = "standard";
  numberRoom = "";
  price = 0;
  bedsCount = 1;
  description = "";
  services = new Map<string, string>();
  status = "Available";
  isAvailableForBooking = true;
  roomImages: File[] = [];
}
