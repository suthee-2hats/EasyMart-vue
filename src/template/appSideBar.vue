
<script setup>
import { ref, reactive, onMounted } from 'vue'
import SideBarFilter from './sidebar/sideBarFilter.vue'

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const filters = [
  {
    title: 'Price',
    name: 'price',
    options: [
      { label: 'All', value: 'all' },
      { label: 'Under $100', value: '0-100' },
      { label: '$100 - $500', value: '100-500' },
      { label: '$500 - $1,000', value: '500-1000' },
      { label: '$1,000 & Above', value: '1000-plus' }
    ]
  },
  {
    title: 'Discount',
    name: 'discount',
    options: [
      { label: 'All', value: 'all' },
      { label: '10% & Above', value: 10 },
      { label: '20% & Above', value: 20 },
      { label: '30% & Above', value: 30 },
      { label: '50% & Above', value: 50 }
    ]
  },
  {
    title: 'Rating',
    name: 'rating',
    options: [
      { label: 'All', value: 'all' },
      { label: '4 ★ & Above', value: 4 },
      { label: '3 ★ & Above', value: 3 },
      { label: '2 ★ & Above', value: 2 }
    ]
  }
]

// One reactive value per filter group
const selectedFilters = reactive({
  price: 'all',
  discount: 'all',
  rating: 'all'
})

// Reset all filters together
function resetFilters() {
  selectedFilters.price = 'all'
  selectedFilters.discount = 'all'
  selectedFilters.rating = 'all'
}

// Sidebar user information
const user = ref({
  name: 'Loading...',
  image: ''
})

onMounted(async () => {
  try {
    const response = await fetch(
      'https://dummyapi.codesmash.in/api/users/1'
    )

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    const data = await response.json()
    const userData = data.data ?? data

    user.value = {
      name: userData.name ?? 'User',
      image: userData.image ?? userData.avatar ?? ''
    }
  } catch (error) {
    console.error('Could not load sidebar user:', error)

    user.value = {
      name: 'User',
      image: ''
    }
  }
})
</script>

<template>
  <aside
    id="product-filters"
    class="product-filters"
    :class="{ 'is-open': isOpen }"
    aria-label="Product filters"
  >
    <!-- Sidebar heading -->
    <div class="product-filters__header">
      <h2 class="product-filters__title">
        Filters
      </h2>

      <button
        type="button"
        class="product-filters__reset"
        @click="resetFilters"
      >
        Reset
      </button>

      <button
        type="button"
        class="product-filters__close"
        aria-label="Close filters"
        @click="emit('close')"
      >
        &times;
      </button>
    </div>

    <!-- Filter form -->
    <form
      id="product-filter-form"
      class="product-filters__form"
      @submit.prevent
    >
      <SideBarFilter
        v-for="filter in filters"
        :key="filter.name"
        :title="filter.title"
        :name="filter.name"
        :options="filter.options"
        v-model="selectedFilters[filter.name]"
      />
    </form>

    <!-- User information -->
    <div
      class="product-filters__user"
      aria-label="User information"
    >
      <div class="product-filters__user-image">
        <img
          v-if="user.image"
          :src="user.image"
          :alt="user.name"
          width="56"
          height="56"
        />

        <span
          v-else
          class="product-filters__user-placeholder"
          aria-hidden="true"
        >
          {{ user.name.charAt(0).toUpperCase() }}
        </span>
      </div>

      <div class="product-filters__user-info">
        <span class="product-filters__user-name">
          {{ user.name }}
        </span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.product-filters {
    display: flex;
    flex-direction: column;
    width: 274px;
    padding: 20px;
    background: var(--c-white);
}

.product-filters span {
    font-size: 16px;
}

.product-filters__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 3px;
    margin-bottom: 14px;
}

.product-filters__title {
    margin: 0;
    font-family: var(--font-family);
    font-size: 16px;
    font-weight: 700;
    color: #0d0c0d;
}

.product-filters__reset {
    padding: 0;
    border: 0;
    background: transparent;
    font-family: var(--font-family);
    font-size: 14px;
    font-weight: 700;
    color: var(--c-primary);
    cursor: pointer;
}

.product-filters__reset:focus-visible {
    outline: 2px solid var(--c-primary);
    outline-offset: 2px;
}

.product-filters__close {
    display: none;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #0d0c0d;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
}

.product-filters__close:hover {
    background: #f0eef0;
}

.product-filters__form {
   
    padding: 24px;
    background: rgba(248, 247, 248, 0.68);
    border-radius: 20px;
}

.product-filters__user {
    display: flex;
    align-items: center;
    width: 100%;
    margin-top: auto;
    padding-top: 32px;
    border-top: 1px solid #f0eef0;
}

.product-filters__user-image {
    width: 56px;
    height: 56px;
    flex: 0 0 56px;
    overflow: hidden;
    border-radius: 50%;
    background: #f8f7f8;
}

.product-filters__user-image img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.product-filters__user-placeholder {
    font-size: 20px;
    font-weight: 600;
    color: #b6349a;
}

.product-filters__user-info {
    min-width: 0;
    margin-left: 12px;
}

.product-filters__user-name {
    display: block;
    overflow: hidden;
    color: #171717;
    font-size: 16px;
    font-weight: 600;
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
}

@media (max-width: 1080px) {
    .product-filters__close {
        display: inline-flex;
    }

    .product-filters {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        height: 100dvh;
        overflow-x: hidden;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        scrollbar-color: #d5d2d5 transparent;
        max-width: 100%;
        transform: translateX(-100%);
        visibility: hidden;
        transition:
            transform 0.3s ease,
            visibility 0.3s ease;
        z-index: 1100;
    }

    .product-filters::-webkit-scrollbar {
        width: 6px;
    }

    .product-filters::-webkit-scrollbar-track {
        background: transparent;
    }

    .product-filters::-webkit-scrollbar-thumb {
        border-radius: 3px;
        background: #d5d2d5;
    }

    .product-filters::-webkit-scrollbar-thumb:hover {
        background: #b0adb0;
    }

    .product-filters.is-open {
        transform: translateX(0);
        visibility: visible;
        z-index: 9999;
    }
}
</style>
