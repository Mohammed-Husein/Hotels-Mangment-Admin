import { useApi } from "@/composables";
import type { GetAllProfileDto } from "./api/dto";
import { ModifyPasswordDto, ModifyProfileDto } from "./api/dto";
import { PROFILE_API } from "./api/endpoint";

export const useProfileStore = defineStore("Profile", () => {
  const { GET, POST } = useApi();

  // lists
  const ProfileList = ref<GetAllProfileDto["Profile"]>([]);
  const ModifyMyProfileDto = ref<ModifyProfileDto>({
    ...new ModifyProfileDto(),
  });
  const ModifyMyPasswordDto = ref<ModifyPasswordDto>({
    ...new ModifyPasswordDto(),
  });

  // GetMyProfile
  async function GetMyProfile() {
    const response = await GET<GetAllProfileDto>(
      "employees/my-profile",
      {},
      {},
      {}
    );

    ProfileList.value = response.data?.data.employee;
  }

  // Modify My Profile
  async function ModifyMyProfile(payload: ModifyProfileDto) {
    const response = await POST(
      PROFILE_API.ModifyMyProfile,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    return response;
  }

  // Modify Password
  async function ModifyPassword(payload: ModifyPasswordDto) {
    const response = await POST(
      PROFILE_API.ModifyMyPassword,
      payload,
      { error: true, success: "تمت العملية بنجاح" },
      { formData: false }
    );

    return response;
  }

  return {
    GetMyProfile,
    ModifyMyProfile,
    ModifyPassword,
    ModifyMyProfileDto,
    ModifyMyPasswordDto,
    ProfileList,
  };
});
