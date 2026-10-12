<script setup>
import { ref } from 'vue'
import AppHeader from './template/appHeader.vue'
import AppSideBar from './template/appSideBar.vue'
import AppCategorySelector from './template/appCategorySelector.vue'
import AppHero from './template/appHero.vue'
import AppProductSection from './template/appProductSection.vue'

const isSidebarOpen = ref(false)

function toggleSidebar() {
  isSidebarOpen.value = !isSidebarOpen.value
}

function closeSidebar() {
  isSidebarOpen.value = false
}
</script>

<template>
  <AppHeader :is-sidebar-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />

  <div class="sidebarAndCategories">
    <AppSideBar :is-open="isSidebarOpen" @close="closeSidebar" />

    <main class="categories-main">
      <AppCategorySelector
        @category-ready="handleCategoryChange"
        @category-selected="handleCategoryChange"
      />

      <AppHero />

      <AppProductSection :category="selectedCategory" />
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
