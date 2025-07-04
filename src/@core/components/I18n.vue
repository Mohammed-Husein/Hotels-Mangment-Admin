<script setup lang="ts">
import type { I18nLanguage } from "@layouts/types";

interface Props {
  languages: I18nLanguage[];
  location?: any;
}

const props = withDefaults(defineProps<Props>(), {
  location: "bottom end",
});

const { locale } = useI18n({ useScope: "global" });
</script>

<template>
  <IconBtn>
    <!-- <VIcon
      size="26"
      icon="tabler-language"
    /> -->
    <div
      class="flex items-center"
      :class="locale == 'en' ? 'mr-2' : 'ml-2'"
      variant="text"
    >
      <!-- {{ t('global.language') }}  -->
      <img
        v-if="locale == 'en'"
        alt=""
        width="36"
        height="36"
        class="rounded-full object-cover"
        src="../../assets/images/images1.png"
      />
      <img
        v-if="locale == 'ar'"
        alt=""
        width="36"
        height="36"
        class="rounded-full object-cover"
        src="../../assets/images/image3.png"
      />
      <!-- <img
    v-if="locale == 'ku'"
      alt=""
      width="36"
      height="36"
      class="rounded-full object-cover"
      src="../../assets/images/images.png"
    /> -->
    </div>
    <!-- Menu -->
    <VMenu activator="parent" :location="props.location" offset="14px">
      <!-- List -->
      <VList :selected="[locale]" color="primary" min-width="175px">
        <!-- List item -->
        <VListItem
          v-for="lang in props.languages"
          :key="lang.i18nLang"
          :value="lang.i18nLang"
          @click="locale = lang.i18nLang"
        >
          <!-- Language label -->
          <VListItemTitle>{{ lang.label }}</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
  </IconBtn>
</template>
