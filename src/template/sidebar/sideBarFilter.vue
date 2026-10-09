
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

.product-filter {

    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;

    position: relative;
    width: 100%;
    min-height: 25px;

    input {
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

    
    &__control {
        position: relative;

        width: 36px;
        height: 20px;

        flex: 0 0 36px;

        background: #E7E6E7;
        border-radius: 9999px;

        transition: background-color 0.2s ease;

       
        &::before {
            content: "";

            position: absolute;
            top: 2px;
            left: 2px;

            width: 16px;
            height: 16px;

            background: #fff;
            border-radius: 50%;

            transition: transform 0.2s ease;
        }
    }

    input:checked + &__control {
        background: #B6349A;

        &::before {
            transform: translateX(16px);
        }
    }

    
    input:focus-visible + &__control {
        outline: 2px solid #B6349A;
        outline-offset: 2px;
    }

    &__label {
        min-width: 0;

       
        font-size: 8px;
        font-weight: 400;

        line-height: 1.2;

        color: #0d0c0d;
    }
}

</style>