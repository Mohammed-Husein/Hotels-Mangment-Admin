export class GetAllProfileDto {
  id = "";
  fullName = "";
  email = "";
  phoneNumber = "";
  roleId = "";
  role = "";
}

export class ModifyProfileDto {
  fullName = "";
  email = "";
  phoneNumber = "";
  image = "";
}

export class ModifyPasswordDto {
  oldPassword = "";
  newPassword = "";
  confirmPassword = "";
}
