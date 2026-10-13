<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    default: null,
  },
  filters: {
    type: Object,
    required: true,
  },
})

const API_URL = 'https://dummyapi.codesmash.in/api/products'

const products = ref([])
const filteredProducts = computed(() => {
  return products.value.filter((product) => {
    const price = Number(product.price) || 0
    const discount = Number(product.discountPercentage) || 0
    const rating = Number(product.rating) || 0

    // 1. Price
    const priceFilter = props.filters.price

    let matchesPrice = true

    if (priceFilter === '0-100') {
      matchesPrice = price < 100
    } else if (priceFilter === '100-500') {
      matchesPrice = price >= 100 && price < 500
    } else if (priceFilter === '500-1000') {
      matchesPrice = price >= 500 && price < 1000
    } else if (priceFilter === '1000-plus') {
      matchesPrice = price >= 1000
    }

    // 2. Discount
    const minDiscount = props.filters.discount === 'all' ? 0 : Number(props.filters.discount)

    const matchesDiscount = discount >= minDiscount

    // 3. Rating
    const minRating = props.filters.rating === 'all' ? 0 : Number(props.filters.rating)

    const matchesRating = rating >= minRating

    // All selected filter groups must match.
    return matchesPrice && matchesDiscount && matchesRating
  })
})
const isLoading = ref(false)
const errorMessage = ref('')
const track = ref(null)
const viewport = ref(null)
const currentIndex = ref(0)
const maxIndex = ref(0)

let requestController = null
let requestId = 0
let resizeObserver = null

const formatPrice = (value) => `$${(Number(value) || 0).toFixed(2)}`

const originalPrice = (product) => {
  const price = Number(product.price) || 0
  const discount = Number(product.discountPercentage) || 0

  if (!price || discount <= 0 || discount >= 100) return null

  return price / (1 - discount / 100)
}

const getImage = (product) => product.thumbnail || product.images?.[0] || ''

const getBounds = () => {
  if (!track.value || !viewport.value) return 0

  const cards = track.value.querySelectorAll('.product-card')
  if (!cards.length) return 0

  const firstCard = cards[0]
  const gap = Number.parseFloat(getComputedStyle(track.value).columnGap) || 0
  const cardWidth = firstCard.getBoundingClientRect().width
  const visibleCount = Math.max(
    1,
    Math.floor((viewport.value.clientWidth + gap) / (cardWidth + gap)),
  )

  return Math.max(0, cards.length - visibleCount)
}

const updatePosition = () => {
  if (!track.value) {
    maxIndex.value = 0
    return
  }

  const firstCard = track.value.querySelector('.product-card')

  if (!firstCard) {
    track.value.style.transform = 'translateX(0)'
    currentIndex.value = 0
    maxIndex.value = 0
    return
  }

  const gap = Number.parseFloat(getComputedStyle(track.value).columnGap) || 0
  const cardWidth = firstCard.getBoundingClientRect().width

  maxIndex.value = getBounds()
  currentIndex.value = Math.min(currentIndex.value, maxIndex.value)

  track.value.style.transform = `translateX(-${currentIndex.value * (cardWidth + gap)}px)`
}

const moveProducts = (direction) => {
  currentIndex.value = Math.max(0, Math.min(maxIndex.value, currentIndex.value + direction))

  updatePosition()
}

