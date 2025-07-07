export const useMemoryOptimization = () => {
  // تتبع المراجع والمؤقتات
  const timers = new Set<NodeJS.Timeout>();
  const intervals = new Set<NodeJS.Timeout>();
  const observers = new Set<any>();
  const eventListeners = new Set<{ element: EventTarget; event: string; handler: EventListener }>();

  // إدارة المؤقتات
  const createTimeout = (callback: () => void, delay: number): NodeJS.Timeout => {
    const timer = setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  };

  const createInterval = (callback: () => void, delay: number): NodeJS.Timeout => {
    const interval = setInterval(callback, delay);
    intervals.add(interval);
    return interval;
  };

  const clearAllTimers = () => {
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
    
    intervals.forEach(interval => clearInterval(interval));
    intervals.clear();
  };

  // إدارة المراقبين
  const addObserver = (observer: any) => {
    observers.add(observer);
    return observer;
  };

  const clearAllObservers = () => {
    observers.forEach(observer => {
      if (observer.disconnect) observer.disconnect();
      if (observer.unobserve) observer.unobserve();
      if (observer.destroy) observer.destroy();
    });
    observers.clear();
  };

  // إدارة مستمعي الأحداث
  const addEventListener = (
    element: EventTarget, 
    event: string, 
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ) => {
    element.addEventListener(event, handler, options);
    eventListeners.add({ element, event, handler });
  };

  const clearAllEventListeners = () => {
    eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    eventListeners.clear();
  };

  // تنظيف شامل
  const cleanup = () => {
    clearAllTimers();
    clearAllObservers();
    clearAllEventListeners();
  };

  // تنظيف تلقائي عند إلغاء تحميل المكون
  onBeforeUnmount(() => {
    cleanup();
  });

  return {
    createTimeout,
    createInterval,
    addObserver,
    addEventListener,
    clearAllTimers,
    clearAllObservers,
    clearAllEventListeners,
    cleanup
  };
};

// Composable لتحسين الأداء
export const usePerformanceOptimization = () => {
  // Debounce function
  const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Throttle function
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Lazy loading للبيانات
  const useLazyData = <T>(
    fetcher: () => Promise<T>,
    dependencies: Ref<any>[] = []
  ) => {
    const data = ref<T | null>(null);
    const loading = ref(false);
    const error = ref<Error | null>(null);

    const fetch = async () => {
      if (loading.value) return;
      
      try {
        loading.value = true;
        error.value = null;
        data.value = await fetcher();
      } catch (err) {
        error.value = err as Error;
      } finally {
        loading.value = false;
      }
    };

    // مراقبة التبعيات
    if (dependencies.length > 0) {
      watchEffect(() => {
        dependencies.forEach(dep => dep.value); // تتبع التبعيات
        fetch();
      });
    }

    return {
      data: readonly(data),
      loading: readonly(loading),
      error: readonly(error),
      fetch
    };
  };

  // Virtual scrolling helper
  const useVirtualList = <T>(
    items: Ref<T[]>,
    itemHeight: number,
    containerHeight: number
  ) => {
    const scrollTop = ref(0);
    
    const visibleItems = computed(() => {
      const start = Math.floor(scrollTop.value / itemHeight);
      const end = Math.min(
        start + Math.ceil(containerHeight / itemHeight) + 1,
        items.value.length
      );
      
      return {
        start,
        end,
        items: items.value.slice(start, end),
        offsetY: start * itemHeight,
        totalHeight: items.value.length * itemHeight
      };
    });

    const onScroll = (event: Event) => {
      const target = event.target as HTMLElement;
      scrollTop.value = target.scrollTop;
    };

    return {
      visibleItems,
      onScroll
    };
  };

  return {
    debounce,
    throttle,
    useLazyData,
    useVirtualList
  };
};
