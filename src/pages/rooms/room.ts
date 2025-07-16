import { useApi, usePagination } from "@/composables";
import { FilterRoomDto, GetAllRooms } from "./api/dto";
import { ROOM_API } from "./api/endpoint";

export const useRoomsStore = defineStore("room", () => {
  const { GET, POST, DELETE } = useApi();
  // pagination
  const createPagination = (page?: number) => {
    const { pagination } = usePagination(page || 8);
    return pagination;
  };

  const RoomList = ref<GetAllRooms["rooms"]>([]);
  const paginationRoom = createPagination();
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
  return {
    GetAllRooms,
    RoomList,
    paginationRoom,
  };
});
