export class FilterBookingDto {
  status: null | string = null;
  search: null | string = null;
  roomNumber: null | string = null;
  customerName: null | string = null;
  hotelId: null | string = null;
  checkInDate: null | string = null;
  checkOutDate: null | string = null;
  sortBy: null | string = null;
  sortOrder: null | string = null;
}
export class GetAllBooking {
  count = 0;
  bookings: bookings[] = [];
}
export class bookings {
  id: null | string = null;
  bookingNumber: null | string = null;
  customerName: null | string = null;
  roomNumber: null | string = null;
  checkInDate: null | string = null;
  checkOutDate: null | string = null;
  numberOfNights: null | number = null;
  status: null | string = null;
  paymentMethod: null | string = null;
  totalAmount: null | number = null;
  discount: null | number = null;
  createdAt: null | string = null;
}

export class AddBookingDto {
  customerId = "";
  roomId = "";
  checkInDate = "";
  checkOutDate = "";
  numberOfNights = 0;
  guestInfo = {
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    idNumber: "",
  };
  guestsCount = {
    adults: 1,
    children: 0,
    infants: 0,
  };
  totalAmount = 0;
  discount = 0;
  paymentMethodId = "";
  notes = "";
}

export class UpdateBookingDto {
  id = "";
  customerId = "";
  roomId = "";
  checkInDate = "";
  checkOutDate = "";
  numberOfNights = 0;
  guestInfo = {
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    idNumber: "",
  };
  guestsCount = {
    adults: 1,
    children: 0,
    infants: 0,
  };
  totalAmount = 0;
  discount = 0;
  paymentMethodId = "";
  status = "";
  notes = "";
}

export class BookingDetailsDto {
  id = "";
  bookingNumber = "";
  customer = {
    id: "",
    fullName: "",
    email: "",
    phoneNumber: "",
  };
  hotel = {
    id: "",
    name: {
      ar: "",
      en: "",
    },
  };
  room = {
    id: "",
    numberRoom: "",
    name: "",
    price: 0,
  };
  checkInDate = "";
  checkOutDate = "";
  numberOfNights = 0;
  guestInfo = {
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    idNumber: "",
  };
  guestsCount = {
    adults: 1,
    children: 0,
    infants: 0,
  };
  pricing = {
    roomBasePrice: 0,
    roomTotalPrice: 0,
    servicesTotalPrice: 0,
    subtotal: 0,
    discount: 0,
    totalAmount: 0,
    currency: "SYP",
  };
  payment = {
    paymentMethod: {
      id: "",
      name: "",
      code: "",
    },
    status: "",
    paidAmount: 0,
    remainingAmount: 0,
  };
  status = "";
  notes = {
    staff: "",
  };
  createdAt = "";
  updatedAt = "";
}
