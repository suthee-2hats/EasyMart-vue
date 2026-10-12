<script setup>
import { ref } from 'vue'

import searchIcon from '@/img/icons/searchIcon32px.svg'
import cartIcon from '@/img/icons/Cart.svg'
import loginIcon from '@/img/icons/Login.svg'

const popularSearch = ref(['Beef', 'Rice', 'Fresh bakery', 'Fruits'])

const query = ref('')
const isDropdownOpen = ref(false)

function openDropdown() {
  isDropdownOpen.value = true
}

function closeDropdown() {
  isDropdownOpen.value = false
}

function pickSearch(term) {
  query.value = term
  closeDropdown()
}

function onFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    closeDropdown()
  }
}
</script>

<template>
  <!-- Header navigation -->
  <nav
    id="main-navigation"
    class="header-navigation"
    aria-label="Main navigation"
  >
    <!-- Search -->
    <form
      class="header-search"
      role="search"
      @submit.prevent
      @focusin="openDropdown"
      @focusout="onFocusOut"
      @keydown.esc="closeDropdown"
    >
      <div class="header-search_inside">
        <label class="sr-only" for="header-search">
          Search products
        </label>

        <div class="search-icon_image">
          <img
            :src="searchIcon"
            width="32"
            height="32"
            alt=""
          />
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
      <div
        class="search-dropdown"
        :class="{ 'is-open': isDropdownOpen }"
      >
        <!-- Popular searches -->
        <div class="search-dropdown__popular">
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

        <!-- Product results -->
        <div
          class="search-dropdown__results"
          aria-live="polite"
        ></div>
      </div>
    </form>

    <!-- Cart -->
    <RouterLink
      to="/cart"
      class="header-cart"
      aria-label="Shopping cart, 14 items"
    >
      <div class="card-imageAndNumber">
        <img
          :src="cartIcon"
          width="20"
          height="20"
          alt=""
        />

        <span class="cart-count" aria-hidden="true">14</span>
      </div>

      <span class="cart-label">Cart</span>
    </RouterLink>

    <!-- Login -->
    <button
      type="button"
      class="header-login"
      aria-label="Login to your EasyMart account"
    >
      <img
        :src="loginIcon"
        width="16"
        height="16"
        alt=""
      />

      <span>Login</span>
    </button>
  </nav>
</template>

<style scoped>
</style>
