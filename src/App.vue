<script setup lang="ts">
import ScrollToTop from "@core/components/ScrollToTop.vue";
import initCore from "@core/initCore";
import { initConfigStore, useConfigStore } from "@core/stores/config";
import { hexToRgb } from "@layouts/utils";
import { useTheme } from "vuetify";
import { useAuth } from "./@core/composable/useAuth";
import { useAppStore } from "./stores/App";

const appStore = useAppStore();
const { locale } = useI18n();
const { GetAccessToken } = useAuth();
const { global } = useTheme();
const useAuStore = useAuth();
const userRole = useAuStore.GetUserRoles();
const isReRendered = ref(false);
// ℹ️ Sync current theme with initial loader theme
initCore();
initConfigStore();

const configStore = useConfigStore();
</script>

<template>
  <VLocaleProvider :rtl="configStore.isAppRTL">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp
      :style="`--v-global-theme-primary: ${hexToRgb(
        global.current.value.colors.primary
      )}`"
    >
      <RouterView />

      <ScrollToTop />
    </VApp>
  </VLocaleProvider>
</template>
