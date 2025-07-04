<script lang="ts" setup>
const emit = defineEmits(["update:modelValue"]);
const langs = ref([
  {
    label: "العربية",
    icon: "",
    value: "ar",
  },
  {
    label: "English",
    icon: "",
    value: "en",
  },
]);

function emitEvent(v: string) {
  emit("update:modelValue", v);
}
</script>

<template>
  <VSelect
    variant="plain"
    model-value="ar"
    class="w-44"
    prepend-icon="mdi-web"
    color="primary"
    item-title="label"
    :items="langs"
    item-value="value"
    @update:model-value="emitEvent"
  />
</template>
