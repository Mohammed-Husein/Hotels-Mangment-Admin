<script setup lang="ts">
import { PerfectScrollbar } from "vue3-perfect-scrollbar";

interface Shortcut {
  icon: string;
  title: string;
  subtitle: string;
  to: object | string;
}

interface Props {
  togglerIcon?: string;
  shortcuts: Shortcut[];
}

const props = withDefaults(defineProps<Props>(), {
  togglerIcon: "tabler-layout-grid-add",
});

const router = useRouter();
</script>

<template>
  <IconBtn>
    <VIcon size="26" :icon="props.togglerIcon" />

    <VMenu activator="parent" offset="14px" location="bottom end">
      <VCard width="340" max-height="560" class="d-flex flex-column">
        <VCardItem class="py-4">
          <VCardTitle>الإختصارات</VCardTitle>

          <template #append>
            <IconBtn>
              <VIcon icon="tabler-layout-grid-add" />
            </IconBtn>
          </template>
        </VCardItem>

        <VDivider />

        <PerfectScrollbar :options="{ wheelPropagation: false }">
          <VRow class="ma-0 mt-n1">
            <VCol
              v-for="(shortcut, index) in props.shortcuts"
              :key="shortcut.title"
              cols="6"
              class="text-center border-t cursor-pointer pa-4 shortcut-icon"
              :class="(index + 1) % 2 ? 'border-e' : ''"
              @click="router.push(shortcut.to)"
            >
              <VAvatar variant="tonal" size="48">
                <VIcon :icon="shortcut.icon" />
              </VAvatar>

              <h6 class="text-base font-weight-medium mt-2 mb-0">
                {{ shortcut.title }}
              </h6>
              <span class="text-sm">{{ shortcut.subtitle }}</span>
            </VCol>
          </VRow>
        </PerfectScrollbar>
      </VCard>
    </VMenu>
  </IconBtn>
</template>

<style lang="scss">
.shortcut-icon:hover {
  background-color: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
}
</style>
