<script setup lang="ts">
import { useRoleStore } from "@/pages/role/Role";

const props = defineProps<PropsType>();
const { roleDto } = storeToRefs(useRoleStore());
interface PropsType {
  permissions: any[];
}
const { t, locale } = useI18n();

const tableHeads = ref(["الأقسام"]);
const permissionLabels: { [key: string]: string } = {
  // BotMessage permissions
  "BotMessage.Get": "قراءة",
  "BotMessage.Add": "إضافة",
  "BotMessage.Modify": "تعديل",
  "BotMessage.Delete": "حذف",
  "BotMessage.UndoDeletion": "تراجع",

  // ActivityHistory permissions
  "ActivityHistory.Get": "قراءة",

  // Branch permissions
  "Branch.Get": "قراءة",
  "Branch.Add": "إضافة",
  "Branch.Modify": "تعديل",
  "Branch.Delete": "حذف",
  "Branch.UndoDeletion": "تراجع",

  // ContactUs permissions
  "ContactUs.Get": "قراءة",
  "ContactUs.Modify": "تعديل",
  "ContactUs.Delete": "حذف",
  "ContactUs.UndoDeletion": "تراجع",

  // Container permissions
  "Container.Get": "قراءة",
  "Container.Add": "إضافة",
  "Container.Modify": "تعديل",
  "Container.Delete": "حذف",
  "Container.UndoDeletion": "تراجع",

  // ContainerType permissions
  "ContainerType.Get": "قراءة",
  "ContainerType.Add": "إضافة",
  "ContainerType.Modify": "تعديل",
  "ContainerType.Delete": "حذف",
  "ContainerType.UndoDeletion": "تراجع",

  // Customer permissions
  "Customer.Get": "قراءة",
  "Customer.Add": "إضافة",
  "Customer.Modify": "تعديل",
  "Customer.Delete": "حذف",
  "Customer.UndoDeletion": "تراجع",

  // Employee permissions
  "Employee.Get": "قراءة",
  "Employee.Add": "إضافة",
  "Employee.Modify": "تعديل",
  "Employee.Delete": "حذف",
  "Employee.UndoDeletion": "تراجع",

  // ExShipment permissions
  "ExShipment.Get": "قراءة",
  "ExShipment.Add": "إضافة",
  "ExShipment.Modify": "تعديل",
  "ExShipment.Delete": "حذف",
  "ExShipment.UndoDeletion": "تراجع",

  // GeneralSearch permissions
  "GeneralSearch.Get": "قراءة",
  "GeneralSearch.Add": "إضافة",
  "GeneralSearch.Modify": "تعديل",
  "GeneralSearch.Delete": "حذف",
  "GeneralSearch.UndoDeletion": "تراجع",

  // Report permissions
  "Report.Get": "قراءة",
  "Report.Add": "إضافة",
  "Report.Modify": "تعديل",
  "Report.Delete": "حذف",
  "Report.UndoDeletion": "تراجع",

  // Setting permissions
  "Setting.Get": "قراءة",
  "Setting.Add": "إضافة",
  "Setting.Modify": "تعديل",
  "Setting.Delete": "حذف",
  "Setting.UndoDeletion": "تراجع",

  // Shipment permissions
  "Shipment.Get": "قراءة",
  "Shipment.Add": "إضافة",
  "Shipment.Modify": "تعديل",
  "Shipment.Delete": "حذف",
  "Shipment.UndoDeletion": "تراجع",

  // UpdateCloseUndoCloseShipment permissions
  "UpdateCloseUndoCloseShipment.Get": "قراءة",
  "UpdateCloseUndoCloseShipment.Modify": "تعديل",

  // Notification permissions
  "Notification.Get": "قراءة",
  "Notification.Add": "إضافة",
  "Notification.Modify": "تعديل",
  "Notification.Delete": "حذف",
  "Notification.UndoDeletion": "تراجع",
  "Notification.Read": "قراءة",

  // Order permissions
  "Order.Get": "قراءة",
  "Order.Add": "إضافة",
  "Order.Modify": "تعديل",
  "Order.Delete": "حذف",
  "Order.UndoDeletion": "تراجع",

  // PriceOffer permissions
  "PriceOffer.Get": "قراءة",
  "PriceOffer.Modify": "تعديل",
  "PriceOffer.Delete": "حذف",
  "PriceOffer.UndoDeletion": "تراجع",

  // Role permissions
  "Role.Get": "قراءة",
  "Role.Add": "إضافة",
  "Role.Modify": "تعديل",
  "Role.Delete": "حذف",

  // Trip permissions
  "Trip.Get": "قراءة",
  "Trip.Add": "إضافة",
  "Trip.Modify": "تعديل",
  "Trip.Delete": "حذف",
  "Trip.UndoDeletion": "تراجع",

  // Warehouse permissions
  "Warehouse.Get": "قراءة",
  "Warehouse.Add": "إضافة",
  "Warehouse.Modify": "تعديل",
  "Warehouse.Delete": "حذف",
  "Warehouse.UndoDeletion": "تراجع",

  // Warehouse permissions
  "Manger.Get": "قراءة",
  "Manger.Add": "إضافة",
  "Manger.Modify": "تعديل",
  "Manger.Delete": "حذف",
  "Manger.UndoDeletion": "تراجع",
  // Users permissions
  "User.Get": "قراءة",
  "User.Add": "إضافة",
  "User.Modify": "تعديل",
  "User.Delete": "حذف",
  "User.UndoDeletion": "تراجع",
  // categores permissions
  "Category.Get": "قراءة",
  "Category.Add": "إضافة",
  "Category.Modify": "تعديل",
  "Category.Delete": "حذف",
  "Category.UndoDeletion": "تراجع",
  // Product permissions
  "Product.Get": "قراءة",
  "Product.Add": "إضافة",
  "Product.Modify": "تعديل",
  "Product.Delete": "حذف",
  "Product.UndoDeletion": "تراجع",
  // InventoryManagment permissions
  "InventoryManagment.Get": "قراءة",
  "InventoryManagment.Add": "إضافة",
  "InventoryManagment.Modify": "تعديل",
  "InventoryManagment.Delete": "حذف",
  "InventoryManagment.UndoDeletion": "تراجع",
};


