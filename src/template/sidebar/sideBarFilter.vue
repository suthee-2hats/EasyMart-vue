
<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  options: {
    type: Array,
    required: true
  },
  modelValue: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <fieldset class="product-filters__group">
    <legend class="product-filters__group-title">
      {{ title }}
    </legend>

    <label
      v-for="option in options"
      :key="option.value"
      class="product-filter"
    >
      <input
        type="radio"
        :name="name"
        :value="option.value"
        :checked="modelValue === option.value"
        @change="emit('update:modelValue', option.value)"
      />

      <span
        class="product-filter__control"
        aria-hidden="true"
      ></span>

      <span class="product-filter__label">
        {{ option.label }}
      </span>
    </label>
  </fieldset>
</template>
<style scoped>
.product-filters__group {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: 0 0 16px;
    padding: 0;
    border: 0;
}

.product-filters__group:last-child {
    margin-bottom: 0;
}

.product-filters__group-title {
    margin: 0 0 8px;
    font-family: var(--font-family);
    font-size: 16px;
    font-weight: 700;
    color: #0d0c0d;
}

.product-filter {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    position: relative;
    width: 100%;
    min-height: 25px;
}

.product-filter input {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.product-filter__control {
    position: relative;
    width: 36px;
    height: 20px;
    flex: 0 0 36px;
    background: #e7e6e7;
    border-radius: 9999px;
    transition: background-color 0.2s ease;
}

.product-filter__control::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s ease;
}

.product-filter input:checked + .product-filter__control {
    background: #b6349a;
}

.product-filter input:checked + .product-filter__control::before {
    transform: translateX(16px);
}

.product-filter input:focus-visible + .product-filter__control {
    outline: 2px solid #b6349a;
    outline-offset: 2px;
}

.product-filter__label {
    min-width: 0;
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 400;
    line-height: 1.2;
    color: #0d0c0d;
}
</style>