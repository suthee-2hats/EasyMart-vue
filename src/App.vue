<script setup>
import AppHeader from './template/appHeader.vue'
import AppSideBar from './template/appSideBar.vue'
import AppCategorySelector from './template/appCategorySelector.vue'
</script>

<template>
  <AppHeader />

  <div class="sidebarAndCategories">
    <AppSideBar />

    <main class="categories-main">
      <AppCategorySelector />
    </main>
  </div>
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
</style>
