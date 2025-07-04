<script setup lang="ts">
interface Props {
  modelValue: number;
  totalPages: number;
}

const props = defineProps<Props>();
const { modelValue, totalPages } = toRefs(props);
const pageIndex = ref(modelValue.value);
const emit = defineEmits(["update:modelValue"]);

const next = () => {
  if (pageIndex.value < totalPages.value) {
    pageIndex.value++;
    emit("update:modelValue", pageIndex.value);
  }
};

const prev = () => {
  if (pageIndex.value > 1) {
    pageIndex.value--;
    emit("update:modelValue", pageIndex.value);
  }
};

watch(modelValue, (value) => {
  pageIndex.value = value;
});
</script>

<template>
  <div class="flex justify-center items-center w-full mt-2 gap-5">
    <VBtn
      variant="tonal"
      rounded="md"
      size="2.5rem"
      color="primary"
      icon="mdi-caret"
      :disabled="pageIndex === 1"
      class="rotate-90"
      @click="prev"
    />

    <div class="font-bold text-xl flex text-primary">
      <span>{{ totalPages }}</span>
      <span>/</span>
      <span>{{ pageIndex }}</span>
    </div>

    <VBtn
      variant="tonal"
      rounded="md"
      size="2.5rem"
      :disabled="pageIndex === totalPages"
      color="primary"
      icon="mdi-caret"
      class="-rotate-90"
      @click="next"
    />
  </div>
</template>
