<script setup lang="ts">
const props = defineProps(['modelValue', 'readonly'])

const emit = defineEmits(['update:modelValue'])

const rows = ref([['', '']])

const rowsCount = computed(() => rows.value.length)
const colsCount = computed(() => rows.value[0].length)

const appendRow = () => {
  const newCol = []
  for (let i = 0; i < colsCount.value; i++)
    newCol.push('')

  rows.value.push(newCol)
}

const appendCol = () => {
  if (colsCount.value < 4) {
    rows.value.forEach(col => {
      col.push('')
    })
    emit('update:modelValue', rows.value)
  }
}

onMounted(() => {
  rows.value = props.modelValue
})

watch(props.modelValue, (nv: string[][]) => {
  rows.value = nv
}, { deep: true })

watch(rows, nv => {
  if (nv)
    emit('update:modelValue', nv)
}, { deep: true })
</script>

<template>
  <div>
    <VBtn
      v-if="!readonly"
      @click="appendRow"
    >
      Add Row
    </VBtn>
    <VBtn
      v-if="!readonly"
      @click="appendCol"
    >
      Add Col {{ colsCount }}
    </VBtn>

    <div class="grid-wrapper tw-overflow-auto">
      <div
        v-for="(row, i) in rows"
        class="my-2"
      >
        <div
          :style="{ display: 'grid', gridTemplateColumns: `repeat(${colsCount} , 1fr)` }"
          class="tw-gap-3 "
        >
          <VTextField
            v-for="(col, j) in row"
            v-model="rows[i][j]"
            :readonly="readonly"
            variant="filled"
            color="primary"
            class="tw-min-w-[150px] "
            :class="{ 'tw-bg-primary tw-bg-opacity-30': i === 0 }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
