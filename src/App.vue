<script setup>
import { ref, nextTick } from 'vue'
import AppHeader from './template/appHeader.vue'
import AppSideBar from './template/appSideBar.vue'
import AppCategorySelector from './template/appCategorySelector.vue'
import AppHero from './template/appHero.vue'
import AppProductSection from './template/appProductSection.vue'

const isSidebarOpen = ref(false)
const selectedCategories = ref([])

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}

function handleCategoryReady(category) {
  if (!category?.slug) return
  selectedCategories.value = [category]
}

async function handleCategorySelected(category) {
  if (!category?.slug) return
  if (selectedCategories.value.some((item) => item.slug === category.slug)) return

  selectedCategories.value.push(category)

  await nextTick()
  document
    .getElementById(`category-${category.slug}`)
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
  <AppHeader :is-sidebar-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />

  <div class="sidebarAndCategories">
    <AppSideBar :is-open="isSidebarOpen" @close="closeSidebar" />

    <main class="categories-main">
      <AppCategorySelector
        @category-ready="handleCategoryReady"
        @category-selected="handleCategorySelected"
      />

      <AppHero />

      <AppProductSection
        v-for="category in selectedCategories"
        :id="`category-${category.slug}`"
        :key="category.slug"
        :category="category"
      />
    </main>
  </div>

  <div v-if="isSidebarOpen" class="sidebar-overlay" @click="closeSidebar"></div>
</template>

<style scoped>
.sidebarAndCategories {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.categories-main {
  flex: 1 1 0;
  min-width: 0;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 1090;
  background: rgb(0 0 0 / 40%);
}

@media (min-width: 1081px) {
  .sidebar-overlay {
    display: none;
  }
}
</style>
