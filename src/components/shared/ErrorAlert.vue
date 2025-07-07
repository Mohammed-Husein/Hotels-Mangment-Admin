<template>
  <VAlert
    v-if="show && errorMessage"
    :type="type"
    :variant="variant"
    :closable="closable"
    :icon="icon"
    class="error-alert"
    @click:close="handleClose"
  >
    <template #title>
      <span class="error-title">{{ title }}</span>
    </template>
    
    <div class="error-content">
      <p class="error-message">{{ errorMessage }}</p>
      
      <div v-if="details" class="error-details">
        <VBtn
          variant="text"
          size="small"
          @click="showDetails = !showDetails"
        >
          {{ showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل' }}
          <VIcon :icon="showDetails ? 'tabler-chevron-up' : 'tabler-chevron-down'" />
        </VBtn>
        
        <VExpandTransition>
          <div v-show="showDetails" class="details-content">
            <pre>{{ details }}</pre>
          </div>
        </VExpandTransition>
      </div>
      
      <div v-if="actions && actions.length > 0" class="error-actions">
        <VBtn
          v-for="action in actions"
          :key="action.text"
          :variant="action.variant || 'text'"
          :color="action.color || 'primary'"
          :size="action.size || 'small'"
          @click="action.handler"
        >
          <VIcon v-if="action.icon" :icon="action.icon" class="mr-1" />
          {{ action.text }}
        </VBtn>
      </div>
    </div>
  </VAlert>
</template>

<script setup lang="ts">
interface ErrorAction {
  text: string;
  handler: () => void;
  icon?: string;
  variant?: string;
  color?: string;
  size?: string;
}

interface Props {
  show: boolean;
  errorMessage?: string;
  title?: string;
  details?: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  variant?: 'flat' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'plain';
  closable?: boolean;
  icon?: string;
  actions?: ErrorAction[];
  autoHide?: boolean;
  autoHideDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: '',
  title: 'خطأ',
  details: '',
  type: 'error',
  variant: 'tonal',
  closable: true,
  icon: 'tabler-alert-circle',
  actions: () => [],
  autoHide: false,
  autoHideDelay: 5000
});

const emit = defineEmits<{
  close: [];
  'update:show': [value: boolean];
}>();

const showDetails = ref(false);

const handleClose = () => {
  emit('close');
  emit('update:show', false);
};

// Auto hide functionality
if (props.autoHide && props.autoHideDelay > 0) {
  setTimeout(() => {
    if (props.show) {
      handleClose();
    }
  }, props.autoHideDelay);
}
</script>

<style scoped>
.error-alert {
  margin-bottom: 1rem;
}

.error-title {
  font-weight: 600;
}

.error-content {
  margin-top: 0.5rem;
}

.error-message {
  margin-bottom: 1rem;
  line-height: 1.5;
}

.error-details {
  margin-top: 1rem;
}

.details-content {
  margin-top: 0.5rem;
  padding: 1rem;
  background: rgba(var(--v-theme-surface-variant), 0.1);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.details-content pre {
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  color: rgb(var(--v-theme-on-surface-variant));
}

.error-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
</style>
