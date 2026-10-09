<script setup>
import {ref} from 'vue'
import appSearch from './appSearch.vue'
import logo from '@/img/icons/logoEasyMart.jpg'
import menuIcon from '@/img/icons/menu.svg'

const location = ref(' 10115 New York')

</script>

<template>
    <header class="header sticky-top">
        <div class="container">
            <div class="header-inner">

                <!-- Mobile Menu Button -->
                <button
                    type="button"
                    class="menu-mobile-trigger btn"
                    aria-label="Open navigation menu"
                    aria-controls="main-navigation"
                    aria-expanded="false"
                    
                >
                    <img
                        :src="menuIcon"
                        alt=""
                        width="20"
                        height="20"
                    >
                </button>

                <!-- Logo -->
                <div class="header-item-left">
                    <RouterLink
                        to="/"
                        class="brand"
                        aria-label="EasyMart home"
                    >
                        <img
                            :src="logo"
                            width="134"
                            height="32"
                            alt="EasyMart"
                        >
                    </RouterLink>

                                       <!-- Location -->
                 <div class="header-location">

                    <img src="@/img/icons/Location.svg" width="24" height="24" alt="location image">

                         <span>
                          {{ location }}
                         </span>

                         <button
                               type="button"
                               class="location-toggle btn"
                                aria-label="Change location"
                             >
                            <img src="@/img/icons/LocationArrowDown.svg" width="14" height="14" alt="location arrow">
                         </button>

                  </div>

                </div>

 
                <!-- Header Navigation / Controls -->
                <div class="header-item-right">
                    <appSearch></appSearch>
                    <!-- Navigation will come here -->
                </div>

            </div>
        </div>
    </header>
</template>

<style scoped>
.menu-mobile-trigger{

    display: none;
}
.btn{
    background-color: transparent;
    border: none;
}

.header-location{
    display: flex;
    flex-direction: row;
    align-items: center;
}
</style>