const fetchProducts = async (category) => {
  requestController?.abort()

  if (!category?.slug) {
    products.value = []
    isLoading.value = false
    errorMessage.value = ''
    return
  }

  const id = ++requestId
  requestController = new AbortController()

  isLoading.value = true
  errorMessage.value = ''
  products.value = []
  currentIndex.value = 0

  try {
    const response = await fetch(`${API_URL}/category/${encodeURIComponent(category.slug)}`, {
      signal: requestController.signal,
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    const data = await response.json()

    // Supports either a plain array or an object containing products.
    const result = Array.isArray(data) ? data : data.products

    if (!Array.isArray(result)) {
      throw new Error('Unexpected products response format')
    }

    if (id !== requestId) return

    products.value = result
  } catch (error) {
    if (error.name === 'AbortError' || id !== requestId) return

    console.error('Failed to load products:', error)
    errorMessage.value = 'Products could not be loaded. Please try again.'
  } finally {
    if (id === requestId) {
      isLoading.value = false
      requestController = null
      await nextTick()
      updatePosition()
    }
  }
}

watch(
  () => props.category?.slug,
  () => fetchProducts(props.category),
  { immediate: true },
)

watch(filteredProducts, async () => {
  currentIndex.value = 0

  await nextTick()
  updatePosition()
})

onMounted(() => {
  if (typeof ResizeObserver === 'undefined' || !viewport.value) return

  resizeObserver = new ResizeObserver(() => updatePosition())
  resizeObserver.observe(viewport.value)
})

onUnmounted(() => {
  requestController?.abort()
  resizeObserver?.disconnect()
})
</script>

<template>
  <section class="product-section" aria-label="Products" :aria-busy="isLoading">
    <div class="product-section__track">
      <section class="product-section__group">
        <div class="product-section__header">
          <h2 class="product-section__title">
            {{ category?.label || 'Products' }}
          </h2>

          <div class="product-section__controls" aria-label="Product navigation">
            <button
              type="button"
              class="product-section__control"
              aria-label="Previous products"
              :disabled="currentIndex === 0 || isLoading"
              @click="moveProducts(-1)"
            >
              <span aria-hidden="true">&lsaquo;</span>
            </button>

            <button
              type="button"
              class="product-section__control"
              aria-label="Next products"
              :disabled="currentIndex >= maxIndex || isLoading"
              @click="moveProducts(1)"
            >
              <span aria-hidden="true">&rsaquo;</span>
            </button>
          </div>
        </div>

        <div ref="viewport" class="product-section__viewport">
          <p v-if="errorMessage" class="product-section__message" role="alert">
            {{ errorMessage }}
            <button type="button" @click="fetchProducts(category)">Try again</button>
          </p>

          <p v-else-if="!isLoading && !products.length" class="product-section__message">
            No products found in this category.
          </p>

          <p v-else-if="!isLoading && !filteredProducts.length" class="product-section__message">
            No products match your selected filters.
          </p>

          <div
            v-else-if="isLoading || filteredProducts.length"
            ref="track"
            class="product-section__group-track"
          >
            <template v-if="isLoading">
              <article
                v-for="index in 6"
                :key="`skeleton-${index}`"
                class="product-card product-card--loading"
                aria-hidden="true"
              >
                <div class="product-card__image"></div>
                <div class="product-card__bar"></div>
                <div class="product-card__bar product-card__bar--short"></div>
              </article>
            </template>

            <article
              v-for="product in filteredProducts"
              v-else
              :key="product.id"
              class="product-card"
              :data-price="Number(product.price) || 0"
              :data-discount="Number(product.discountPercentage) || 0"
              :data-rating="Number(product.rating) || 0"
            >
              <RouterLink
                class="product-card__image"
                :to="`/products/${product.id}`"
                :aria-label="`View ${product.title}`"
              >
                <img
                  :src="getImage(product)"
                  :alt="product.title || 'Product'"
                  loading="lazy"
                  width="240"
                  height="240"
                />
              </RouterLink>

              <RouterLink class="product-card__name-link" :to="`/products/${product.id}`">
                <h3 class="product-card__name">
                  {{ product.title || 'Product' }}
                </h3>
              </RouterLink>

              <div class="product-card__priceAndStock">
                <div class="product-card__pricePerLb">
                  <p>{{ product.brand || '' }}</p>
                </div>

                <div class="product-card__price">
                  <strong>{{ formatPrice(product.price) }}</strong>
                  <del v-if="originalPrice(product)">
                    {{ formatPrice(originalPrice(product)) }}
                  </del>
                </div>

                <div class="product-card__stock">
                  <span>
                    {{ Number(product.stock) > 0 ? 'In stock' : 'Out of stock' }}
                  </span>
                  <span aria-hidden="true">|</span>
                  <span>{{ Number(product.stock) || 0 }} Left</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  </section>
</template>
