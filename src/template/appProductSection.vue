<script setup>
import { ref, watch, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  category: {
    type: Object,
    default: null,
  },
})

const API_URL = 'https://dummyapi.codesmash.in/api/products'
const PRODUCTS_PER_PAGE = 20

const products = ref([])
const isLoading = ref(false)
const errorMessage = ref('')
const track = ref(null)
const viewport = ref(null)
const currentIndex = ref(0)

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
  if (!track.value) return

  const firstCard = track.value.querySelector('.product-card')

  if (!firstCard) {
    track.value.style.transform = 'translateX(0)'
    currentIndex.value = 0
    return
  }

  const gap = Number.parseFloat(getComputedStyle(track.value).columnGap) || 0
  const cardWidth = firstCard.getBoundingClientRect().width
  const maxIndex = getBounds()

  currentIndex.value = Math.min(currentIndex.value, maxIndex)

  track.value.style.transform = `translateX(-${currentIndex.value * (cardWidth + gap)}px)`
}

const moveProducts = (direction) => {
  currentIndex.value = Math.max(0, Math.min(getBounds(), currentIndex.value + direction))

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
    const params = new URLSearchParams({
      limit: String(PRODUCTS_PER_PAGE),
      skip: '0',
      category: category.slug,
    })

    const response = await fetch(`${API_URL}?${params}`, {
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
              :disabled="currentIndex >= getBounds() || isLoading"
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

          <div v-else ref="track" class="product-section__group-track">
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
              v-for="product in products"
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

<style scoped>
.product-section {
  width: 100%;
  min-width: 0;
}

.product-section__track,
.product-section__group,
.product-section__viewport {
  width: 100%;
  min-width: 0;
}

.product-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.product-section__title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.product-section__controls {
  display: flex;
  gap: 8px;
}

.product-section__control {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e5e3e5;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
}

.product-section__control:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.product-section__control:focus-visible {
  outline: 2px solid #d94fb3;
  outline-offset: 3px;
}

.product-section__viewport {
  overflow: hidden;
}

.product-section__group-track {
  display: flex;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  transition: transform 300ms ease;
}

.product-card {
  flex: 0 0 calc((100% - 80px) / 6);
  min-width: 0;
}

.product-card__image {
  display: block;
  overflow: hidden;
  border-radius: 16px;
  background: #f8f7f8;
  aspect-ratio: 1;
}

.product-card__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-card__name-link {
  display: block;
  margin-top: 12px;
  color: inherit;
  text-decoration: none;
}

.product-card__name {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.product-card__priceAndStock {
  margin-top: 8px;
}

.product-card__pricePerLb p {
  overflow: hidden;
  margin: 0 0 6px;
  color: #666;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-card__price {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
}

.product-card__price strong {
  font-size: 16px;
}

.product-card__price del {
  color: #888;
  font-size: 12px;
}

.product-card__stock {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

.product-card--loading {
  animation: skeleton-pulse 1.2s ease-in-out infinite alternate;
}

.product-card--loading .product-card__image {
  aspect-ratio: 1;
}

.product-card__bar {
  height: 12px;
  margin-top: 12px;
  border-radius: 6px;
  background: #e7e6e7;
}

.product-card__bar--short {
  width: 60%;
}

.product-section__message {
  padding: 24px 0;
}

.product-section__message button {
  margin-left: 8px;
}

@keyframes skeleton-pulse {
  to {
    opacity: 0.5;
  }
}

@media (max-width: 1080px) {
  .product-card {
    flex-basis: calc((100% - 48px) / 4);
  }
}

@media (max-width: 767px) {
  .product-card {
    flex-basis: calc((100% - 16px) / 2);
  }
}

@media (prefers-reduced-motion: reduce) {
  .product-section__group-track {
    transition: none;
  }

  .product-card--loading {
    animation: none;
  }
}
</style>
