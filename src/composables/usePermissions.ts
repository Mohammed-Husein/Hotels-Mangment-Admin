import { useAuth } from "@/@core/composable/useAuth";

type PermissionType =
  | "EMPLOYEE"
  | "Warehouse"
  | "EcommerceCompany"
  | "CourierCompany"
  | "Driver"
  | "RtoReschedule"
  | "WarehouseOperation"
  | "Sla"
  | "Notification";

type PermissionAction = "Get" | "Modify" | "Add" | "Delete";

type Permission = {
  type: PermissionType;
  action: PermissionAction;
};

const usePermissions = () => {
  const { GetPermissions } = useAuth();

  const getpermission = (Permission: Permission): boolean => {
    return GetPermissions().includes(`${Permission.type}.${Permission.action}`);
  };

  return { getpermission };
};

export default usePermissions;