// Arabic translation for section names
const sectionNames: { [key: string]: string } = {
  Order:'الطلبيات',
  Manger:'مدير النظام',
  Category:'الاصناف ',
  Product:'المنتجات ',
  Warehouse:"إدارة المستودعات",
  Container: t('role.Container'),
  Trip: t('role.Trip'),
  Shipment: t('role.Shipment'),
  UpdateCloseUndoCloseShipment:t('role.update'),
  ExShipment: t('role.exShipment'),
  Customer: t('role.Customer'),
  Employee: t('role.Employee'),
  ActivityHistory:t('role.ActivityHistory'),
  Notification: "الاشعارات",
  PriceOffer: t('role.price'),
  ContactUs: t('role.conatct'),
  Setting: 'الاعدادات',
  Role: t('role.roless'),
  Branch: t('role.Branch'),
  InventoryManagment: 'ادارة المخزون',
  User: 'المستخدمين ',
  // BotMessage: "الرسائل التلقائية",
  // ContainerType: "أنواع الحاويات",
  // GeneralSearch: "البحث العام",
  // Report: "التقارير",
  // Add more translations as needed...
};

const isSelectAll = ref(false);
const isIndeterminate = ref(false);

const updateIndeterminate = () => {
  const selectedCount = props.permissions
    .flatMap((item) => item.permissions)
    .filter((p) => p.isSelected).length;
  const totalCount = props.permissions.flatMap(
    (item) => item.permissions
  ).length;

  isIndeterminate.value = selectedCount > 0 && selectedCount < totalCount;
  isSelectAll.value = selectedCount === totalCount;
};

const toggleSelectAll = () => {
  const newValue = isSelectAll.value;

  if (newValue) {
    // Add all permissions to roleDto.permissions
    roleDto.value.permissions = props.permissions.flatMap((item) =>
      item.permissions
        .filter((permission) => permission.isSelected || newValue)
        .map((permission) => permission.name)
    );
  } else {
    // Clear all permissions from roleDto.permissions
    roleDto.value.permissions = [];
  }

  props.permissions.forEach((item) => {
    item.permissions.forEach((permission) => {
      permission.isSelected = newValue;
    });
  });
};

</script>
<template>
  <table class="w-full">
    <thead>
      <tr>
        <td><h4>الاقسام</h4></td>
        <td><h4></h4></td>
        <td colspan="5">
          <div class="flex justify-end">
            <label class="mt-3 mx-1">تحديد الكل</label>
            <VCheckbox
              v-model="isSelectAll"
              v-model:indeterminate="isIndeterminate"
              @change="toggleSelectAll"
              class="mt-1"
            />
          </div>
        </td>
      </tr>
    </thead>
    <tbody>
      <template v-for="(item, index) in props.permissions" :key="item.name">
        <!-- Main row for permissions -->
        <tr >
          <td class="w-25 px-1">
            {{ sectionNames[item.name] || item.name }}
          </td>
          
          <td
            v-for="permission in item.permissions"
            :key="permission.name"
            class="w-20"
          >
            <span
              v-if="permission.name && permissionLabels[permission.name]"
              class="flex items-center"
            >
              <label class="ml-2">{{ permissionLabels[permission.name] }}</label>
              <VCheckbox v-model="roleDto.permissions" :value="permission.name" />
            </span>
          </td>
        </tr>

        <!-- Divider row -->
        <tr v-if="index !== props.permissions.length - 1">
          <td colspan="7">
            <VDivider />
          </td>
        </tr>
      </template>
    </tbody>
  </table>
</template>
