<template>
  <button
    :class="['btn', type === 'secondary' ? 'btn-secondary' : 'btn-primary']"
    @click="$emit('click')"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
const props = defineProps({
  label: String,
  type: { type: String, default: 'primary' },
})
</script>
