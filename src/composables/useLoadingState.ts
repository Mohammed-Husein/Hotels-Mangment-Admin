export interface LoadingStates {
  [key: string]: Ref<boolean>;
}

export const useLoadingState = () => {
  const loadingStates = reactive<LoadingStates>({});

  // إنشاء حالة تحميل جديدة
  const createLoadingState = (key: string, initialValue = false): Ref<boolean> => {
    if (!loadingStates[key]) {
      loadingStates[key] = ref(initialValue);
    }
    return loadingStates[key];
  };

  // تعيين حالة التحميل
  const setLoading = (key: string, value: boolean) => {
    if (loadingStates[key]) {
      loadingStates[key].value = value;
    }
  };

  // الحصول على حالة التحميل
  const getLoading = (key: string): boolean => {
    return loadingStates[key]?.value || false;
  };

  // تنفيذ عملية مع إدارة حالة التحميل تلقائياً
  const withLoading = async <T>(
    key: string,
    operation: () => Promise<T>
  ): Promise<T> => {
    const loadingState = createLoadingState(key);
    
    try {
      loadingState.value = true;
      const result = await operation();
      return result;
    } finally {
      loadingState.value = false;
    }
  };

  // تنفيذ عدة عمليات مع إدارة حالة التحميل
  const withMultipleLoading = async <T>(
    keys: string[],
    operation: () => Promise<T>
  ): Promise<T> => {
    const loadingStates = keys.map(key => createLoadingState(key));
    
    try {
      loadingStates.forEach(state => state.value = true);
      const result = await operation();
      return result;
    } finally {
      loadingStates.forEach(state => state.value = false);
    }
  };

  // التحقق من وجود أي حالة تحميل نشطة
  const hasAnyLoading = computed(() => {
    return Object.values(loadingStates).some(state => state.value);
  });

  // التحقق من حالات تحميل محددة
  const hasLoadingStates = (keys: string[]): ComputedRef<boolean> => {
    return computed(() => {
      return keys.some(key => getLoading(key));
    });
  };

  // إعادة تعيين جميع حالات التحميل
  const resetAllLoading = () => {
    Object.values(loadingStates).forEach(state => {
      state.value = false;
    });
  };

  // إعادة تعيين حالات تحميل محددة
  const resetLoading = (keys: string[]) => {
    keys.forEach(key => {
      if (loadingStates[key]) {
        loadingStates[key].value = false;
      }
    });
  };

  return {
    loadingStates: readonly(loadingStates),
    createLoadingState,
    setLoading,
    getLoading,
    withLoading,
    withMultipleLoading,
    hasAnyLoading,
    hasLoadingStates,
    resetAllLoading,
    resetLoading
  };
};
