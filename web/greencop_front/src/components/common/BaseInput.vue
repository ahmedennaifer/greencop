<template>
  <div>
    <label class="block font-semibold mb-1">{{ label }}</label>
    <input
      :placeholder="placeholder"
      class="input"
      v-model="internalValue"
      @input="$emit('update:modelValue', internalValue)"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  placeholder: String,
  modelValue: [String, Number],
})
const internalValue = ref(props.modelValue)
watch(() => props.modelValue, (newV) => internalValue.value = newV)
</script>
