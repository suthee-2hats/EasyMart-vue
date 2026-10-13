<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import searchIcon from '@/img/icons/searchIcon32px.svg'
import cartIcon from '@/img/icons/Cart.svg'
import loginIcon from '@/img/icons/Login.svg'

const router = useRouter()

const SEARCH_API = 'https://dummyapi.codesmash.in/api/products/search'
const RESULT_LIMIT = 5
const DEBOUNCE_DELAY = 300

const popularSearch = ref(['Beef', 'Rice', 'Fresh bakery', 'Fruits'])

const query = ref('')
const isDropdownOpen = ref(false)
const products = ref([])
const searchStatus = ref('idle')
const errorMessage = ref('')

let searchTimer
let currentController = null
let latestQueryId = 0

function openDropdown() {
  isDropdownOpen.value = true
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function formatPrice(value) {
  return `$${(Number(value) || 0).toFixed(2)}`
}

function getProductImage(product) {
  return product.thumbnail || product.images?.[0] || ''
}

function cancelPendingSearch() {
  clearTimeout(searchTimer)
  latestQueryId++

  currentController?.abort()
  currentController = null
}

function resetSearchResults() {
  cancelPendingSearch()
  products.value = []
  errorMessage.value = ''
  searchStatus.value = 'idle'
}

async function searchProducts(searchTerm) {
  const term = searchTerm.trim()

  if (!term) {
    resetSearchResults()
    return
  }

  const queryId = ++latestQueryId

  // Stop the previous request before starting another.
  currentController?.abort()

  const controller = new AbortController()
  currentController = controller

  products.value = []
  errorMessage.value = ''
  searchStatus.value = 'loading'
  isDropdownOpen.value = true

  try {
    const response = await fetch(
      `${SEARCH_API}?q=${encodeURIComponent(term)}&limit=${RESULT_LIMIT}`,
      { signal: controller.signal },
    )

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status}`)
    }

    const data = await response.json()

    // Ignore a response if a newer search has started.
    if (queryId !== latestQueryId) return

    // Support either an array or a common object response shape.
    const result = Array.isArray(data)
      ? data
      : Array.isArray(data.products)
        ? data.products
        : Array.isArray(data.data)
          ? data.data
          : []

    products.value = result.slice(0, RESULT_LIMIT)
    searchStatus.value = products.value.length ? 'success' : 'empty'
  } catch (error) {
    if (queryId !== latestQueryId || error.name === 'AbortError') {
      return
    }

    console.error('Product search failed:', error)
    errorMessage.value = navigator.onLine
      ? 'Could not search products. Please try again.'
      : 'You appear to be offline. Check your connection.'

    searchStatus.value = 'error'
  } finally {
    if (currentController === controller) {
      currentController = null
    }
  }
}

// Debounce live typing.
watch(query, (newQuery) => {
  clearTimeout(searchTimer)

  const term = newQuery.trim()

  if (!term) {
    resetSearchResults()
    return
  }

  openDropdown()

  searchTimer = setTimeout(() => {
    searchProducts(term)
  }, DEBOUNCE_DELAY)
})

// Enter submits the current search immediately.
function submitSearch() {
  clearTimeout(searchTimer)

  const term = query.value.trim()

  if (!term) return

  openDropdown()
  searchProducts(term)
}

// Clicking a popular-search chip starts a search.
function pickSearch(term) {
  query.value = term
  openDropdown()

  // Run immediately instead of waiting for the debounce.
  clearTimeout(searchTimer)
  searchProducts(term)
}

// Open the selected product's details page.
async function selectProduct(product) {
  query.value = product.title || ''
  closeDropdown()
  cancelPendingSearch()

  try {
    await router.push(`/products/${product.id}`)
  } catch (error) {
    console.error('Could not open product:', error)
  }
}

// Close the dropdown when clicking outside the search form.
function handleDocumentClick(event) {
  const searchForm = document.querySelector('.header-search')

  if (searchForm && !searchForm.contains(event.target)) {
    closeDropdown()
    cancelPendingSearch()
  }
}

// Escape closes the dropdown.
function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeDropdown()
    cancelPendingSearch()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)

  clearTimeout(searchTimer)
  currentController?.abort()
})
</script>

<template>
  <!-- Header navigation -->
  <nav id="main-navigation" class="header-navigation" aria-label="Main navigation">
    <!-- Search -->

    <form
      class="header-search"
      role="search"
      @submit.prevent="submitSearch"
      @focusin="openDropdown"
    >
      <div class="header-search_inside">
        <label class="sr-only" for="header-search"> Search products </label>

        <div class="search-icon_image">
          <img :src="searchIcon" width="32" height="32" alt="" />
        </div>

        <input
          id="header-search"
          v-model="query"
          type="search"
          name="search"
          placeholder="Search by product name"
          autocomplete="off"
          @focus="openDropdown"
        />
      </div>

      <!-- Search dropdown -->
      <div class="search-dropdown" :class="{ 'is-open': isDropdownOpen }">
        <!-- Popular searches: visible when the input is empty -->
        <div v-if="!query.trim()" class="search-dropdown__popular">
          <p class="search-dropdown__title">
            Popular Search
            <span aria-hidden="true">⚡</span>
          </p>

          <div class="search-dropdown__list">
            <button
              v-for="search in popularSearch"
              :key="search"
              type="button"
              class="search-dropdown__item"
              @click="pickSearch(search)"
            >
              {{ search }}
            </button>
          </div>
        </div>

        <!-- Live product results and search status -->
        <div v-else class="search-dropdown__results" aria-live="polite" aria-atomic="true">
          <p v-if="searchStatus === 'loading'" class="search-dropdown__empty">Searching...</p>

          <p v-else-if="searchStatus === 'empty'" class="search-dropdown__empty">
            No products found for "{{ query }}".
          </p>

          <p
            v-else-if="searchStatus === 'error'"
            class="search-dropdown__empty search-dropdown__empty--error"
          >
            {{ errorMessage }}
            <button type="button" @click="submitSearch">Try again</button>
          </p>

          <button
            v-for="product in products"
            v-else-if="searchStatus === 'success'"
            :key="product.id"
            type="button"
            class="search-dropdown__product"
            @click="selectProduct(product)"
          >
            <span class="search-dropdown__product-image">
              <img
                :src="getProductImage(product)"
                :alt="product.title || 'Product'"
                width="48"
                height="48"
              />
            </span>

            <span class="search-dropdown__product-info">
              <span class="search-dropdown__product-title">
                {{ product.title || 'Product' }}
              </span>

              <span class="search-dropdown__product-price">
                {{ formatPrice(product.price) }}
              </span>
            </span>
          </button>
        </div>
      </div>
    </form>

    <!-- Cart -->
    <RouterLink to="/cart" class="header-cart" aria-label="Shopping cart, 14 items">
      <div class="card-imageAndNumber">
        <img :src="cartIcon" width="20" height="20" alt="" />

        <span class="cart-count" aria-hidden="true">14</span>
      </div>

      <span class="cart-label">Cart</span>
    </RouterLink>

    <!-- Login -->
    <button type="button" class="header-login" aria-label="Login to your EasyMart account">
      <img :src="loginIcon" width="16" height="16" alt="" />

      <span>Login</span>
    </button>
  </nav>
</template>

<style scoped>
.header-search {
  position: relative;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 100;
  width: 100%;
  padding: 16px;
  border: 1px solid #f0eef0;
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 8px 32px rgb(0 0 0 / 8%);

  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translateY(-8px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    visibility 0.2s ease;
}

.search-dropdown.is-open {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translateY(0);
}

.search-dropdown__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.search-dropdown__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.search-dropdown__item {
  padding: 8px 12px;
  border: 0;
  border-radius: 20px;
  background: #f8f7f8;
  cursor: pointer;
}

.search-dropdown__results {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.search-dropdown__product {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 8px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.search-dropdown__product:hover,
.search-dropdown__product:focus-visible {
  background: #f8f7f8;
}

.search-dropdown__product:focus-visible {
  outline: 2px solid #b6349a;
  outline-offset: 2px;
}

.search-dropdown__product-image {
  display: flex;
  flex: 0 0 48px;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  overflow: hidden;
  border-radius: 8px;
  background: #fff5fc;
}

.search-dropdown__product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.search-dropdown__product-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.search-dropdown__product-title {
  overflow: hidden;
  font-size: 14px;
  color: #171717;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-dropdown__product-price {
  font-size: 13px;
  font-weight: 600;
  color: #117e11;
}

.search-dropdown__empty {
  margin: 0;
  padding: 12px 4px;
  color: #555;
  font-size: 14px;
}

.search-dropdown__empty--error {
  color: #b42318;
}

@media (prefers-reduced-motion: reduce) {
  .search-dropdown {
    transition: none;
  }
}
</style>
