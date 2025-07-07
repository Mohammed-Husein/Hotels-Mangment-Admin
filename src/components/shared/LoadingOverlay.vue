<template>
  <div 
    v-if="show" 
    class="loading-overlay"
    :class="{ 'loading-overlay--fullscreen': fullscreen }"
  >
    <div class="loading-content">
      <VProgressCircular
        :indeterminate="!progress"
        :model-value="progress"
        :size="size"
        :width="width"
        :color="color"
        class="mb-4"
      />
      
      <div v-if="title" class="loading-title">
        {{ title }}
      </div>
      
      <div v-if="subtitle" class="loading-subtitle">
        {{ subtitle }}
      </div>
      
      <div v-if="progress && showPercentage" class="loading-percentage">
        {{ Math.round(progress) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
  title?: string;
  subtitle?: string;
  progress?: number;
  showPercentage?: boolean;
  fullscreen?: boolean;
  size?: number | string;
  width?: number | string;
  color?: string;
}

withDefaults(defineProps<Props>(), {
  title: '',
  subtitle: '',
  progress: undefined,
  showPercentage: false,
  fullscreen: false,
  size: 64,
  width: 4,
  color: 'primary'
});
</script>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.loading-overlay--fullscreen {
  position: fixed;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  max-width: 300px;
}

.loading-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 0.5rem;
}

.loading-subtitle {
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
  margin-bottom: 1rem;
}

.loading-percentage {
  font-size: 1rem;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  margin-top: 0.5rem;
}
</style>
