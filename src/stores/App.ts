import type { PageMeta } from "@/types/app/PageMeta";

export const useAppStore = defineStore("App", () => {
  const inputLang = ref("");

  const PageMeta = ref<PageMeta>({
    title: "",
    subTitle: "",
    icon: "",
    breadCrumb: [],
  });

  const isLoading = ref(false);

  function SetPageMeta(meta: PageMeta) {
    PageMeta.value = { ...meta };
  }

  const startupCalls = () =>
    Promise.all([
      // settingStore.GetAllAreas(),
      // settingStore.GetAllCities(),
      // settingStore.GetAllLabels(),
      // settingStore.GetCitiesWithArea(),
      // settingStore.GetAllShopCategories(),
      // notificationStore.GetUnRead(),
    ]);

  return { PageMeta, SetPageMeta, isLoading, startupCalls, inputLang };
});
