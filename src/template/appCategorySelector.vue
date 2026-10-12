<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['category-ready', 'category-selected'])

const API_URL = 'https://dummyapi.codesmash.in/api/products/categories'

const CATEGORY_ICONS = {
  automotive: '1F697',
  beauty: '1F484',
  electronics: '1F5A5',
  fragrances: '1F338',
  furniture: '1F6CB',
  groceries: '1F6D2',
  'home-decoration': '1F5BC',
  'kitchen-accessories': '1F37D',
  laptops: '1F4BB',
  lighting: '1F4A1',
  'mens-shirts': '1F455',
  'mens-shoes': '1F45E',
  'mens-watches': '231A',
  motorcycle: '1F3CD',
  skincare: '1F9F4',
  smartphones: '1F4F1',
  'sports-accessories': '26BD',
  sunglasses: '1F576',
  tops: '1F3BD',
  'womens-bags': '1F45C',
  'womens-dresses': '1F457',
  'womens-jewellery': '1F48E',
  'womens-shoes': '1F460',
  'womens-watches': '231A',
}

const ICON_BASE = 'https://cdn.jsdelivr.net/npm/openmoji@15.0.0/color/svg'

// Reactive state
const categories = ref([])
const activeCategory = ref('')
const isLoading = ref(true)
const errorMessage = ref('')
const categoryList = ref(null)

// Convert "home-decoration" to "Home Decoration"
const toLabel = (slug) =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

// Get the icon URL for a category
const getIconUrl = (slug) => `${ICON_BASE}/${CATEGORY_ICONS[slug] || '1F4E6'}.svg`

// Select a category
const selectCategory = (slug) => {
  activeCategory.value = slug

  emit('category-selected', {
    slug,
    label: toLabel(slug),
  })
}

// Fetch categories
const fetchCategories = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(API_URL)

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`)
    }

    const data = await response.json()

    if (!Array.isArray(data)) {
      throw new Error('The categories response is not an array')
    }

    categories.value = data

    if (categories.value.length > 0) {
      activeCategory.value = categories.value[0]

      emit('category-ready', {
        slug: categories.value[0],
        label: toLabel(categories.value[0]),
      })
    }
  } catch (error) {
    console.error('Failed to load categories:', error)
    errorMessage.value = 'Categories could not be loaded.'
  } finally {
    isLoading.value = false
  }
}

// Convert vertical wheel movement into horizontal scrolling
const handleWheel = (event) => {
  if (event.deltaY === 0 || !categoryList.value) return

  event.preventDefault()
  categoryList.value.scrollLeft += event.deltaY
}

onMounted(() => {
  fetchCategories()

  categoryList.value?.addEventListener('wheel', handleWheel, {
    passive: false,
  })
})

onUnmounted(() => {
  categoryList.value?.removeEventListener('wheel', handleWheel)
})
</script>

<template>
  <div class="container">
    <nav
      ref="categoryList"
      class="category-list"
      aria-label="Product categories"
      :aria-busy="isLoading"
    >
      <!-- Accessible loading/error status -->
      <span class="sr-only" role="status" aria-live="polite">
        {{ isLoading ? 'Loading categories' : errorMessage ? errorMessage : 'Categories loaded' }}
      </span>

      <!-- Loading skeletons -->
      <template v-if="isLoading">
        <button
          v-for="index in 6"
          :key="index"
          type="button"
          class="category-list__item category-list__item--skeleton"
          disabled
          aria-hidden="true"
          tabindex="-1"
        >
          <span class="category-list__skeleton-bar"></span>
        </button>
      </template>

      <!-- Error message -->
      <p v-else-if="errorMessage" role="alert">
        {{ errorMessage }}
        <button type="button" @click="fetchCategories">Try again</button>
      </p>

      <!-- Category buttons -->
      <button
        v-for="slug in categories"
        v-else
        :key="slug"
        type="button"
        class="category-list__item"
        :class="{
          'category-list__item--active': activeCategory === slug,
        }"
        :data-slug="slug"
        :aria-pressed="activeCategory === slug"
        @click="selectCategory(slug)"
      >
        <span class="category-list__icon">
          <span class="category-list__icon-wrapper">
            <img :src="getIconUrl(slug)" alt="" width="32" height="32" loading="lazy" />
          </span>
        </span>

        <span class="category-list__name">
          {{ toLabel(slug) }}
        </span>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.category-list {
  display: flex;
  align-items: center;
  gap: 16px;

  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 24px 24px 0;

  scrollbar-width: none;
}

.category-list::-webkit-scrollbar {
  display: none;
}

.category-list__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  flex: 0 0 auto;
  width: auto;
  height: 48px;
  padding: 11px 16px 11px 8px;

  border: 1px solid transparent;
  border-radius: 32px;

  background: #f8f7f8;
  color: #171717;

  font: inherit;
  font-size: 20px;
  line-height: 24px;
  font-weight: 400;

  white-space: nowrap;
  cursor: pointer;

  transition:
    background-color 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

/* Hover only when the category is not active */
.category-list__item:hover:not(.category-list__item--active) {
  background: #ffffff;
  border-color: #d9d6d9;
  box-shadow: 0 2px 6px rgba(23, 23, 23, 0.08);
}

/* Keyboard focus */
.category-list__item:focus-visible {
  outline: 2px solid #d94fb3;
  outline-offset: 3px;
}

/* Loading skeleton */
.category-list__item--skeleton {
  pointer-events: none;
  cursor: default;
  background: #f3f2f3;

  position: relative;
  overflow: hidden;
}

.category-list__item--skeleton::after {
  content: '';

  position: absolute;
  inset: 0;

  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.65), transparent);

  transform: translateX(-100%);
  animation: category-skeleton 1.4s infinite;
}

/* Active category */
.category-list__item--active {
  background: #fef5fd;
  border-color: #d52da5;
}

.category-list__item--active .category-list__icon {
  background: #ec86d8;
}

/* Skeleton placeholder bar */
.category-list__skeleton-bar {
  display: block;

  width: 72px;
  height: 12px;

  border-radius: 6px;
  background: #e7e6e7;
}

/* Category icon */
.category-list__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 26px;
  height: 26px;
  flex: 0 0 26px;

  border-radius: 50%;
  background: #f0eef0;
  overflow: hidden;
}

.category-list__icon img {
  display: block;

  width: 26px;
  height: 26px;

  object-fit: contain;
}

/* Category name */
.category-list__name {
  white-space: nowrap;

  font-size: 14px;
  line-height: 20px;
}

/* Skeleton animation */
@keyframes category-skeleton {
  100% {
    transform: translateX(100%);
  }
}

/* Accessibility: respect reduced-motion preferences */
@media (prefers-reduced-motion: reduce) {
  .category-list__item {
    transition: none;
  }

  .category-list__item--skeleton::after {
    animation: none;
  }
}

/* Replaces the tablet-lg() mixin.
   Adjust 1080px if your original mixin uses another breakpoint. */
@media (max-width: 1080px) {
  .category-list {
    padding-left: 24px;
  }
}
</style>
