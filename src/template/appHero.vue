<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import { heroSlides } from '@/script/heroSliders'

const viewport = ref(null)
const track = ref(null)
const isPaused = ref(false)

const loopSlides = computed(() => [...heroSlides, ...heroSlides])

const speed = 50 // Pixels per second

let animationFrame = null
let resizeObserver = null
let motionQuery = null
let motionChangeHandler = null
let lastTime = null
let offset = 0
let loopWidth = 0

const updateLoopWidth = () => {
  if (!track.value) return

  const slides = track.value.children
  const firstSlide = slides[0]
  const firstRepeatedSlide = slides[heroSlides.length]

  if (!firstSlide || !firstRepeatedSlide) return

  loopWidth = firstRepeatedSlide.offsetLeft - firstSlide.offsetLeft

  if (loopWidth > 0) {
    offset %= loopWidth
    track.value.style.transform = `translateX(-${offset}px)`
  }
}

const animate = (now) => {
  if (lastTime === null) {
    lastTime = now
  }

  const delta = (now - lastTime) / 1000
  lastTime = now

  if (!isPaused.value && loopWidth > 0 && track.value) {
    offset = (offset + speed * delta) % loopWidth
    track.value.style.transform = `translateX(-${offset}px)`
  }

  animationFrame = requestAnimationFrame(animate)
}

const startAnimation = () => {
  if (animationFrame !== null) return

  lastTime = null
  animationFrame = requestAnimationFrame(animate)
}

const stopAnimation = () => {
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }

  lastTime = null
}

const pauseCarousel = () => {
  isPaused.value = true
  lastTime = null
}

const resumeCarousel = () => {
  isPaused.value = false
  lastTime = null
}

const handleFocusOut = (event) => {
  // Keep the carousel paused if focus moves to another element inside it.
  if (!event.currentTarget.contains(event.relatedTarget)) {
    resumeCarousel()
  }
}

const handleMotionChange = (event) => {
  if (event.matches) {
    stopAnimation()
  } else {
    startAnimation()
  }
}

onMounted(async () => {
  await nextTick()

  updateLoopWidth()

  if (typeof ResizeObserver !== 'undefined' && viewport.value) {
    resizeObserver = new ResizeObserver(updateLoopWidth)
    resizeObserver.observe(viewport.value)
  }

  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

  if (motionQuery.matches) {
    return
  }

  startAnimation()

  motionChangeHandler = handleMotionChange
  motionQuery.addEventListener('change', motionChangeHandler)
})

onUnmounted(() => {
  stopAnimation()
  resizeObserver?.disconnect()

  if (motionQuery && motionChangeHandler) {
    motionQuery.removeEventListener('change', motionChangeHandler)
  }
})
</script>

<template>
  <section
    class="hero-carousel"
    aria-label="Featured offers"
    @mouseenter="pauseCarousel"
    @mouseleave="resumeCarousel"
    @focusin="pauseCarousel"
    @focusout="handleFocusOut"
  >
    <div ref="viewport" class="hero-carousel__viewport">
      <div ref="track" class="hero-carousel__track">
        <div
          v-for="(slide, index) in loopSlides"
          :key="`${slide.id}-${index}`"
          class="hero-carousel__slide"
          role="group"
          aria-roledescription="slide"
          :aria-label="`${(index % heroSlides.length) + 1} of ${heroSlides.length}`"
          :aria-hidden="index >= heroSlides.length"
        >
          <RouterLink
            :to="slide.link"
            class="hero-carousel__link"
            :tabindex="index >= heroSlides.length ? -1 : 0"
            :aria-hidden="index >= heroSlides.length"
            :aria-label="index < heroSlides.length ? slide.alt : undefined"
          >
            <picture>
              <source media="(max-width: 767px)" :srcset="slide.mobileImage" />

              <source media="(min-width: 768px)" :srcset="slide.desktopImage" />

              <img
                :src="slide.fallbackImage"
                :alt="index < heroSlides.length ? slide.alt : ''"
                width="778"
                height="544"
                :fetchpriority="index === 0 ? 'high' : 'auto'"
                :loading="index === 0 ? 'eager' : 'lazy'"
              />
            </picture>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-carousel {
  width: 100%;
  min-width: 0;
  padding: 32px 24px;
  overflow: hidden;
}

.hero-carousel__viewport {
  width: 100%;
  min-width: 0;
  overflow: hidden;
  border-radius: 32px 0 0 32px;
}

.hero-carousel__track {
  display: flex;
  gap: 8px;
  width: max-content;
  will-change: transform;
}

.hero-carousel__slide {
  flex: 0 0 auto;
  width: clamp(249px, calc(176.16px + 22.7632vw), 422px);
  height: clamp(200px, calc(179.79px + 6.3158vw), 248px);
  max-width: 100%;
  overflow: hidden;
  border-radius: 32px;
}

.hero-carousel__link {
  display: block;
  width: 100%;
  height: 100%;
}

.hero-carousel__link:focus-visible {
  outline: 2px solid #d94fb3;
  outline-offset: -4px;
}

.hero-carousel__link picture {
  display: block;
  width: 100%;
  height: 100%;
}

.hero-carousel__link img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 1080px) {
  .hero-carousel {
    padding: 32px 0 24px 24px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-carousel__track {
    will-change: auto;
  }
}
</style>
