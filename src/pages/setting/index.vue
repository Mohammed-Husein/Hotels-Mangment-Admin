<script setup lang="ts">
import city from "./components/city.vue";
import country from "./components/country.vue";
import paymentMethod from "./components/paymentMethod.vue";
import region from "./components/region.vue";
</script>
<template>
  <h3>الإعدادات <VIcon>tabler-settings</VIcon></h3>
  <country />

  <!-- مكون المدن -->
  <div class="mt-5">
    <city />
  </div>

  <!-- مكون المناطق -->
  <div class="mt-5">
    <region />
  </div>

  <!-- مكون طرق الدفع -->
  <div class="mt-5">
    <paymentMethod />
  </div>

  <div class="grid grid-rows-2 grid-cols-12 gap-4 mt-5 same-height">
    <!-- <country />
    <city /> -->

    <!-- <country /> -->

    <!-- Grid container for equal-height components -->
    <div class="md:col-span-12 col-span-12 grid grid-cols-2 gap-4 equal-height">
      <!-- <country /> -->

      <!-- <quantityStyle /> -->
      <!-- <fillStyle /> -->
    </div>
    <div
      class="md:col-span-12 col-span-12 grid grid-cols-2 gap-4 equal-height"
    ></div>
    <coins class="col-span-12 different-height" />
  </div>
</template>

<style>
.equal-height {
  grid-auto-rows: 1fr; /* Makes all rows the same height */
}
/* .same-height {
  display: grid;
  grid-auto-rows: 1fr;
} */
/* .different-height {
  grid-row: span 2;
  height: 200px; 
} */
.custom-scrollbar ::-webkit-scrollbar {
  width: 11px;
  height: 11px;
}
.custom-scrollbar ::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 5px;
}
.custom-scrollbar ::-webkit-scrollbar-thumb {
  background-color: #1867c0;
  border-radius: 5px;
}
.custom-scrollbar ::-webkit-scrollbar-thumb:hover {
  background-color: #027cb4;
}
</style>
