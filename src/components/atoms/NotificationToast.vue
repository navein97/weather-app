<template>
  <div
    v-if="show"
    class="notification"
    :class="type"
  >
    {{ message }}
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  message: string
  type: 'success' | 'error'
  show: boolean
}>()

const emit = defineEmits(['close'])

watch(() => props.show, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      emit('close')
    }, 3000)
  }
})
</script>

<style scoped>
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.success {
  background-color: #10B981;
}

.error {
  background-color: #EF4444;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
</style>
