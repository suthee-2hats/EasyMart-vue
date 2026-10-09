
<script setup>
import { ref, reactive, onMounted } from 'vue'
import SideBarFilter from './sidebar/sideBarFilter.vue'

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
    class="product-filters"
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
