export class FilterBookingDto {
  status: null | string = null;
  search: null | string = null;
  roomNumber: null | string = null;
  customerName: null | string = null;
}
export class GetAllBooking {
  count = 0;
  bookings: bookings[] = [];
}
export class bookings {
  id: null | string = null;
  bookingNumber: null | string = null;
  customerNumber: null | string = null;
  roomNumber: null | string = null;
  checkInDate: null | string = null;
  checkOutDate: null | string = null;
  numberOfNights: null | string = null;
  status: null | string = null;
  paymentMethod: null | string = null;
  totalAmount: null | string = null;
  discount: null | string = null;
}
