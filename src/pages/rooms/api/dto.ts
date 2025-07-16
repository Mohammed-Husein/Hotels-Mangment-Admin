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
/* *    const formattedRooms = roomsWithBookingInfo.map(room => ({
        id: room._id,
        nameAr: room.name?.ar,
        nameEn: room.name?.en,
        hotelName: room.hotel?.name?.ar || room.hotel?.name?.en || 'غير محدد',
        type: room.type,
        numberRoom: room.numberRoom,
        isBooked: room.activeBooking ? true : false,
        currentBooking: room.activeBooking ? {
            customerName: room.activeBooking.customerName,
            checkInDate: room.activeBooking.checkInDate,
            checkOutDate: room.activeBooking.checkOutDate,
            paymentMethodName: room.activeBooking.paymentMethodName
        } : null,
        futureBookings: room.futureBookings || [],
        bookedDates: room.futureBookings?.map(booking => ({
            from: booking.checkInDate,
            to: booking.checkOutDate,
            status: booking.status,
            customerName: booking.customerName
        })) || [],
        pricePerNight: room.price || 0,
        images: room.images || [],
        services: room.services ? Object.fromEntries(room.services) : {},
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
    }));
 */
