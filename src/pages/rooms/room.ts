import { useApi, usePagination } from "@/composables";
import type { AddRoomDto, FilterRoomDto, GetAllRooms } from "./api/dto";
import { ROOM_API } from "./api/endpoint";

export const useRoomsStore = defineStore("room", () => {
  const { GET, POST, DELETE, PUT } = useApi();
  // pagination
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);
    return pagination;
  };

  const RoomList = ref<GetAllRooms["rooms"]>([]);
  const RoomDetails = ref<any>([]);
  const paginationRoom = createPagination();
  const RommsByHotel = ref([]);
  // Get All Rooms
  async function GetAllRoomsByHotelId(hotelId: any) {
    const response = await GET<GetAllRooms>(
      `${ROOM_API.GetAllRoomsByHotelId}/${hotelId}`,
      {},
      {},
      {}
    );
    RommsByHotel.value = response.data?.data?.rooms;
  }
  async function GetAllRooms(Filters: FilterRoomDto) {
    const response = await GET<GetAllRooms>(
      ROOM_API.GetAll,
      {
        ...Filters,
        page: paginationRoom.value.currentPage,
        limit: paginationRoom.value.limit,
      },
      {},
      {}
    );

    RoomList.value = response.data?.data?.rooms || [];
    paginationRoom.value.totalCount = response.data?.data?.count || 0;
  }

  // Get Room Details
  async function GetRoomDetails(id: string) {
    const response = await GET<any>(`${ROOM_API.GetById}/${id}`);

    if (response.data && response.data.data && response.data.data.room) {
      RoomDetails.value = response.data.data.room;
    }
    return response;
  }

  // Add Room
  async function AddRoom(payload: AddRoomDto) {
    const response = await POST(
      ROOM_API.Add,
      payload,
      { error: true, success: "تمت إضافة الغرفة بنجاح" },
      { formData: true }
    );

    // Refresh the room list after adding
    if (response && response.success) {
      await GetAllRooms({} as FilterRoomDto);
    }

    return response;
  }

  // Modify Room
  async function ModifyRoom(id: string, payload: FormData) {
    const response = await POST(
      `${ROOM_API.Modify}/${id}`,
      payload,
      { error: true, success: "تم تحديث الغرفة بنجاح" },
      { formData: true }
    );

    // Refresh the room details and list after modification
    if (response && response.success) {
      await GetRoomDetails(id);
      await GetAllRooms({} as FilterRoomDto);
    }

    return response;
  }

  // Delete Room
  async function DeleteRoom(ids: string, itemName: string) {
    await DELETE(
      `${ROOM_API.Delete}/${ids}`,
      {},
      {},
      {
        comfirm: {
          title: "حذف",
          text: itemName
            ? `هل تريد بالتأكيد حذف الغرفة (${itemName})؟`
            : "هل تريد حذف الغرف المحددة؟",
          icon: "warning",
          confirmButtonText: "تأكيد",
          cancelButtonText: "إلغاء",
        },
        success: "تمت العملية بنجاح",
        error: true,
      }
    );
    RoomList.value = RoomList.value?.filter(
      (item: any) => !ids.includes(item.id)
    );
  }

  return {
    GetAllRooms,
    GetRoomDetails,
    AddRoom,
    ModifyRoom,
    DeleteRoom,
    RoomList,
    RoomDetails,
    paginationRoom,
    GetAllRoomsByHotelId,
    RommsByHotel,
  };
});
