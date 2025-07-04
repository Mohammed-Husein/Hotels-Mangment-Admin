<script setup lang="ts">
const shortcuts = [
  {
    icon: "tabler-calendar",
    title: "طلبيات",
    subtitle: "إضافة طلبية",
    to: "/orders/components/AddOrder",
  },
  {
    icon: "tabler-file",
    title: "منتجات",
    subtitle: "إضافة منتج",
    to: "products/components/AddProduct",
  },
  {
    icon: "tabler-user",
    title: "الأصناف",
    subtitle: "إضافة صنف",
    to: "categories",
  },
  {
    icon: "tabler-lock",
    title: "المستخدمين",
    subtitle: "إضافة مستخدم",
    to: "employee/components/AddEmployee",
  },
];
</script>

<template>
  <Shortcuts :shortcuts="shortcuts" />
</template>
